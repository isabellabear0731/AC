import { ResourceType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";

const resourceTypes = new Set(Object.values(ResourceType));
const storagePathMarker = "/object/public/teaching-resources/";

function storagePathFromUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!configuredUrl || url.origin !== new URL(configuredUrl).origin) {
      return null;
    }
    const path = url.pathname.split(storagePathMarker)[1];
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Resource create received invalid JSON", { error });
    return NextResponse.json({ error: "Invalid resource request." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : null;
  const fileUrl = typeof body.fileUrl === "string" ? body.fileUrl : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const resourceType = typeof body.resourceType === "string" ? body.resourceType : "";

  if (!sessionId || !title || !fileUrl || !mimeType || !resourceTypes.has(resourceType as ResourceType)) {
    return NextResponse.json({ error: "Complete resource details are required." }, { status: 400 });
  }
  if (typeof body.visibleToStudent !== "boolean" || typeof body.visibleToParent !== "boolean") {
    return NextResponse.json({ error: "Resource visibility settings are required." }, { status: 400 });
  }

  const storagePath = storagePathFromUrl(fileUrl);
  if (!storagePath) {
    return NextResponse.json({ error: "The uploaded file URL is invalid." }, { status: 400 });
  }

  try {
    const courseSession = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      select: { id: true, teacherId: true },
    });
    if (!courseSession) {
      return NextResponse.json({ error: "Teaching session not found." }, { status: 404 });
    }
    if (session.user.role === "TEACHER" && courseSession.teacherId !== session.user.id) {
      return NextResponse.json({ error: "You are not assigned to this teaching session." }, { status: 403 });
    }

    const { error: fileVerificationError } = await getSupabase()
      .storage
      .from("teaching-resources")
      .createSignedUrl(storagePath, 60);
    if (fileVerificationError) {
      console.error("Uploaded resource could not be verified", {
        actorId: session.user.id,
        sessionId,
        storagePath,
        error: fileVerificationError,
      });
      return NextResponse.json({ error: "The uploaded file could not be verified." }, { status: 400 });
    }

    const existing = await prisma.teachingResource.findFirst({
      where: { uploadedById: session.user.id, fileUrl },
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    const resource = await prisma.teachingResource.create({
      data: {
        sessionId,
        uploadedById: session.user.id,
        title,
        description: description || null,
        fileUrl,
        mimeType,
        resourceType: resourceType as ResourceType,
        visibleToStudent: body.visibleToStudent,
        visibleToParent: body.visibleToParent,
      },
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Resource record creation failed", {
      actorId: session.user.id,
      sessionId,
      error,
    });
    try {
      const { error: removeError } = await getSupabase().storage.from("teaching-resources").remove([storagePath]);
      if (removeError) console.error("Resource cleanup failed", { storagePath, error: removeError });
    } catch (cleanupError) {
      console.error("Resource storage cleanup could not start", { storagePath, error: cleanupError });
    }
    return NextResponse.json({ error: "Unable to save the resource. The uploaded file was removed." }, { status: 500 });
  }
}
