import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password | ISPNexus",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password?</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your email and we&apos;ll generate a secure reset link.
        </p>
      </div>
      <hr className="mb-8 border-slate-100" />
      <ForgotPasswordForm />
    </>
  );
}
