import Link from "next/link";
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
      className="relative text-2xl"
    >
      🔔

      {count > 0 && (
        <span
          className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 text-xs text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}