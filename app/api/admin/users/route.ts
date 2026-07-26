import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import {
  getAppUrl,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth-tokens";
import { issueEmailVerification } from "@/lib/account-email";

type AdminCreateRole =
  | "PARENT"
  | "ADULT"
  | "TEACHER"
  | "STUDENT"
  | "ADMIN";

function parseAdminCreateRole(
  value: unknown
): AdminCreateRole | null {
  if (
    value === "PARENT" ||
    value === "ADULT" ||
    value === "TEACHER" ||
    value === "STUDENT" ||
    value === "ADMIN"
  ) {
    return value;
  }

  return null;
}

function getStringField(
  body: Record<string, unknown>,
  key: string
) {
  const value = body[key];

  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  req: Request
) {
  const session =
    await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const rawBody: unknown =
    await req.json();

  if (
    typeof rawBody !== "object" ||
    rawBody === null
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid request.",
      },
      {
        status: 400,
      }
    );
  }

  const body = rawBody as Record<string, unknown>;

  const role =
    parseAdminCreateRole(body.role);

  const email =
    normalizeEmail(
      getStringField(body, "email")
    );

  const firstName =
    getStringField(body, "firstName");

  const lastName =
    getStringField(body, "lastName");

  const phone =
    getStringField(body, "phone");

  const password =
    getStringField(body, "password");

  const parentId =
    getStringField(body, "parentId");

  if (
    !role ||
    !isValidEmail(email) ||
    !firstName ||
    !lastName ||
    !isValidPassword(password)
  ) {
    return NextResponse.json(
      {
        error:
          "Enter valid user details.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    role === "STUDENT" &&
    !parentId
  ) {
    return NextResponse.json(
      {
        error:
          "Parent required.",
      },
      {
        status: 400,
      }
    );
  }

  const existing =
    await prisma.user.findUnique({
      where: {
        email,
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
    await bcrypt.hash(
      password,
      12
    );

  const user =
    await prisma.$transaction(
      async (tx) => {
        const createdUser =
          await tx.user.create({
            data: {
              firstName,
              lastName,
              email,
              phone:
                phone || null,
              passwordHash,
              role,
              isActive: true,
              emailVerified:
                process.env.NODE_ENV ===
                "development",
            },
          });

        if (role === "STUDENT") {
          await tx.studentProfile.create({
            data: {
              studentUserId:
                createdUser.id,
              parentId,
            },
          });
        }

        if (role === "ADULT") {
          await tx.studentProfile.create({
            data: {
              studentUserId:
                createdUser.id,
              parentId: null,
            },
          });
        }

        return createdUser;
      }
    );

  if (
    process.env.NODE_ENV !==
    "development"
  ) {
    const delivery =
      await issueEmailVerification({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        appUrl: getAppUrl(req),
      });

    if (!delivery.ok) {
      const warning =
        "User created, but the verification email could not be delivered. Ask the user to request another verification email from the login page later.";

      console.error(
        "Admin-created user verification email was not delivered",
        {
          userId: user.id,
          email: user.email,
          role: user.role,
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
          appUrl: getAppUrl(req),
        }
      );

      return NextResponse.json(
        {
          success: true,
          warning,
          emailDelivered: false,
        },
        {
          status: 201,
        }
      );
    }
  }

  return NextResponse.json({
    success: true,
    emailDelivered:
      process.env.NODE_ENV !==
      "development",
  });
}
