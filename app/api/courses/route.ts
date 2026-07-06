import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      category: true,
      sessions: {
        include: {
          teacher: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const categoryId =
    typeof body.categoryId === "string"
      ? body.categoryId
      : "";

  const category = await prisma.courseCategory.findFirst({
    where: {
      id: categoryId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "A valid category is required" },
      { status: 400 }
    );
  }

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      categoryId: category.id,
      price: Number(body.price),
      location: body.location,
  
      capacity:
        body.capacity
          ? Number(body.capacity)
          : null,
    },
  });

  return NextResponse.json(course);
}
