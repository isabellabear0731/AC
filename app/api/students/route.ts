import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can create students" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      notes,
    } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: "STUDENT",
        isActive: false,
        emailVerified: false,

        studentProfile: {
          create: {
            parentId: session.user.id,
            dateOfBirth: dateOfBirth
              ? new Date(dateOfBirth)
              : null,
            notes,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    const { passwordHash: _, ...safeStudent } = student;

    return NextResponse.json(safeStudent);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}