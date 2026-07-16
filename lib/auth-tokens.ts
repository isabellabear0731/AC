import { createHash, randomBytes } from "node:crypto";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createToken(ttlMs: number) {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export function createPasswordResetToken() {
  return createToken(PASSWORD_RESET_TTL_MS);
}

export function createEmailVerificationToken() {
  return createToken(EMAIL_VERIFICATION_TTL_MS);
}

export function getAppUrl(request: Request) {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  );
}
