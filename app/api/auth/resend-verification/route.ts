import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAppUrl,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth-tokens";
import { issueEmailVerification } from "@/lib/account-email";
import { isEmailConfigured } from "@/lib/email";

const genericMessage =
  "If that account still needs verification, a new email has been sent.";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const submittedEmail =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email
      : "";
  const email = normalizeEmail(submittedEmail);

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Email service is temporarily unavailable. Please try again later.",
      },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      emailVerified: true,
      emailVerificationTokens: {
        where: {
          createdAt: {
            gt: new Date(Date.now() - 60 * 1000),
          },
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  if (
    user &&
    !user.emailVerified &&
    user.emailVerificationTokens.length === 0
  ) {
    try {
      await issueEmailVerification({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        appUrl: getAppUrl(request),
      });
    } catch (error) {
      console.error("Unable to resend verification email", error);
    }
  }

  return NextResponse.json({
    message: genericMessage,
  });
}
