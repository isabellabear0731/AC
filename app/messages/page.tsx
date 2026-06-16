import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MessagesPage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const messages =
    await prisma.message.findMany({
      where: {
        receiverId:
          session.user.id,
      },

      include: {
        sender: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Inbox
      </h1>

      <Link
        href="/messages/new"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        New Message
      </Link>

      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <p>No messages.</p>
        ) : (
          messages.map((m) => (
            <Link
              key={m.id}
              href={`/messages/${m.id}`}
              className="block rounded border p-4 hover:bg-gray-50"
            >
              <p className="font-semibold">
                From: {m.sender.firstName}{" "}
                {m.sender.lastName}
              </p>

              <p className="mt-2 line-clamp-2">
                {m.content}
              </p>

              {!m.isRead && (
                <span className="mt-2 inline-block rounded bg-red-100 px-2 py-1 text-sm text-red-700">
                  New
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}