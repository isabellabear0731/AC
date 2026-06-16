import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    studentId,
    sessionId,
    status,
  } = body;

  const existing =
    await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

  if (existing) {
    const attendance =
      await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          status,
          editedById: session.user.id,
        },
      });

    return NextResponse.json(attendance);
  }

  const attendance =
    await prisma.attendance.create({
      data: {
        studentId,
        sessionId,
        status,
        editedById: session.user.id,
      },
    });

  return NextResponse.json(attendance);
}