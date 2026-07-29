-- =====================================================================
-- Sabor POS - Migracion 02
-- Facturacion (IVA, descuentos) y cierres de caja (turnos + arqueo)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columnas comerciales en sales
-- ---------------------------------------------------------------------
alter table public.sales
  add column if not exists subtotal_amount numeric(12,2) not null default 0 check (subtotal_amount >= 0),
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists tax_rate numeric(5,4) not null default 0 check (tax_rate >= 0),
  add column if not exists tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0);

-- ---------------------------------------------------------------------
-- 2. Tabla de turnos de caja (cash shifts)
-- ---------------------------------------------------------------------
create table if not exists public.cash_shifts (
  id uuid primary key default gen_random_uuid(),
  opened_by uuid not null references auth.users(id) on delete restrict,
  opening_amount numeric(12,2) not null default 0 check (opening_amount >= 0),
  closing_amount numeric(12,2),
  expected_amount numeric(12,2),
  cash_sales_total numeric(12,2) not null default 0,
  difference numeric(12,2),
  status text not null default 'open' check (status in ('open', 'closed')),
  notes text,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz
);

-- Solo un turno abierto por usuario a la vez
create unique index if not exists cash_shifts_one_open_per_user
  on public.cash_shifts (opened_by)
  where status = 'open';

-- Asociacion de ventas al turno activo
alter table public.sales
  add column if not exists shift_id uuid references public.cash_shifts(id) on delete set null;

-- ---------------------------------------------------------------------
-- 3. register_sale con IVA y descuentos + asociacion a turno
-- ---------------------------------------------------------------------
drop function if exists public.register_sale(text, text, jsonb);

