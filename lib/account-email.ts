import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
} from "@/lib/auth-tokens";
import {
  type EmailDeliveryResult,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email";

export async function issueEmailVerification({
  userId,
  email,
  firstName,
  appUrl,
}: {
  userId: string;
  email: string;
  firstName: string;
  appUrl: string;
}): Promise<EmailDeliveryResult> {
  const token = createEmailVerificationToken();

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    }),
  ]);

  const verificationUrl =
    `${appUrl}/verify-email?token=` +
    encodeURIComponent(token.token);

  return sendVerificationEmail({
    email,
    firstName,
    verificationUrl,
    tokenHash: token.tokenHash,
  });
}

export async function issuePasswordReset({
  userId,
  email,
  firstName,
  appUrl,
}: {
  userId: string;
  email: string;
  firstName: string;
  appUrl: string;
}): Promise<EmailDeliveryResult> {
  const token = createPasswordResetToken();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    }),
  ]);

  const resetUrl =
    `${appUrl}/reset-password?token=` +
    encodeURIComponent(token.token);

  return sendPasswordResetEmail({
    email,
    firstName,
    resetUrl,
    tokenHash: token.tokenHash,
  });
}
