import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";

const MAX_SIZE = 30 * 1024 * 1024;
const resourceTypes = new Set(["MATERIAL", "PHOTO", "EVALUATION"]);

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-160) || "upload";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const sessionId = form.get("sessionId");
    const resourceType = form.get("resourceType");
    const uploadId = form.get("uploadId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file selected." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "The selected file is empty." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Maximum upload size is 30 MB." }, { status: 400 });
    }
    if (typeof sessionId !== "string" || !sessionId || typeof resourceType !== "string" || !resourceTypes.has(resourceType)) {
      return NextResponse.json({ error: "A valid session and resource type are required." }, { status: 400 });
    }
    if (typeof uploadId !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(uploadId)) {
      return NextResponse.json({ error: "Invalid upload request. Please try again." }, { status: 400 });
    }

    const courseSession = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      select: { teacherId: true },
    });
    if (!courseSession) {
      return NextResponse.json({ error: "Teaching session not found." }, { status: 404 });
    }
    if (session.user.role === "TEACHER" && courseSession.teacherId !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this teaching session." }, { status: 403 });
    }

    const path = `${resourceType.toLowerCase()}s/${sessionId}/${uploadId}-${safeFileName(file.name)}`;
    const supabase = getSupabase();
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from("teaching-resources").upload(
      path,
      Buffer.from(bytes),
      { contentType: file.type || "application/octet-stream", upsert: false }
    );

    if (uploadError && !/already exists/i.test(uploadError.message)) {
      console.error("Supabase resource upload failed", {
        actorId: session.user.id,
        sessionId,
        path,
        error: uploadError,
      });
      return NextResponse.json({ error: "File upload failed. Please try again." }, { status: 502 });
    }

    const { data: publicUrl } = supabase.storage.from("teaching-resources").getPublicUrl(path);
    return NextResponse.json({
      fileUrl: publicUrl.publicUrl,
      mimeType: file.type || "application/octet-stream",
    });
  } catch (error) {
    console.error("Resource upload request failed", {
      actorId: session.user.id,
      error,
    });
    return NextResponse.json({ error: "File upload failed. Please try again." }, { status: 500 });
  }
}
