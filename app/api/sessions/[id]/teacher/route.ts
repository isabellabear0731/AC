import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession(authOptions);

  if (!authSession || authSession.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const formData = await req.formData();
  const teacherId =
    formData.get("teacherId")?.toString() || null;

  if (teacherId) {
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        role: "TEACHER",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Invalid teacher" },
        { status: 400 }
      );
    }
  }

  const courseSession = await prisma.courseSession.update({
    where: {
      id,
    },
    data: {
      teacherId,
    },
    select: {
      courseId: true,
    },
  });

  return NextResponse.redirect(
    new URL(
      `/admin/courses/${courseSession.courseId}`,
      req.url
    )
  );
}
