import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import {
  MessageCircle,
  Mail,
  MailOpen,
  Plus,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const messages =
    await prisma.message.findMany({
      where: {
        receiverId: session.user.id,
      },

      include: {
        sender: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const unread =
    messages.filter(
      (m) => !m.isRead
    ).length;

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Messages
          </h1>

          <p className="mt-2 text-gray-500">
            Communicate with teachers and center staff.
          </p>

        </div>

        <Link
          href="/messages/new"
          className="flex items-center gap-2 rounded-xl bg-[#7AAACD] px-5 py-3 text-white transition hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          New Message
        </Link>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Messages"
          value={String(messages.length)}
          icon={
            <MessageCircle className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Unread"
          value={String(unread)}
          icon={
            <Mail className="h-5 w-5 text-red-600" />
          }
        />

        <StatCard
          title="Read"
          value={String(messages.length - unread)}
          icon={
            <MailOpen className="h-5 w-5 text-green-600" />
          }
        />

      </div>

      {messages.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

          <MessageCircle className="mx-auto h-14 w-14 text-gray-300" />

          <h2 className="mt-5 text-2xl font-semibold">
            No Messages
          </h2>

          <p className="mt-3 text-gray-500">
            Messages from teachers and staff will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {messages.map((message) => (

            <Link
              key={message.id}
              href={`/messages/${message.id}`}
              className="block rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

                    <User className="h-7 w-7 text-[#7AAACD]" />

                  </div>

                  <div>

                    <h2 className="text-xl font-semibold">

                      {message.sender.firstName}{" "}
                      {message.sender.lastName}

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {message.sender.role}
                    </p>

                  </div>

                </div>

                {!message.isRead && (

                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    NEW
                  </span>

                )}

              </div>

              <p className="mt-5 line-clamp-2 text-gray-700">
                {message.content}
              </p>

              <div className="mt-5 flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  {message.createdAt.toLocaleDateString()} •{" "}
                  {message.createdAt.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>

                <span className="text-sm font-medium text-[#7AAACD]">
                  Open →
                </span>

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-3">
          {icon}
        </div>

      </div>

    </div>
  );
}
