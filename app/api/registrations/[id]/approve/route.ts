import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendRegistrationApprovedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

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

  const { id } =
    await params;

  const existingRegistration =
    await prisma.registration.findUnique({
      where: {
        id,
      },

      select: {
        status: true,
      },
    });

  const registration =
    await prisma.registration.update({
      where: {
        id,
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

  const existingPayment =
    await prisma.payment.findUnique({
      where: {
        registrationId:
          registration.id,
      },
    });

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        registrationId:
          registration.id,

        amount:
          registration.session.course.price,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId:
        recipientUserId,

      type: "REGISTRATION",

      title:
        "Registration Approved",

      message:
        `Your registration for "${registration.session.course.title}" has been approved.`,
    },
  });

  try {
    await sendRegistrationApprovedEmail({
      email:
        recipientEmail,

      firstName:
        recipientFirstName,

      course:
        registration.session.course.title,
    });
  } catch (error) {
    console.error(
      "Failed to send approval email:",
      error
    );
  }

  await logAudit({
    actorId: session.user.id,

    action: "APPROVE_REGISTRATION",

    entityType: "Registration",
    entityId: registration.id,

    description:
      `Approved registration for "${registration.session.course.title}".`,

    before: {
      status:
        existingRegistration?.status,
    },

    after: {
      status:
        registration.status,

      approvedAt:
        registration.approvedAt,

      paymentCreated:
        !existingPayment,
    },

    request: req,
  });

  return NextResponse.redirect(
    new URL(
      "/admin/registrations",
      req.url
    )
  );
}
