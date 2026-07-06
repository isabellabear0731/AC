import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all course categories
export async function GET() {
  try {
    const categories =
      await prisma.courseCategory.findMany({
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load categories.",
      },
      {
        status: 500,
      }
    );
  }
}

// Create a new category
export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const category =
      await prisma.courseCategory.create({
        data: {
          name: body.name,
          color:
            body.color || null,
          sortOrder:
            body.sortOrder ?? 0,
          isActive:
            body.isActive ?? true,
        },
      });

    return NextResponse.json(
      category,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create category.",
      },
      {
        status: 500,
      }
    );
  }
}