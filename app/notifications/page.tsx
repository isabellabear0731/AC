import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const notifications =
    await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Notifications
      </h1>

      <div className="mt-6 space-y-4">
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold">
                {n.title}
              </h2>

              <p className="mt-2">
                {n.message}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {n.createdAt.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}