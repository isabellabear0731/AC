import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest
) {
  try {
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

  const form =
    await request.formData();

  const file =
    form.get("file") as File;
  
  const MAX_SIZE = 30 * 1024 * 1024; // 30 MB
    if (file && file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "Maximum upload size is 30 MB.",
        },
        {
          status: 400,
        }
      );
    }

  const resourceType =
    form.get("resourceType") as string;

  if (!file) {
    return NextResponse.json(
      {
        error: "No file selected.",
      },
      {
        status: 400,
      }
    );
  }

  const folder =
    resourceType.toLowerCase() + "s";

  const fileName =
    `${Date.now()}-${file.name}`;

  const path =
    `${folder}/${fileName}`;

  const bytes =
    await file.arrayBuffer();

  const { error } =
    await supabase.storage
      .from("teaching-resources")
      .upload(
        path,
        Buffer.from(bytes),
        {
          contentType: file.type,
          upsert: false,
        }
      );

  if (error) {
  console.error("Supabase upload error:", error);

  return NextResponse.json(
    {
      error: error.message,
    },
    {
      status: 500,
    }
  );
}

  const {
    data: publicUrl,
  } = supabase.storage
    .from("teaching-resources")
    .getPublicUrl(path);

  return NextResponse.json({
    fileUrl:
      publicUrl.publicUrl,

    mimeType:
      file.type,
  });
} catch (err) {

  console.error(err);

  return NextResponse.json(
    {
      error: String(err),
    },
    {
      status: 500,
    }
  );

}
}