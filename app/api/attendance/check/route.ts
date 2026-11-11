import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { studentIsRegisteredForSession } from "@/lib/teacher-access";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId, sessionId, type } = await request.json();
    if (typeof studentId !== "string" || typeof sessionId !== "string" || (type !== "checkin" && type !== "checkout")) {
      return NextResponse.json({ error: "Invalid check request." }, { status: 400 });
    }

    const courseSession = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      select: { teacherId: true },
    });
    if (!courseSession) return NextResponse.json({ error: "Teaching session not found." }, { status: 404 });
    if (session.user.role === "TEACHER" && courseSession.teacherId !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this teaching session." }, { status: 403 });
    }
    if (!(await studentIsRegisteredForSession(studentId, sessionId))) {
      return NextResponse.json({ error: "This student is not registered for the teaching session." }, { status: 403 });
    }

    const existing = await prisma.attendance.findUnique({
      where: { studentId_sessionId: { studentId, sessionId } },
    });
    if (type === "checkin" && existing?.checkInTime) {
      return NextResponse.json({ error: "Student has already checked in." }, { status: 400 });
    }
    if (type === "checkout" && !existing?.checkInTime) {
      return NextResponse.json({ error: "Student must check in first." }, { status: 400 });
    }
    if (type === "checkout" && existing?.checkOutTime) {
      return NextResponse.json({ error: "Student has already checked out." }, { status: 400 });
    }

    const now = new Date();
    const attendance = await prisma.attendance.upsert({
      where: { studentId_sessionId: { studentId, sessionId } },
      create: {
        studentId,
        sessionId,
        status: "PENDING",
        checkInTime: type === "checkin" ? now : null,
        editedById: session.user.id,
      },
      update: {
        ...(type === "checkin" ? { checkInTime: now } : { checkOutTime: now }),
        editedById: session.user.id,
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance check-in/out failed", { actorId: session.user.id, error });
    return NextResponse.json({ error: "Unable to update check-in status. Please try again." }, { status: 500 });
  }
}
