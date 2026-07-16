import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

  // remove from storage

  const url =
    new URL(resource.fileUrl);

  const path =
    url.pathname.split(
      "/object/public/teaching-resources/"
    )[1];

  if (path) {
    await supabase.storage
      .from("teaching-resources")
      .remove([path]);
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