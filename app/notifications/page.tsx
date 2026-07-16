import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NotificationCard from "@/components/notification-card";

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
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Notifications
        </h1>
  
        <p className="mt-2 text-gray-500">
          Stay updated with your courses and center activities.
        </p>
      </div>
  
      {notifications.length === 0 ? (
  
        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
  
          <h2 className="text-2xl font-semibold">
            You're all caught up!
          </h2>
  
          <p className="mt-3 text-gray-500">
            No notifications at this time.
          </p>
  
        </div>
  
      ) : (
  
        <div className="space-y-5">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
  
      )}
    </div>
  );
}