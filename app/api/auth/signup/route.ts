import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  getAppUrl,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth-tokens";
import { issueEmailVerification } from "@/lib/account-email";

type SignupRole = "PARENT" | "ADULT";

function parseSignupRole(
  value: unknown
): SignupRole | null {
  if (value === "PARENT" || value === "ADULT") {
    return value;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    } = body;

    const signupRole =
      parseSignupRole(role);

    if (!signupRole) {
      return NextResponse.json(
        {
          error:
            "Choose either Parent or Adult as the account type.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      typeof email === "string"
        ? normalizeEmail(email)
        : "";

    const normalizedFirstName =
      typeof firstName === "string"
        ? firstName.trim()
        : "";

    const normalizedLastName =
      typeof lastName === "string"
        ? lastName.trim()
        : "";

    if (
      !isValidEmail(normalizedEmail) ||
      !normalizedFirstName ||
      !normalizedLastName
    ) {
      return NextResponse.json(
        {
          error:
            "Enter valid account details.",
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
            "Password must be between 8 and 72 bytes long.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
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
      await bcrypt.hash(
        password,
        12
      );

    const user =
      await prisma.$transaction(
        async (tx) => {
          const user =
            await tx.user.create({
              data: {
                email:
                  normalizedEmail,

                passwordHash,

                firstName:
                  normalizedFirstName,

                lastName:
                  normalizedLastName,

                phone:
                  typeof phone ===
                    "string" &&
                  phone.trim()
                    ? phone.trim()
                    : null,

                role:
                  signupRole,

                isActive: true,

                // Auto verify during development
                emailVerified:
                  process.env.NODE_ENV ===
                  "development",
              },
            });

          if (
            signupRole ===
            "ADULT"
          ) {
            await tx.studentProfile.create({
              data: {
                studentUserId:
                  user.id,

                parentId: null,
              },
            });
          }

          return user;
        }
      );

    if (
      process.env.NODE_ENV !==
      "development"
    ) {
      try {
        await issueEmailVerification({
          userId: user.id,
          email: user.email,
          firstName:
            user.firstName,
          appUrl:
            getAppUrl(req),
        });
      } catch (error) {
        console.error(
          "Verification email failed:",
          error
        );
      }
    }

    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV ===
          "development"
            ? "Account created successfully."
            : "Account created. Please check your email to verify your account.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Signup failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create your account.",
      },
      {
        status: 500,
      }
    );
  }
}