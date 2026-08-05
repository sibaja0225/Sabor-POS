import { getCurrentProfile } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { getDictionary } from "@/lib/i18n/server";

export default async function ProfilePage() {
  const { profile } = await getCurrentProfile();
  const t = await getDictionary();

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{t.profile.title}</h1>
          <p className="muted">{t.profile.subtitle}</p>
        </div>
      </div>
      <div className="profile-card card">
        <div style={{ marginBottom: "1.2rem" }}>
          <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{profile.full_name}</p>
          <p className="muted" style={{ fontSize: "0.88rem" }}>{profile.email}</p>
          <p className="muted" style={{ fontSize: "0.82rem", marginTop: "0.2rem", textTransform: "capitalize" }}>
            {t.users[profile.role as keyof typeof t.users] ?? profile.role}
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
