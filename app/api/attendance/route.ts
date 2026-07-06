import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AttendanceStatus } from "@prisma/client";

const attendanceStatuses = new Set(
  Object.values(AttendanceStatus)
);

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
    status,
  } = body;

  if (
    typeof studentId !== "string" ||
    typeof sessionId !== "string" ||
    !attendanceStatuses.has(status)
  ) {
    return NextResponse.json(
      { error: "Invalid attendance data" },
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
