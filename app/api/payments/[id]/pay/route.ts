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

  const payment =
    await prisma.payment.update({
      where: {
        id,
      },

      data: {
        status: "PAID",
        paidAt: new Date(),
      },

      include: {
        registration: {
          include: {
            student: true,
          },
        },
      },
    });

  if (payment.registration.student.parentId) {
    await prisma.notification.create({
      data: {
        userId:
          payment.registration.student
            .parentId,

        type: "PAYMENT",

        title: "Payment Received",

        message:
          "Your payment has been recorded.",
      },
    });
  }

  return NextResponse.redirect(
    new URL(
      "/admin/payments",
      req.url
    )
  );
}