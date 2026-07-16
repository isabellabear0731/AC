import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  normalizeEmail,
  isValidEmail,
  isValidPassword,
} from "@/lib/auth-tokens";

export async function POST(req: Request) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "PARENT") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
  } = body;

  const normalizedFirstName =
    typeof firstName === "string"
      ? firstName.trim()
      : "";

  const normalizedLastName =
    typeof lastName === "string"
      ? lastName.trim()
      : "";

  const normalizedEmail =
    typeof email === "string"
      ? normalizeEmail(email)
      : "";

  if (
    !normalizedFirstName ||
    !normalizedLastName ||
    !isValidEmail(normalizedEmail)
  ) {
    return NextResponse.json(
      {
        error:
          "Please enter valid child information.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    typeof password !== "string" ||
    !isValidPassword(password)
  ) {
    return NextResponse.json(
      {
        error:
          "Password must be at least 8 characters.",
      },
      {
        status: 400,
      }
    );
  }

  const existing =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Email already exists.",
      },
      {
        status: 400,
      }
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const student =
    await prisma.$transaction(
      async (tx) => {
        const user =
          await tx.user.create({
            data: {
              firstName:
                normalizedFirstName,

              lastName:
                normalizedLastName,

              email:
                normalizedEmail,

              passwordHash,

              phone:
                typeof phone ===
                  "string" &&
                phone.trim()
                  ? phone.trim()
                  : null,

              role: "STUDENT",

              isActive: true,

              emailVerified:
                process.env.NODE_ENV ===
                "development",
            },
          });

        return tx.studentProfile.create({
          data: {
            parentId:
              session.user.id,

            studentUserId:
              user.id,
          },

          include: {
            studentUser: true,
          },
        });
      }
    );

  return NextResponse.json({
    message:
      "Child created successfully.",

    student,
  });
}