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
    const { studentId, sessionId, arrivalNote, departureNote } = await request.json();
    if (typeof studentId !== "string" || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid attendance data." }, { status: 400 });
    }
    if ((arrivalNote !== undefined && typeof arrivalNote !== "string") || (departureNote !== undefined && typeof departureNote !== "string")) {
      return NextResponse.json({ error: "Attendance notes must be text." }, { status: 400 });
    }

    const courseSession = await prisma.courseSession.findUnique({ where: { id: sessionId }, select: { teacherId: true } });
    if (!courseSession) return NextResponse.json({ error: "Teaching session not found." }, { status: 404 });
    if (session.user.role === "TEACHER" && courseSession.teacherId !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this teaching session." }, { status: 403 });
    }
    if (!(await studentIsRegisteredForSession(studentId, sessionId))) {
      return NextResponse.json({ error: "This student is not registered for the teaching session." }, { status: 403 });
    }

    const attendance = await prisma.attendance.upsert({
      where: { studentId_sessionId: { studentId, sessionId } },
      create: {
        studentId,
        sessionId,
        status: "PENDING",
        arrivalNote: arrivalNote?.trim() || null,
        departureNote: departureNote?.trim() || null,
        editedById: session.user.id,
      },
      update: {
        arrivalNote: arrivalNote?.trim() || null,
        departureNote: departureNote?.trim() || null,
        editedById: session.user.id,
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance notes update failed", { actorId: session.user.id, error });
    return NextResponse.json({ error: "Unable to save attendance notes. Please try again." }, { status: 500 });
  }
}
