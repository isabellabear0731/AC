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
        status: "REJECTED",
      },

      include: {
        student: true,
      },
    });

  await prisma.notification.create({
    data: {
      userId:
        registration.student.parentId,

      type: "REGISTRATION",

      title:
        "Registration Rejected",

      message:
        "Your registration was rejected.",
    },
  });

  return NextResponse.redirect(
    new URL(
      "/admin/registrations",
      req.url
    )
  );
}