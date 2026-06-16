import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      teachers: true,
      sessions: true,
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

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
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