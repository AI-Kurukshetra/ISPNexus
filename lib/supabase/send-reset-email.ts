import { getSupabaseAdminClient } from "./admin";

/**
 * Sends a password reset email via Supabase's email service.
 *
 * Uses `auth.resetPasswordForEmail` which is the method that actually triggers
 * email delivery. `admin.generateLink` only returns the link — it does NOT send
 * an email, which was the bug in the previous implementation.
 *
 * Flow:
 *  1. Ensure the user exists in Supabase Auth (create a shadow account if not).
 *     Our users live in Prisma DB; the shadow account is only for email delivery.
 *  2. Call resetPasswordForEmail → Supabase sends the email.
 *     The email contains a Supabase-hosted recovery URL that, after verifying
 *     Supabase's own token, redirects to our `redirectTo` (which carries our
 *     HMAC-signed token) so our own reset form handles the password update.
 *
 * Required env vars:
 *   SUPABASE_URL              — https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase Dashboard → Project Settings → API
 *
 * Required Supabase dashboard config:
 *   Authentication → URL Configuration → Allowed Redirect URLs
 *   → Add: http://localhost:3000/reset-password   (dev)
 *   → Add: https://<your-domain>/reset-password   (prod)
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();

  // Ensure the email exists as a Supabase Auth user so resetPasswordForEmail works.
  // Ignore "already registered" — the shadow account already exists.
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    // Random unguessable password — user never logs in via Supabase Auth.
    password: crypto.randomUUID() + crypto.randomUUID(),
  });

  if (
    createError &&
    !createError.message.toLowerCase().includes("already") &&
    !createError.message.toLowerCase().includes("duplicate") &&
    createError.status !== 422
  ) {
    throw new Error(`Supabase shadow user error: ${createError.message}`);
  }

  // This is the call that actually delivers the email.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    throw new Error(`Supabase send email error: ${error.message}`);
  }
}
