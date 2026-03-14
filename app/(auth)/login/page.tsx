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
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in to your operator console
        </p>
      </div>
      <hr className="mb-8 border-slate-100" />
      <LoginForm callbackUrl={callbackUrl} />
    </>
  );
}
