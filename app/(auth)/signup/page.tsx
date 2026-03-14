import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign Up | ISPNexus",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Get Started</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Create your operator account and step into the command console.
        </p>
      </div>
      <hr className="mb-8 border-slate-100" />
      <SignupForm />
    </>
  );
}
