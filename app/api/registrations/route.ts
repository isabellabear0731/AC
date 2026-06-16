import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "PARENT") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const { studentId, sessionId } =
    body;

  if (!studentId || !sessionId) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // Verify parent owns child
  const child =
    await prisma.studentProfile.findUnique({
      where: {
        id: studentId,
      },
    });

  if (!child) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  if (child.parentId !== session.user.id) {
    return NextResponse.json(
      { error: "Unauthorized child" },
      { status: 403 }
    );
  }

  // Prevent duplicate registrations
  const existing =
    await prisma.registration.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Student already registered",
      },
      { status: 400 }
    );
  }
  const sessionData =
  await prisma.courseSession.findUnique({
    where: {
      id: sessionId,
    },

    include: {
      course: true,

      registrations: {
        where: {
          status: "APPROVED",
        },
      },
    },
  });

if (!sessionData) {
  return NextResponse.json(
    { error: "Session not found" },
    { status: 404 }
  );
}

const full =
  sessionData.course.capacity != null &&
  sessionData.registrations.length >=
    sessionData.course.capacity;
    
    const registration =
    await prisma.registration.create({
      data: {
        studentId,
        sessionId,
  
        status: full
          ? "WAITLISTED"
          : "PENDING",
      },
    });

  // Notify admins
  const admins =
    await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "REGISTRATION",
      title: "New Registration",
      message:
        full
          ? "A student joined the waitlist."
          : "A parent submitted a registration request.",
          })),
  });

  return NextResponse.json({
    registration,
  
    status:
      registration.status,
  });
}