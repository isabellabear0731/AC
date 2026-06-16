import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import NotificationBell from "@/components/notification-bell";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  <Link
  href="/admin/users"
  className="rounded border p-4"
  >
  User Management
  </Link>

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Admin Dashboard
      </h1>

      <p>Welcome, {session.user.email}</p>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <LogoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/users"
          className="rounded border p-4"
        >
          User Management
        </a>

        <a
          href="/courses"
          className="rounded border p-4"
        >
          Courses
        </a>

        <Link
          href="/calendar"
          className="rounded border p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">Calendar</h2>
          <p>View all scheduled sessions</p>
        </Link>

        <Link
          href="/admin/payments"
          className="rounded-xl border p-6 hover:bg-gray-50"
        >
          <h2 className="font-semibold">
            Payments
          </h2>

          <p>
            Manage invoices and payments
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

        <Link
          href="/admin/registrations"
          className="rounded-xl border p-4 hover:bg-gray-50"
        >
          <h2 className="font-semibold">
            Registration Queue
          </h2>

          <p>
            Review pending enrollments
          </p>
        </Link>

      </div>
    </div>
  );
}

