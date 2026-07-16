import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
} from "@/lib/auth-tokens";
import {
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
}) {
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

  try {
    const verificationUrl =
      `${appUrl}/verify-email?token=` +
      encodeURIComponent(token.token);

    await sendVerificationEmail({
      email,
      firstName,
      verificationUrl,
      tokenHash: token.tokenHash,
    });
  } catch (error) {
    await prisma.emailVerificationToken.deleteMany({
      where: {
        tokenHash: token.tokenHash,
      },
    });
    throw error;
  }
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
}) {
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

  try {
    const resetUrl =
      `${appUrl}/reset-password?token=` +
      encodeURIComponent(token.token);

    await sendPasswordResetEmail({
      email,
      firstName,
      resetUrl,
      tokenHash: token.tokenHash,
    });
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({
      where: {
        tokenHash: token.tokenHash,
      },
    });
    throw error;
  }
}
