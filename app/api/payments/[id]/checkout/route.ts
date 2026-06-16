import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
);

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
    await prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        registration: {
          include: {
            session: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

  if (!payment) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  if (payment.status === "PAID") {
    return NextResponse.json(
      { error: "Already paid" },
      { status: 400 }
    );
  }

  const checkout =
    await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "usd",

            unit_amount:
              Math.round(
                payment.amount * 100
              ),

            product_data: {
              name:
                payment.registration
                  .session.course.title,
            },
          },
        },
      ],

      metadata: {
        paymentId: payment.id,
      },

      success_url:
        `${process.env.NEXTAUTH_URL}/parent/payments?success=1`,

      cancel_url:
        `${process.env.NEXTAUTH_URL}/parent/payments?cancel=1`,
    });

    return NextResponse.redirect(
        checkout.url!
      );
}