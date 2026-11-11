import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

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
    console.error("Category list failed", { error });

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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          error:
            "A category name between 1 and 100 characters is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.color &&
      (typeof body.color !== "string" ||
        !/^#[0-9a-fA-F]{6}$/.test(body.color))
    ) {
      return NextResponse.json(
        { error: "Color must be a valid hexadecimal color." },
        { status: 400 }
      );
    }

    const existing =
      await prisma.courseCategory.findFirst({
        where: {
          name: {
            equals: name,
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
          name,
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
    console.error("Category create failed", { error });

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
