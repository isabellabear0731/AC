import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  User,
  Clock3,
  MailOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const message =
    await prisma.message.findUnique({
      where: {
        id,
      },

      include: {
        sender: true,
      },
    });

  if (!message) {
    notFound();
  }

  if (!message.isRead) {
    await prisma.message.update({
      where: {
        id,
      },

      data: {
        isRead: true,
      },
    });
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <Link
            href="/messages"
            className="rounded-xl border bg-white p-3 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>

            <h1 className="text-4xl font-bold">
              Conversation
            </h1>

            <p className="mt-2 text-gray-500">
              View your message details.
            </p>

          </div>

        </div>

      </div>

      <div className="rounded-3xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

              <User className="h-8 w-8 text-[#7AAACD]" />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">

                {message.sender.firstName}{" "}
                {message.sender.lastName}

              </h2>

              <p className="text-gray-500">

                {message.sender.role}

              </p>

            </div>

          </div>

        </div>

        <div className="space-y-6 p-8">

          <div className="flex">

            <div className="max-w-2xl rounded-3xl bg-[#7AAACD]/10 p-6">

              <p className="whitespace-pre-wrap leading-7">

                {message.content}

              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-6 border-t pt-6 text-sm text-gray-500">

            <div className="flex items-center gap-2">

              <Clock3 className="h-4 w-4" />

              {message.createdAt.toLocaleDateString()}{" "}
              •{" "}
              {message.createdAt.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}

            </div>

            <div className="flex items-center gap-2">

              <MailOpen className="h-4 w-4 text-green-600" />

              Read

            </div>

          </div>

        </div>

      </div>

      <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

        <h3 className="text-lg font-semibold">
          Reply
        </h3>

        <p className="mt-2 text-gray-500">
          Reply functionality will be available in a future update.
        </p>

        <textarea
          disabled
          placeholder="Type your reply..."
          className="mt-6 h-36 w-full rounded-2xl border bg-gray-50 p-4 text-gray-400"
        />

        <button
          disabled
          className="mt-6 rounded-xl bg-gray-300 px-6 py-3 font-medium text-white"
        >
          Send Reply
        </button>

      </div>

    </div>
  );
}