import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AttendanceStatus } from "@prisma/client";

const attendanceStatuses = new Set(
  Object.values(AttendanceStatus)
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession(authOptions);

  if (
    !authSession ||
    (authSession.user.role !== "ADMIN" &&
      authSession.user.role !== "TEACHER")
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: sessionId } = await params;
  const body = await req.json();

  const {
    studentId,
    status,
  } = body;

  if (
    typeof studentId !== "string" ||
    !attendanceStatuses.has(status)
  ) {
    return NextResponse.json(
      { error: "Invalid attendance data" },
      { status: 400 }
    );
  }

  if (authSession.user.role === "TEACHER") {
    const assignedSession =
      await prisma.courseSession.findFirst({
        where: {
          id: sessionId,
          teacherId: authSession.user.id,
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
          editedById: authSession.user.id,
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
        editedById: authSession.user.id,
      },
    });

  return NextResponse.json(attendance);
}