create or replace function public.register_sale(
  p_customer_name text,
  p_payment_method text,
  p_items jsonb,
  p_discount numeric default 0,
  p_tax_rate numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  sale_id uuid := gen_random_uuid();
  generated_invoice text;
  item_record jsonb;
  db_product public.products%rowtype;
  line_quantity integer;
  line_subtotal numeric(12,2);
  gross_subtotal numeric(12,2) := 0;
  safe_discount numeric(12,2);
  safe_tax_rate numeric(5,4);
  taxable_base numeric(12,2);
  tax_value numeric(12,2);
  total_sale numeric(12,2);
  active_shift uuid;
begin
  if current_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta debe incluir al menos un producto';
  end if;

  generated_invoice := public.generate_invoice_number();

  -- Validar stock y calcular subtotal bruto
  for item_record in select * from jsonb_array_elements(p_items)
  loop
    select * into db_product
    from public.products
    where id = (item_record ->> 'product_id')::uuid
    for update;

    if db_product.id is null then
      raise exception 'Producto no encontrado';
    end if;

    line_quantity := greatest((item_record ->> 'quantity')::integer, 0);

    if line_quantity <= 0 then
      raise exception 'Cantidad invalida';
    end if;

    if db_product.stock < line_quantity then
      raise exception 'Stock insuficiente para %', db_product.name;
    end if;

    gross_subtotal := gross_subtotal + (db_product.sale_price * line_quantity);
  end loop;

  -- Calculos comerciales
  safe_discount := least(greatest(coalesce(p_discount, 0), 0), gross_subtotal);
  safe_tax_rate := greatest(coalesce(p_tax_rate, 0), 0);
  taxable_base := gross_subtotal - safe_discount;
  tax_value := round(taxable_base * safe_tax_rate, 2);
  total_sale := taxable_base + tax_value;

  -- Turno de caja activo del usuario (si existe)
  select id into active_shift
  from public.cash_shifts
  where opened_by = current_user_id and status = 'open'
  order by opened_at desc
  limit 1;

  insert into public.sales (
    id, invoice_number, customer_name, payment_method,
    subtotal_amount, discount_amount, tax_rate, tax_amount, total_amount,
    created_by, shift_id
  )
  values (
    sale_id, generated_invoice, nullif(trim(p_customer_name), ''), p_payment_method,
    gross_subtotal, safe_discount, safe_tax_rate, tax_value, total_sale,
    current_user_id, active_shift
  );

  -- Lineas + descuento de inventario
  for item_record in select * from jsonb_array_elements(p_items)
  loop
    select * into db_product
    from public.products
    where id = (item_record ->> 'product_id')::uuid
    for update;

    line_quantity := (item_record ->> 'quantity')::integer;
    line_subtotal := db_product.sale_price * line_quantity;

    insert into public.sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    values (sale_id, db_product.id, line_quantity, db_product.sale_price, line_subtotal);

    update public.products
    set stock = stock - line_quantity
    where id = db_product.id;

    insert into public.inventory_movements (product_id, movement_type, quantity, notes, created_by)
    values (db_product.id, 'sale', line_quantity, 'Salida por venta ' || generated_invoice, current_user_id);
  end loop;

  return sale_id;
end;
$$;

grant execute on function public.register_sale(text, text, jsonb, numeric, numeric) to authenticated;

-- ---------------------------------------------------------------------
-- 4. Abrir turno de caja
-- ---------------------------------------------------------------------
create or replace function public.open_cash_shift(p_opening numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_shift uuid;
begin
  if current_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  if exists (select 1 from public.cash_shifts where opened_by = current_user_id and status = 'open') then
    raise exception 'Ya tienes un turno de caja abierto';
  end if;

  insert into public.cash_shifts (opened_by, opening_amount)
  values (current_user_id, greatest(coalesce(p_opening, 0), 0))
  returning id into new_shift;

  return new_shift;
end;
$$;

grant execute on function public.open_cash_shift(numeric) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Cerrar turno de caja (arqueo)
-- ---------------------------------------------------------------------
create or replace function public.close_cash_shift(
  p_shift_id uuid,
  p_counted numeric,
  p_notes text default null
)
returns public.cash_shifts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  shift_row public.cash_shifts%rowtype;
  cash_total numeric(12,2);
  expected numeric(12,2);
  counted numeric(12,2);
begin
  if current_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select * into shift_row from public.cash_shifts where id = p_shift_id for update;

  if shift_row.id is null then
    raise exception 'Turno no encontrado';
  end if;

  if shift_row.status = 'closed' then
    raise exception 'El turno ya fue cerrado';
  end if;

  if shift_row.opened_by <> current_user_id
     and public.current_user_role() not in ('admin', 'manager') then
    raise exception 'No tienes permiso para cerrar este turno';
  end if;

  select coalesce(sum(total_amount), 0) into cash_total
  from public.sales
  where shift_id = p_shift_id and payment_method = 'efectivo';

  counted := greatest(coalesce(p_counted, 0), 0);
  expected := shift_row.opening_amount + cash_total;

  update public.cash_shifts
  set closing_amount = counted,
      cash_sales_total = cash_total,
      expected_amount = expected,
      difference = counted - expected,
      status = 'closed',
      notes = nullif(trim(coalesce(p_notes, '')), ''),
      closed_at = timezone('utc', now())
  where id = p_shift_id
  returning * into shift_row;

  return shift_row;
end;
$$;

grant execute on function public.close_cash_shift(uuid, numeric, text) to authenticated;

-- ---------------------------------------------------------------------
-- 6. RLS y permisos para cash_shifts
-- ---------------------------------------------------------------------
alter table public.cash_shifts enable row level security;

drop policy if exists "cash_shifts_select" on public.cash_shifts;
create policy "cash_shifts_select"
on public.cash_shifts
for select
to authenticated
using (opened_by = auth.uid() or public.current_user_role() in ('admin', 'manager'));

drop policy if exists "cash_shifts_insert" on public.cash_shifts;
create policy "cash_shifts_insert"
on public.cash_shifts
for insert
to authenticated
with check (opened_by = auth.uid());

drop policy if exists "cash_shifts_update" on public.cash_shifts;
create policy "cash_shifts_update"
on public.cash_shifts
for update
to authenticated
using (opened_by = auth.uid() or public.current_user_role() in ('admin', 'manager'))
with check (opened_by = auth.uid() or public.current_user_role() in ('admin', 'manager'));

grant select, insert, update on public.cash_shifts to authenticated;
