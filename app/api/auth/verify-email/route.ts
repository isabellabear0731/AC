import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth-tokens";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    console.warn(
      "Email verification attempted without a token"
    );

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
    console.warn(
      "Email verification token was not found"
    );

    return NextResponse.redirect(
      new URL("/login?verification=invalid", requestUrl)
    );
  }

  if (verificationToken.expiresAt <= new Date()) {
    console.warn(
      "Email verification token expired",
      {
        userId: verificationToken.userId,
        expiresAt:
          verificationToken.expiresAt.toISOString(),
      }
    );

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
  } catch (error) {
    console.error(
      "Email verification failed while consuming token",
      {
        userId: verificationToken.userId,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      }
    );

    return NextResponse.redirect(
      new URL("/login?verification=invalid", requestUrl)
    );
  }

  console.info(
    "Email verified successfully",
    {
      userId: verificationToken.userId,
    }
  );

  return NextResponse.redirect(
    new URL("/login?verification=success", requestUrl)
  );
}
