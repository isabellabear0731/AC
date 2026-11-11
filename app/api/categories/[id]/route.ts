import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function categoryError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return categoryError("Unauthorized", 401);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const color = typeof body.color === "string" ? body.color : null;
    const sortOrder = Number(body.sortOrder);

    if (!name || name.length > 100) {
      return categoryError("A category name between 1 and 100 characters is required.", 400);
    }

    if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
      return categoryError("Color must be a valid hexadecimal color.", 400);
    }

    if (!Number.isInteger(sortOrder)) {
      return categoryError("Sort order must be a whole number.", 400);
    }

    if (typeof body.isActive !== "boolean") {
      return categoryError("Active status is required.", 400);
    }

    const existing = await prisma.courseCategory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return categoryError("Category not found.", 404);
    }

    const duplicate = await prisma.courseCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return categoryError("Category already exists.", 400);
    }

    const category = await prisma.courseCategory.update({
      where: { id },
      data: { name, color, sortOrder, isActive: body.isActive },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category update failed", { categoryId: id, error });
    return categoryError("Unable to update the category.", 500);
  }
}
