import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  const registration =
    await prisma.registration.update({
      where: { id },

      data: {
        status: "CANCELLED",
      },

      include: {
        student: true,
        session: {
          include: {
            course: true,
          },
        },
      },
    });

  // Find first waitlisted student
  const nextWaitlist =
    await prisma.registration.findFirst({
      where: {
        sessionId:
          registration.sessionId,

        status: "WAITLISTED",
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  if (nextWaitlist) {
    await prisma.registration.update({
      where: {
        id: nextWaitlist.id,
      },

      data: {
        status: "APPROVED",
      },
    });

    const student =
      await prisma.studentProfile.findUnique({
        where: {
          id:
            nextWaitlist.studentId,
        },
      });

    if (student?.parentId) {
      await prisma.notification.create({
        data: {
          userId:
            student.parentId,

          type:
            "REGISTRATION",

          title:
            "Seat Available",

          message:
            "A waitlisted registration has been approved.",
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
  });
}