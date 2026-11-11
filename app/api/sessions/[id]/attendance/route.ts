import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { AttendanceStatus } from "@prisma/client";
import { studentIsRegisteredForSession } from "@/lib/teacher-access";

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

  if (!(await studentIsRegisteredForSession(studentId, sessionId))) {
    return NextResponse.json(
      { error: "This student is not registered for the teaching session." },
      { status: 403 }
    );
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_sessionId: {
        studentId,
        sessionId,
      },
    },
    update: {
      status,
      editedById: authSession.user.id,
    },
    create: {
      studentId,
      sessionId,
      status,
      editedById: authSession.user.id,
    },
  });

  return NextResponse.json(attendance);
}
