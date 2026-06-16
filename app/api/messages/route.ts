import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: Request) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  await prisma.notification.create({
    data: {
      userId: body.receiverId,
  
      type: "MESSAGE",
  
      title: "New Message",
  
      message:
        "You received a new message.",
  
      isRead: false,
    },
  });
  
  const message =
    await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: body.receiverId,
        content: body.content,
      },
    });

  
  return NextResponse.json(message);

}
