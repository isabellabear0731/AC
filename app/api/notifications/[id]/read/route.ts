import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } =
    await params;

  const notification =
    await prisma.notification.findUnique({
      where: {
        id,
      },
    });

  if (!notification) {
    return NextResponse.json(
      {
        error: "Notification not found",
      },
      {
        status: 404,
      }
    );
  }

  if (
    notification.userId !==
    session.user.id
  ) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  await prisma.notification.update({
    where: {
      id,
    },

    data: {
      isRead: true,
    },
  });

  return NextResponse.json({
    success: true,
  });
}