export const runtime = "nodejs";

import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();

  const signature =
    (await headers()).get(
      "stripe-signature"
    );

  if (!signature) {
    return new NextResponse(
      "Missing signature",
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        process.env
          .STRIPE_WEBHOOK_SECRET!
      );
  } catch (err) {
    return new NextResponse(
      "Webhook Error",
      { status: 400 }
    );
  }

  if (
    event.type ===
    "checkout.session.completed"
  ) {
    const session =
      event.data.object as Stripe.Checkout.Session;

    const paymentId =
      session.metadata?.paymentId;

    if (paymentId) {
      const payment =
        await prisma.payment.update({
          where: {
            id: paymentId,
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

      await prisma.notification.create({
        data: {
          userId:
            payment.registration.student
              .parentId,

          type: "PAYMENT",

          title:
            "Payment Successful",

          message:
            "Your payment was received.",
        },
      });
    }
  }

  return NextResponse.json({
    received: true,
  });
}