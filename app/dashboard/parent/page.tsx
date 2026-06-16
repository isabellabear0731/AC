import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import NotificationBell from "@/components/notification-bell";

export default async function ParentDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }

  const parent =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },

      include: {
        children: {
          include: {
            studentUser: true,
          },
        },
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Parent Dashboard
      </h1>

      <p className="mt-2">
        Welcome, {session.user.name}
      </p>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <LogoutButton />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {parent?.children.map((child) => (
          <Link
            key={child.id}
            href={`/parent/children/${child.id}`}
            className="rounded-xl border p-6 hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-semibold">
              {child.studentUser.firstName}{" "}
              {child.studentUser.lastName}
            </h2>

            <p className="text-gray-500 mt-2">
              View schedule and attendance
            </p>
          </Link>
        ))}

        <Link
          href="/parent/calendar"
          className="rounded-xl border p-6 hover:bg-gray-50 transition"
        >
          <h2 className="text-2xl font-semibold">
            Family Calendar
          </h2>

          <p className="text-gray-500 mt-2">
            View all upcoming sessions
          </p>
        </Link>


        <Link
          href="/messages"
          className="rounded border p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">
            Messages
          </h2>


          <p>
            View your inbox
          </p>
        </Link>

        <Link href="/parent/courses"
          className="rounded border p-4 hover:bg-gray-50">
            <h2 className="text-2xl font-semibold">
            Browse Courses
          </h2>
          <p className="text-gray-500 mt-2">
            Register for courses
          </p>
        </Link>

        <Link
          href="/parent/payments"
          className="rounded-xl border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">
            Payments
          </h2>

          <p>
            View invoices and payment status
          </p>
        </Link>
      </div>
    </div>
  );
}