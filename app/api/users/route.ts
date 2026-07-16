import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const role = searchParams.get("role");
  const active = searchParams.get("active");

  const users = await prisma.user.findMany({
    where: {
      ...(role
        ? {
            role: role as
              | "PARENT"
              | "STUDENT"
              | "TEACHER"
              | "ADMIN",
          }
        : {}),

      ...(active === "true"
        ? {
            isActive: true,
          }
        : {}),

      ...(active === "false"
        ? {
            isActive: false,
          }
        : {}),
    },

    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  });

  return NextResponse.json(users);
}