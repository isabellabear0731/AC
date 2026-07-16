import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function NotificationBell() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const count =
    await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

  return (
    <Link
      href="/notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-sm transition hover:bg-gray-50"
    >
      <Bell className="h-5 w-5 text-gray-700" />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}