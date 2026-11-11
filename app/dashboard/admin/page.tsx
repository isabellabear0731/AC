import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  FolderKanban,
  MessageCircle,
  Tags,
  UserRoundCog,
} from "lucide-react";

import AppFooter from "@/components/app-footer";
import BrandLogo from "@/components/brand-logo";
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
    <div className="gps-page">
      <div className="gps-content">
      {/* Welcome Card */}

      <div className="gps-surface relative mb-10 overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#eff6e8]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-5">
            <BrandLogo compact className="hidden sm:inline-flex" />
            <div>
            <p className="gps-kicker">Center management</p>
            <h1 className="gps-heading mt-2 text-3xl font-bold sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-lg text-gray-600">
              Welcome back,
              {" "}
              {session.user.email}
            </p>

            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eff6e8] px-3 py-1.5 text-sm text-[#36721f]">
              <span className="flex h-2 w-2 rounded-full bg-[#4d9632]" />
              <span className="font-medium">
                System status:
              </span>
              <span>
                All services operational
              </span>
            </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Management */}

      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-[#113b2b] before:h-5 before:w-1 before:rounded-full before:bg-[#4d9632]">
        Management
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <Link
          href="/admin/users"
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <UserRoundCog className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <FolderKanban className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <Tags className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <CalendarDays className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
          <h3 className="text-xl font-semibold">
            Calendar
          </h3>

          <p className="mt-2 text-gray-500">
            View the center schedule.
          </p>
        </Link>

      </div>

      {/* Operations */}

      <h2 className="mb-5 mt-10 flex items-center gap-2 text-xl font-semibold text-[#113b2b] before:h-5 before:w-1 before:rounded-full before:bg-[#4d9632]">
        Operations
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <Link
          href="/admin/registrations"
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <FolderKanban className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <CreditCard className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
          className="group relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition hover:-translate-y-1 hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]"
        >
          <MessageCircle className="mb-5 h-8 w-8 rounded-2xl bg-[#eff6e8] p-1.5 text-[#4d9632]" />
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
      <AppFooter />
    </div>
  );
}
