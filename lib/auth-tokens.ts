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

function normalizeAppUrl(
  value: string | undefined
) {
  const trimmed =
    value?.trim().replace(/\/$/, "");

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getAppUrl(request: Request) {
  const configuredUrl =
    normalizeAppUrl(process.env.NEXTAUTH_URL) ??
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  const forwardedHost =
    request.headers.get("x-forwarded-host");

  if (forwardedHost) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto") ??
      "https";

    return `${forwardedProto}://${forwardedHost}`.replace(
      /\/$/,
      ""
    );
  }

  return new URL(request.url).origin.replace(
    /\/$/,
    ""
  );
}
