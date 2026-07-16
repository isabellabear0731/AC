import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function getStringField(
  body: unknown,
  key: string
) {
  if (
    typeof body === "object" &&
    body !== null
  ) {
    for (const [field, value] of Object.entries(body)) {
      if (
        field === key &&
        typeof value === "string"
      ) {
        return value.trim();
      }
    }
  }

  return "";
}

export async function POST(req: Request) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (
    session.user.role !== "PARENT" &&
    session.user.role !== "ADULT"
  ) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const body: unknown =
    await req.json();

  let studentId =
    getStringField(body, "studentId");

  const sessionId =
    getStringField(body, "sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session." },
      { status: 400 }
    );
  }

  // Parent registration

  if (
    session.user.role === "PARENT"
  ) {
    if (!studentId) {
      return NextResponse.json(
        {
          error:
            "Student is required.",
        },
        {
          status: 400,
        }
      );
    }

    const child =
      await prisma.studentProfile.findUnique({
        where: {
          id: studentId,
        },
      });

    if (!child) {
      return NextResponse.json(
        {
          error:
            "Student not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      child.parentId !==
      session.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized student.",
        },
        {
          status: 403,
        }
      );
    }
  }

  // Adult registration

  if (
    session.user.role === "ADULT"
  ) {
    const profile =
      await prisma.studentProfile.findUnique({
        where: {
          studentUserId:
            session.user.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Your learner profile has not been created yet. Please contact the center before registering.",
        },
        {
          status: 404,
        }
      );
    }

    studentId = profile.id;
  }

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
          "Already registered.",
      },
      {
        status: 400,
      }
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
      {
        error:
          "Session not found.",
      },
      {
        status: 404,
      }
    );
  }

  const full =
    (sessionData.capacityOverride ??
      sessionData.course.capacity) != null &&
    sessionData.registrations.length >=
      (sessionData.capacityOverride ??
        sessionData.course.capacity ??
        0);

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

  const admins =
    await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });

  await prisma.notification.createMany({
    data: admins.map(
      (admin) => ({
        userId: admin.id,

        type:
          "REGISTRATION",

        title:
          "New Registration",

        message:
          full
            ? "A student joined the waitlist."
            : "A new registration request has been submitted.",
      })
    ),
  });

  return NextResponse.json({
    registration,

    status:
      registration.status,
  });
}
