import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest
) {
  const session =
    await getServerSession(authOptions);

  if (
    !session ||
    (
      session.user.role !== "ADMIN" &&
      session.user.role !== "TEACHER"
    )
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

  const body =
    await request.json();

  const resource =
    await prisma.teachingResource.create({
      data: {
        sessionId:
          body.sessionId || null,

        uploadedById:
          session.user.id,

        title:
          body.title,

        description:
          body.description || null,

        fileUrl:
          body.fileUrl,

        mimeType:
          body.mimeType,

        resourceType:
          body.resourceType,

        visibleToStudent:
          body.visibleToStudent,

        visibleToParent:
          body.visibleToParent,
      },
    });

  return NextResponse.json(resource);
}