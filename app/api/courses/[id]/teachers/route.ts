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

  const teacherId =
    formData.get("teacherId")?.toString();

  if (!teacherId) {
    return NextResponse.json(
      { error: "Teacher required" },
      { status: 400 }
    );
  }
  
  const existing =
    await prisma.courseTeacher.findUnique({
      where: {
        courseId_teacherId: {
          courseId: id,
          teacherId,
        },
      },
    });

  if (!existing) {
    await prisma.courseTeacher.create({
      data: {
        courseId: id,
        teacherId,
      },
    });
  }

  return NextResponse.redirect(
    new URL(
      `/admin/courses/${id}`,
      req.url
    )
  );
}

