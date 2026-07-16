import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  hashToken,
  isValidPassword,
} from "@/lib/auth-tokens";

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

  const token =
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    typeof body.token === "string"
      ? body.token
      : "";
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";

  if (!token) {
    return NextResponse.json(
      { error: "This password reset link is invalid." },
      { status: 400 }
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      {
        error:
          "Password must be between 8 and 72 bytes long.",
      },
      { status: 400 }
    );
  }

  const tokenHash = hashToken(token);

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        userId: true,
        expiresAt: true,
      },
    });

  if (!resetToken || resetToken.expiresAt <= new Date()) {
    if (resetToken) {
      await prisma.passwordResetToken.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    return NextResponse.json(
      {
        error:
          "This password reset link is invalid or has expired.",
      },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (transaction) => {
      const consumed =
        await transaction.passwordResetToken.deleteMany({
          where: {
            tokenHash,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      if (consumed.count !== 1) {
        throw new Error("RESET_TOKEN_ALREADY_USED");
      }

      await transaction.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      });

      await transaction.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      });
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "This password reset link is invalid or has expired.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Your password has been reset.",
  });
}
