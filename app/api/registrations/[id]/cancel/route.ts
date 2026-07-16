import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
  sendRegistrationCancelledEmail,
  sendRegistrationApprovedEmail,
} from "@/lib/email";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session =
    await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const form =
    await req.formData();

  const reason =
    form
      .get("reason")
      ?.toString()
      .trim() || null;

  const registration =
    await prisma.registration.update({
      where: {
        id,
      },

      data: {
        status: "CANCELLED",
        cancelReason: reason,
      },

      include: {
        student: {
          include: {
            parent: true,
            studentUser: true,
          },
        },

        session: {
          include: {
            course: true,
          },
        },
      },
    });

  const parent = registration.student.parent;

  const recipientUserId =
    parent?.id ??
    registration.student.studentUserId;

  const recipientEmail =
    parent?.email ??
    registration.student.studentUser.email;

  const recipientFirstName =
    parent?.firstName ??
    registration.student.studentUser.firstName;

  await prisma.notification.create({
    data: {
      userId:
        recipientUserId,

      type: "REGISTRATION",

      title:
        "Registration Cancelled",

      message:
        `Your registration for "${registration.session.course.title}" has been cancelled.${
          reason ? `\n\nReason:\n${reason}` : ""
        }`,
    },
  });

  try {
    await sendRegistrationCancelledEmail({
      email:
        recipientEmail,

      firstName:
        recipientFirstName,

      course:
        registration.session.course.title,

      reason:
        reason ?? undefined,
    });
  } catch (error) {
    console.error(
      "Failed to send cancellation email:",
      error
    );
  }

  // Promote first waitlisted registration

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

      include: {
        student: {
          include: {
            parent: true,
            studentUser: true,
          },
        },

        session: {
          include: {
            course: true,
          },
        },
      },
    });

  if (nextWaitlist) {

    const approved =
      await prisma.registration.update({
        where: {
          id: nextWaitlist.id,
        },

        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          cancelReason: null,
        },

        include: {
          student: {
            include: {
              parent: true,
              studentUser: true,
            },
          },

          session: {
            include: {
              course: true,
            },
          },
      },
    });

    const approvedParent =
      approved.student.parent;

    const approvedRecipientUserId =
      approvedParent?.id ??
      approved.student.studentUserId;

    const approvedRecipientEmail =
      approvedParent?.email ??
      approved.student.studentUser.email;

    const approvedRecipientFirstName =
      approvedParent?.firstName ??
      approved.student.studentUser.firstName;

    const payment =
      await prisma.payment.findUnique({
        where: {
          registrationId:
            approved.id,
        },
      });

    if (!payment) {

      await prisma.payment.create({
        data: {
          registrationId:
            approved.id,

          amount:
            approved.session.course.price,
        },
      });

    }

    await prisma.notification.create({
      data: {
        userId:
          approvedRecipientUserId,

        type:
          "REGISTRATION",

        title:
          "Seat Available",

        message:
          `Good news! A seat became available and your registration for "${approved.session.course.title}" has been approved.`,
      },
    });

    try {
      await sendRegistrationApprovedEmail({
        email:
          approvedRecipientEmail,

        firstName:
          approvedRecipientFirstName,

        course:
          approved.session.course.title,
      });
    } catch (error) {
      console.error(
        "Failed to send waitlist approval email:",
        error
      );
    }

  }

  return NextResponse.json({
    success: true,
  });
}
