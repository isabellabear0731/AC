import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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

  const body =
    await req.json();

  const existing =
    await prisma.user.findUnique({
      where: {
        email: body.email,
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
      body.password,
      12
    );

  const user =
    await prisma.user.create({
      data: {
        firstName:
          body.firstName,
        lastName:
          body.lastName,
        email: body.email,
        phone:
          body.phone || null,
        passwordHash,
        role: body.role,
        isActive: true,
        emailVerified: false,
      },
    });

  if (body.role === "STUDENT") {
    if (!body.parentId) {
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

    await prisma.studentProfile.create({
      data: {
        studentUserId:
          user.id,
        parentId:
          body.parentId,
      },
    });
  }

  return NextResponse.json({
    success: true,
  });
}