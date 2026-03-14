import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Login | ISPNexus",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const callbackUrl = next?.startsWith("/") ? next : "/dashboard";

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="relative">
          <p className="ui-eyebrow">ISPNexus</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Operator Sign In</h1>
        </div>

        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
