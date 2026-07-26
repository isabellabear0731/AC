type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export type EmailDeliveryResult =
  | {
      ok: true;
      emailId: string | null;
    }
  | {
      ok: false;
      skipped: true;
      reason: string;
    }
  | {
      ok: false;
      skipped: false;
      status?: number;
      reason: string;
      providerBody?: string;
    };

export function isEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY && process.env.EMAIL_FROM
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character
  );
}

function logEmailFailure(
  options: EmailOptions,
  result: EmailDeliveryResult
) {
  if (result.ok) {
    return;
  }

  console.error(
    "Email delivery failed",
    {
      to: options.to,
      subject: options.subject,
      idempotencyKey: options.idempotencyKey,
      skipped: result.skipped,
      status:
        "status" in result
          ? result.status
          : undefined,
      reason: result.reason,
      providerBody:
        "providerBody" in result
          ? result.providerBody
          : undefined,
      nodeEnv: process.env.NODE_ENV,
      hasResendApiKey:
        Boolean(process.env.RESEND_API_KEY),
      hasEmailFrom:
        Boolean(process.env.EMAIL_FROM),
      emailFrom:
        process.env.EMAIL_FROM,
    }
  );
}

function parseEmailId(
  value: unknown
) {
  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string"
  ) {
    return value.id;
  }

  return null;
}

function normalizeIdempotencyKey(
  value: string
) {
  if (value.length <= 256) {
    return value;
  }

  return value.slice(0, 256);
}

async function sendEmail(
  options: EmailOptions
): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const idempotencyKey =
    normalizeIdempotencyKey(
      options.idempotencyKey
    );

  if (!isEmailConfigured() || !apiKey || !from) {
    const result: EmailDeliveryResult = {
      ok: false,
      skipped: true,
      reason:
        "Email not configured. Skipping verification email.",
    };

    console.warn(result.reason, {
      to: options.to,
      subject: options.subject,
      nodeEnv: process.env.NODE_ENV,
      hasResendApiKey: Boolean(apiKey),
      hasEmailFrom: Boolean(from),
    });

    return result;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      cache: "no-store",
    });

    const responseBody =
      await response.text();

    if (!response.ok) {
      const result: EmailDeliveryResult = {
        ok: false,
        skipped: false,
        status: response.status,
        reason:
          `Email provider returned ${response.status}.`,
        providerBody: responseBody,
      };

      logEmailFailure(options, result);

      return result;
    }

    let parsedResponse: unknown = null;

    if (responseBody) {
      try {
        parsedResponse =
          JSON.parse(responseBody);
      } catch {
        parsedResponse = null;
      }
    }

    const emailId =
      parseEmailId(parsedResponse);

    console.info(
      "Email accepted by provider",
      {
        to: options.to,
        subject: options.subject,
        idempotencyKey:
          idempotencyKey,
        emailId,
      }
    );

    return {
      ok: true,
      emailId,
    };
  } catch (error) {
    const result: EmailDeliveryResult = {
      ok: false,
      skipped: false,
      reason:
        error instanceof Error
          ? error.message
          : "Email provider request failed.",
    };

    logEmailFailure(options, result);

    return result;
  }
}

