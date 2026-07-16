import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth-tokens";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?verification=invalid", requestUrl)
    );
  }

  const tokenHash = hashToken(token);
  const verificationToken =
    await prisma.emailVerificationToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        userId: true,
        expiresAt: true,
      },
    });

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/login?verification=invalid", requestUrl)
    );
  }

  if (verificationToken.expiresAt <= new Date()) {
    await prisma.emailVerificationToken.deleteMany({
      where: {
        tokenHash,
      },
    });

    return NextResponse.redirect(
      new URL("/login?verification=expired", requestUrl)
    );
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const consumed =
        await transaction.emailVerificationToken.deleteMany({
          where: {
            tokenHash,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      if (consumed.count !== 1) {
        throw new Error("VERIFICATION_TOKEN_ALREADY_USED");
      }

      await transaction.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerified: true,
        },
      });

      await transaction.emailVerificationToken.deleteMany({
        where: {
          userId: verificationToken.userId,
        },
      });
    });
  } catch {
    return NextResponse.redirect(
      new URL("/login?verification=invalid", requestUrl)
    );
  }

  return NextResponse.redirect(
    new URL("/login?verification=success", requestUrl)
  );
}
