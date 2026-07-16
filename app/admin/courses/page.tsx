import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import {
  GraduationCap,
  Plus,
  Users,
  CalendarDays,
  FolderOpen,
  DollarSign,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const courses =
    await prisma.course.findMany({
      include: {
        category: true,
        sessions: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalSessions =
    courses.reduce(
      (sum, course) =>
        sum + course.sessions.length,
      0
    );

  const activeCourses =
    courses.filter(
      (course) => course.isActive
    ).length;

  const totalTeachers =
    new Set(
      courses.flatMap((course) =>
        course.sessions
          .map((session) => session.teacherId)
          .filter(Boolean)
      )
    ).size;

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Course Management
          </h1>

          <p className="mt-2 text-gray-500">
            Create and manage courses, sessions, and instructors.
          </p>

        </div>

        <div className="flex gap-3">
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 rounded-xl bg-[#7AAACD] px-5 py-3 text-white transition hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          New Course
        </Link>

        <Link
            href="/dashboard/admin"
            className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
          </div>

      </div>

      {/* Statistics */}

      <div className="mb-8 grid gap-5 md:grid-cols-4">

        <StatCard
          title="Courses"
          value={String(courses.length)}
          icon={
            <FolderOpen className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Active"
          value={String(activeCourses)}
          icon={
            <GraduationCap className="h-5 w-5 text-green-600" />
          }
        />

        <StatCard
          title="Sessions"
          value={String(totalSessions)}
          icon={
            <CalendarDays className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Teachers"
          value={String(totalTeachers)}
          icon={
            <Users className="h-5 w-5 text-[#7AAACD]" />
          }
        />

      </div>

      {courses.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

          <GraduationCap className="mx-auto h-14 w-14 text-gray-300" />

          <h2 className="mt-5 text-2xl font-semibold">
            No Courses Yet
          </h2>

          <p className="mt-3 text-gray-500">
            Create your first course to begin scheduling sessions.
          </p>

          <Link
            href="/admin/courses/new"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#7AAACD] px-5 py-3 text-white"
          >
            <Plus className="h-5 w-5" />
            Create Course
          </Link>

        </div>

      ) : (

        <div className="grid gap-6 lg:grid-cols-2">

          {courses.map((course) => (

            <div
              key={course.id}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

                    <GraduationCap className="h-7 w-7 text-[#7AAACD]" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-semibold">
                      {course.title}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      {course.category?.name ??
                        "Uncategorized"}
                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    course.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Info
                  icon={
                    <DollarSign className="h-4 w-4" />
                  }
                  title="Price"
                  value={`$${course.price}`}
                />

                <Info
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                  title="Sessions"
                  value={String(
                    course.sessions.length
                  )}
                />

                <Info
                  icon={
                    <Users className="h-4 w-4" />
                  }
                  title="Teachers"
                  value={String(
                    new Set(
                      course.sessions
                        .map(
                          (session) =>
                            session.teacherId
                        )
                        .filter(Boolean)
                    ).size
                  )}
                />

                <Info
                  icon={
                    <FolderOpen className="h-4 w-4" />
                  }
                  title="Category"
                  value={
                    course.category?.name ??
                    "Uncategorized"
                  }
                />

              </div>

              <div className="mt-6 flex items-center justify-between border-t pt-6">

                <div className="text-sm text-gray-500">

                  Created{" "}
                  {course.createdAt.toLocaleDateString()}

                </div>

                <Link
                  href={`/admin/courses/${course.id}`}
                  className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white transition hover:opacity-90"
                >
                  Manage Course
                </Link>

              </div>

            </div>

          ))}

        </div>

        )}

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

  function Info({
    icon,
    title,
    value,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
  }) {
    return (
      <div className="rounded-xl bg-gray-50 p-4">

        <div className="flex items-center gap-2 text-sm text-gray-500">

          {icon}

          <span>{title}</span>

        </div>

        <p className="mt-2 font-semibold">
          {value}
        </p>

      </div>
    );
  }