import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const formData = await req.formData();

  const startTime = formData
    .get("startTime")
    ?.toString();

  const endTime = formData
    .get("endTime")
    ?.toString();

  const room = formData
    .get("room")
    ?.toString();

  if (!startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing times" },
      { status: 400 }
    );
  }

  await prisma.courseSession.create({
    data: {
      courseId: id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      room,
    },
  });

  return NextResponse.redirect(
    new URL(
      `/admin/courses/${id}`,
      req.url
    )
  );
}
