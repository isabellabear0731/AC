import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import {sendRegistrationRejectedEmail,} from "@/lib/email";

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

  const form =
    await req.formData();

  const reason =
    form
      .get("reason")
      ?.toString()
      .trim();

  if (!reason) {
    return NextResponse.json(
      {
        error:
          "Rejection reason is required.",
      },
      {
        status: 400,
      }
    );
  }

  const registration =
    await prisma.registration.update({
      where: {
        id,
      },

      data: {
        status: "REJECTED",
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
          "Registration Rejected",

        message:
          `Your registration for "${registration.session.course.title}" was rejected.\n\nReason:\n${reason}`,
      },
    });

    try {
      await sendRegistrationRejectedEmail({
        email:
          recipientEmail,

        firstName:
          recipientFirstName,

        course:
          registration.session.course.title,

        reason,
      });
    } catch (error) {
      console.error(
        "Failed to send rejection email:",
        error
      );
    }

    return NextResponse.redirect(
      new URL(
        "/admin/registrations",
        req.url
      )
    );
}
