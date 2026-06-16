import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const message =
    await prisma.message.findUnique({
      where: { id },

      include: {
        sender: true,
      },
    });

  if (!message) {
    notFound();
  }

  await prisma.message.update({
    where: { id },

    data: {
      isRead: true,
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Message
      </h1>

      <p className="mt-4 font-semibold">
        From: {message.sender.firstName}{" "}
        {message.sender.lastName}
      </p>

      <p className="mt-4 whitespace-pre-wrap">
        {message.content}
      </p>
    </div>
  );
}