import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
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

  const { id } = await params;

  const resource =
    await prisma.teachingResource.findUnique({
      where: {
        id,
      },
    });

  if (!resource) {
    return NextResponse.json(
      {
        error: "Not found",
      },
      {
        status: 404,
      }
    );
  }

  if (
    session.user.role === "TEACHER" &&
    resource.uploadedById !== session.user.id &&
    !(
      resource.sessionId &&
      (
        await prisma.courseSession.findFirst({
          where: {
            id: resource.sessionId,
            teacherId: session.user.id,
          },
          select: { id: true },
        })
      )
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to delete this resource." },
      { status: 403 }
    );
  }

  // remove from storage

  let path: string | undefined;
  try {
    path = new URL(resource.fileUrl).pathname.split(
      "/object/public/teaching-resources/"
    )[1];
  } catch (error) {
    console.error("Resource file URL could not be parsed", {
      resourceId: resource.id,
      error,
    });
  }

  if (path) {
    const { error } = await getSupabase().storage
      .from("teaching-resources")
      .remove([decodeURIComponent(path)]);

    if (error) {
      console.error("Resource file deletion failed", {
        resourceId: resource.id,
        path,
        error,
      });
      return NextResponse.json(
        { error: "Unable to delete the stored file. Please try again." },
        { status: 502 }
      );
    }
  }

  await prisma.teachingResource.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
