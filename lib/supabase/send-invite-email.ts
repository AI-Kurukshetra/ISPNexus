import { getSupabaseAdminClient } from "./admin";

/**
 * Sends an invite email via Supabase's email service so a new operator can
 * set their password and access ISPNexus for the first time.
 *
 * Uses `auth.admin.inviteUserByEmail` which sends Supabase's "Invite" email
 * template (different copy from the password-reset email).
 * The `redirectTo` URL carries our HMAC-signed token so our own
 * `/set-password` page handles the actual password creation.
 *
 * If the email already has a Supabase Auth account (shadow user from a prior
 * password-reset interaction) we fall back to a recovery email.
 */
export async function sendInviteEmail({
    email,
    setPasswordUrl,
}: {
    email: string;
    setPasswordUrl: string;
}): Promise<void> {
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: setPasswordUrl,
    });

    if (!error) return;

    // User already exists in Supabase Auth — fall back to a recovery email.
    const alreadyExists =
        error.status === 422 ||
        error.message?.toLowerCase().includes("already been registered") ||
        error.message?.toLowerCase().includes("already exists") ||
        error.message?.toLowerCase().includes("already registered");

    if (!alreadyExists) {
        throw new Error(`Failed to send invite email: ${error.message}`);
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: setPasswordUrl,
    });

    if (resetError) {
        throw new Error(`Failed to send invite email (fallback): ${resetError.message}`);
    }
}
