import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogoutButton from "@/components/logout-button";
import NotificationBell from "@/components/notification-bell";

export default async function AdminDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Welcome Card */}

      <div
        className="mb-8 rounded-3xl p-8 shadow-sm"
        style={{
          background: "#FFFFFF",
          border: "1px solid #D0CCCD",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-lg text-gray-600">
              Welcome back,
              {" "}
              {session.user.email}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              System Status:
              {" "}
              <span className="font-medium text-green-600">
                All services operational
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Management */}

      <h2 className="mb-4 text-xl font-semibold text-gray-700">
        Management
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <Link
          href="/admin/users"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            User Management
          </h3>

          <p className="mt-2 text-gray-500">
            Create, edit and manage
            user accounts.
          </p>
        </Link>

        <Link
          href="/courses"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Courses
          </h3>

          <p className="mt-2 text-gray-500">
            Manage courses,
            sessions and teachers.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Course Categories
          </h3>

          <p className="mt-2 text-gray-500">
            Create and manage course
            categories.
          </p>
        </Link>

        <Link
          href="/calendar"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Calendar
          </h3>

          <p className="mt-2 text-gray-500">
            View the center schedule.
          </p>
        </Link>

      </div>

      {/* Operations */}

      <h2 className="mb-4 mt-10 text-xl font-semibold text-gray-700">
        Operations
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <Link
          href="/admin/registrations"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Registration Queue
          </h3>

          <p className="mt-2 text-gray-500">
            Review pending
            registrations.
          </p>
        </Link>

        <Link
          href="/admin/payments"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Payments
          </h3>

          <p className="mt-2 text-gray-500">
            Manage invoices and
            payment status.
          </p>
        </Link>

        <Link
          href="/messages"
          className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold">
            Messages
          </h3>

          <p className="mt-2 text-gray-500">
            View and reply to
            messages.
          </p>
        </Link>

      </div>
    </div>
  );
}