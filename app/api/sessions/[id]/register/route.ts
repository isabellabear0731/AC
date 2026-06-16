import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const formData = await req.formData();

  const studentId = formData
    .get("studentId")
    ?.toString();

  if (!studentId) {
    return NextResponse.json(
      { error: "Student required" },
      { status: 400 }
    );
  }

  await prisma.registration.create({
    data: {
      studentId,
      sessionId: id,
    },
  });

  return NextResponse.redirect(
    new URL(req.headers.get("referer") ?? "/", req.url)
  );
}