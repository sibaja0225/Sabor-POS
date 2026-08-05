import { getCurrentProfile } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { getDictionary } from "@/lib/i18n/server";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default async function ProfilePage() {
  const { profile } = await getCurrentProfile();
  const t = await getDictionary();

  const initials = getInitials(profile.full_name ?? "U");
  const roleLabel =
    t.users[profile.role as keyof typeof t.users] ?? profile.role;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.profile.title}</h1>
          <p className="muted">{t.profile.subtitle}</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Tarjeta de identidad */}
        <article className="card profile-identity-card">
          <div className="profile-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="profile-identity-info">
            <p className="profile-name">{profile.full_name}</p>
            <p className="muted profile-email">{profile.email}</p>
            <span className="profile-role-badge">{roleLabel}</span>
          </div>
        </article>

        {/* Tarjeta de cambio de contraseña */}
        <article className="card">
          <ChangePasswordForm />
        </article>
      </div>
    </div>
  );
}
