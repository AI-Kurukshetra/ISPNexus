import crypto from "node:crypto";

const RESET_WINDOW_MS = 60 * 60 * 1000;

type ResetPayload = {
  sub: string;
  exp: number;
  pwd: string;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET is required for password reset flow");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function fingerprintPasswordHash(passwordHash: string) {
  return crypto.createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export function createPasswordResetToken({
  userId,
  passwordHash,
}: {
  userId: string;
  passwordHash: string;
}) {
  const payload: ResetPayload = {
    sub: userId,
    exp: Date.now() + RESET_WINDOW_MS,
    pwd: fingerprintPasswordHash(passwordHash),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp),
  };
}

export function verifyPasswordResetToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as ResetPayload;

    if (!payload.sub || !payload.exp || !payload.pwd) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isPasswordFingerprintMatch({
  passwordHash,
  fingerprint,
}: {
  passwordHash: string;
  fingerprint: string;
}) {
  return fingerprintPasswordHash(passwordHash) === fingerprint;
}
