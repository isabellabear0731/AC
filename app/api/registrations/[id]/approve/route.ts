import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: {
    params: Promise<{ id: string }>
  }
) {
  const { id } = await params;

  const registration =
  await prisma.registration.update({
    where: { id },

    data: {
      status: "APPROVED",
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
        registration.student.parentId,

      type: "REGISTRATION",

      title:
        "Registration Approved",

      message:
        "Your registration was approved.",
    },
  });

  return NextResponse.redirect(
    new URL(
      "/admin/registrations",
      req.url
    )
  );
}