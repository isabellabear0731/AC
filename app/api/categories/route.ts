import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const categories =
      await prisma.courseCategory.findMany({
        include: {
          _count: {
            select: {
              courses: true,
            },
          },
        },

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

export async function POST(
  request: NextRequest
) {
  const session =
    await getServerSession(authOptions);

  if (
    !session ||
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.json();

    const existing =
      await prisma.courseCategory.findFirst({
        where: {
          name: {
            equals: body.name.trim(),
            mode: "insensitive",
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Category already exists.",
        },
        {
          status: 400,
        }
      );
    }

    const category =
      await prisma.courseCategory.create({
        data: {
          name: body.name.trim(),
          color:
            body.color || "#7AAACD",
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