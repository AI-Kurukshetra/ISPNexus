import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up | ISPNexus",
};

export default function SignupPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="ui-eyebrow">ISPNexus</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Create Account</h1>
        <p className="ui-copy mt-2 text-sm leading-6">
          Set up an operator profile and step directly into the command workspace.
        </p>

        <div className="mt-6">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
