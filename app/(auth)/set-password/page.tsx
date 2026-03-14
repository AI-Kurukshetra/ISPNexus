import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
    title: "Set Password | ISPNexus",
};

export default async function SetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Set up your account
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                    Create a password to activate your ISPNexus operator account.
                </p>
            </div>
            <hr className="mb-8 border-slate-100" />
            <ResetPasswordForm token={token ?? ""} />
        </>
    );
}
