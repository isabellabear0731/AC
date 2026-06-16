import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    studentId,
    sessionId,
    status,
  } = body;

  const existing =
    await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

  if (existing) {
    const attendance =
      await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          status,
        },
      });

    return NextResponse.json(attendance);
  }

  const attendance =
    await prisma.attendance.create({
      data: {
        studentId,
        sessionId,
        status,
      },
    });

  return NextResponse.json(attendance);
}