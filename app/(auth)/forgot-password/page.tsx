import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password | ISPNexus",
};

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="ui-eyebrow">ISPNexus</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Forgot Password</h1>
        <p className="ui-copy mt-2 text-sm leading-6">
          Generate a secure reset link and get the operator console back under control.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