export async function sendVerificationEmail({
  email,
  firstName,
  verificationUrl,
  tokenHash,
}: {
  email: string;
  firstName: string;
  verificationUrl: string;
  tokenHash: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(verificationUrl);

  return sendEmail({
    to: email,
    subject: "Verify your Gifted People Services email",
    idempotencyKey: `verify-${tokenHash}`,
    text:
      `Hi ${firstName},\n\nVerify your email by opening this link:\n` +
      `${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">
        <h1 style="color:#7AAACD">Verify your email</h1>
        <p>Hi ${safeName},</p>
        <p>Welcome to The Gifted People Services. Please verify your email address to activate sign-in.</p>
        <p>
          <a href="${safeUrl}" style="display:inline-block;border-radius:10px;background:#7AAACD;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">
            Verify Email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  email,
  firstName,
  resetUrl,
  tokenHash,
}: {
  email: string;
  firstName: string;
  resetUrl: string;
  tokenHash: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(resetUrl);

  return sendEmail({
    to: email,
    subject: "Reset your Gifted People Services password",
    idempotencyKey: `reset-${tokenHash}`,
    text:
      `Hi ${firstName},\n\nReset your password by opening this link:\n` +
      `${resetUrl}\n\nThis link expires in one hour. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">
        <h1 style="color:#7AAACD">Reset your password</h1>
        <p>Hi ${safeName},</p>
        <p>We received a request to reset your Gifted People Services password.</p>
        <p>
          <a href="${safeUrl}" style="display:inline-block;border-radius:10px;background:#7AAACD;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </p>
        <p>This link expires in one hour. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendRegistrationApprovedEmail({
  email,
  firstName,
  course,
}: {
  email: string;
  firstName: string;
  course: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeCourse = escapeHtml(course);

  return sendEmail({
    to: email,
    subject: "Registration Approved",
    idempotencyKey: `registration-approved-${email}-${course}`,

    text:
      `Hi ${firstName},\n\n` +
      `Your registration for "${course}" has been approved.\n\n` +
      `We look forward to seeing you at the center.`,

    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">
        <h1 style="color:#16A34A">Registration Approved</h1>

        <p>Hi ${safeName},</p>

        <p>Your registration for
        <strong>${safeCourse}</strong>
        has been approved.</p>

        <p>We look forward to seeing you!</p>
      </div>
    `,
  });
}

export async function sendRegistrationRejectedEmail({
  email,
  firstName,
  course,
  reason,
}: {
  email: string;
  firstName: string;
  course: string;
  reason: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeCourse = escapeHtml(course);
  const safeReason = escapeHtml(reason);

  return sendEmail({
    to: email,
    subject: "Registration Update",
    idempotencyKey: `registration-rejected-${email}-${course}`,

    text:
      `Hi ${firstName},\n\n` +
      `Unfortunately your registration for "${course}" was not approved.\n\n` +
      `Reason:\n${reason}`,

    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">

        <h1 style="color:#DC2626">
          Registration Update
        </h1>

        <p>Hi ${safeName},</p>

        <p>
          Unfortunately your registration for
          <strong>${safeCourse}</strong>
          was not approved.
        </p>

        <p>
          <strong>Reason</strong>
        </p>

        <p>${safeReason}</p>

      </div>
    `,
  });
}

export async function sendRegistrationWaitlistEmail({
  email,
  firstName,
  course,
  reason,
}: {
  email: string;
  firstName: string;
  course: string;
  reason?: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeCourse = escapeHtml(course);

  return sendEmail({
    to: email,
    subject: "Registration Waitlisted",
    idempotencyKey: `registration-waitlist-${email}-${course}`,

    text:
      `Hi ${firstName},\n\n` +
      `Your registration for "${course}" has been placed on the waitlist.\n\n` +
      (reason ?? ""),

    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">

        <h1 style="color:#2563EB">
          Waitlist Notice
        </h1>

        <p>Hi ${safeName},</p>

        <p>
          Your registration for
          <strong>${safeCourse}</strong>
          has been placed on the waitlist.
        </p>

        ${
          reason
            ? `<p><strong>Note:</strong> ${escapeHtml(reason)}</p>`
            : ""
        }

      </div>
    `,
  });
}

export async function sendRegistrationCancelledEmail({
  email,
  firstName,
  course,
  reason,
}: {
  email: string;
  firstName: string;
  course: string;
  reason?: string;
}) {
  const safeName = escapeHtml(firstName);
  const safeCourse = escapeHtml(course);

  return sendEmail({
    to: email,
    subject: "Registration Cancelled",
    idempotencyKey: `registration-cancelled-${email}-${course}`,

    text:
      `Hi ${firstName},\n\n` +
      `Your registration for "${course}" has been cancelled.\n\n` +
      (reason ?? ""),

    html: `
      <div style="font-family:Arial,sans-serif;color:#374151;line-height:1.6">

        <h1 style="color:#6B7280">
          Registration Cancelled
        </h1>

        <p>Hi ${safeName},</p>

        <p>
          Your registration for
          <strong>${safeCourse}</strong>
          has been cancelled.
        </p>

        ${
          reason
            ? `<p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`
            : ""
        }

      </div>
    `,
  });
}
