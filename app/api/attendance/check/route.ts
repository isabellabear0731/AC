import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "TEACHER")
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    studentId,
    sessionId,
    type,
  } = body;

  if (
    typeof studentId !== "string" ||
    typeof sessionId !== "string" ||
    (type !== "checkin" && type !== "checkout")
  ) {
    return NextResponse.json(
      { error: "Invalid check request" },
      { status: 400 }
    );
  }

  if (session.user.role === "TEACHER") {
    const assignedSession =
      await prisma.courseSession.findFirst({
        where: {
          id: sessionId,
          teacherId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!assignedSession) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  const attendance =
    await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

  if (!attendance) {
    return NextResponse.json(
      { error: "Attendance not found" },
      { status: 404 }
    );
  }

  const now = new Date();

  const updated =
    await prisma.attendance.update({
      where: {
        id: attendance.id,
      },

      data: {
        ...(type === "checkin" && {
          checkInTime: now,
        }),

        ...(type === "checkout" && {
          checkOutTime: now,
        }),

        editedById: session.user.id,
      },
    });

  return NextResponse.json(updated);
}
