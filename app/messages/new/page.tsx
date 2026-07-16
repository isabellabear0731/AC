import { prisma } from "@/lib/prisma";
import MessageForm from "@/components/message-form";

import {
  MessageCircle,
  Users,
  Pencil,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewMessagePage() {
  const users =
    await prisma.user.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          role: "asc",
        },
        {
          firstName: "asc",
        },
      ],
    });

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          New Message
        </h1>

        <p className="mt-2 text-gray-500">
          Send a message to teachers, parents, students, or staff.
        </p>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Recipients"
          value={String(users.length)}
          icon={
            <Users className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Communication"
          value="Portal"
          icon={
            <MessageCircle className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Replies"
          value="Coming Soon"
          icon={
            <Pencil className="h-5 w-5 text-[#7AAACD]" />
          }
        />

      </div>

      {/* Composer */}

      <div className="rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-8 py-6">

          <h2 className="text-2xl font-semibold">
            Compose Message
          </h2>

          <p className="mt-2 text-gray-500">
            Choose a recipient and write your message below.
          </p>

        </div>

        <div className="p-8">

          <MessageForm users={users} />

        </div>

      </div>

      {/* Future */}

      <div className="mt-8 rounded-3xl border bg-[#F9FAFB] p-6">

        <h3 className="text-lg font-semibold">
          Coming Soon
        </h3>

        <ul className="mt-4 space-y-2 text-gray-600">

          <li>• Email delivery</li>

          <li>• SMS notifications</li>

          <li>• Two-way conversations</li>

          <li>• File attachments</li>

          <li>• Read receipts</li>

        </ul>

      </div>

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