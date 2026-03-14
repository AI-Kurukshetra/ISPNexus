import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password | ISPNexus",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="ui-eyebrow">ISPNexus</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Reset Password</h1>
        <p className="ui-copy mt-2 text-sm leading-6">
          Set a new password for your operator account and return to the operations floor.
        </p>

        <div className="mt-6">
          <ResetPasswordForm token={token ?? ""} />
        </div>
      </section>
    </main>
  );
}
