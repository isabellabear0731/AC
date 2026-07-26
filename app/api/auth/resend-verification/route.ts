import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAppUrl,
  isValidEmail,
  normalizeEmail,
} from "@/lib/auth-tokens";
import { issueEmailVerification } from "@/lib/account-email";

const genericMessage =
  "If that account still needs verification, a new email will be sent.";

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

  if (!user || user.emailVerified) {
    return NextResponse.json({
      message: genericMessage,
    });
  }

  if (user.emailVerificationTokens.length > 0) {
    return NextResponse.json({
      message:
        "A verification email was requested recently. Please wait a minute before trying again.",
    });
  }

  const delivery =
    await issueEmailVerification({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      appUrl: getAppUrl(request),
    });

  if (!delivery.ok) {
    console.error(
      "Verification resend was not delivered",
      {
        userId: user.id,
        email: user.email,
        skipped: delivery.skipped,
        reason: delivery.reason,
        status:
          "status" in delivery
            ? delivery.status
            : undefined,
        providerBody:
          "providerBody" in delivery
            ? delivery.providerBody
            : undefined,
        appUrl: getAppUrl(request),
      }
    );

    return NextResponse.json(
      {
        error:
          "We could not send a verification email right now. Please try again later or contact support.",
      },
      {
        status: 502,
      }
    );
  }

  return NextResponse.json({
    message:
      "A new verification email has been sent.",
  });
}
