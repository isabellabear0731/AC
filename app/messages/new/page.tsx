import { prisma } from "@/lib/prisma";
import MessageForm from "@/components/message-form";

export default async function NewMessagePage() {
  const users = await prisma.user.findMany({
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
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        New Message
      </h1>

      <div className="mt-6">
        <MessageForm users={users} />
      </div>
    </div>
  );
}