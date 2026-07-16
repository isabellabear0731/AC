import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";

import {
  GraduationCap,
  ClipboardCheck,
  CalendarDays,
  MapPin,
  User,
} from "lucide-react";

import {
  getRegistrationStatusClassName,
  getRegistrationStatusLabel,
} from "@/lib/registration-status";

export const dynamic = "force-dynamic";

export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const child =
    await prisma.studentProfile.findUnique({
      where: {
        id,
      },

      include: {
        studentUser: true,

        registrations: {
          include: {
            session: {
              include: {
                course: true,
                teacher: true,
              },
            },
          },
        },

        attendance: {
          include: {
            session: {
              include: {
                course: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!child) {
    notFound();
  }

  const authSession =
    await getServerSession(authOptions);

  if (
    child.parentId !==
    authSession?.user.id
  ) {
    notFound();
  }

  const upcomingRegistrations =
    child.registrations
      .filter(
        (registration) =>
          registration.session.startTime >=
          new Date()
      )
      .sort(
        (a, b) =>
          a.session.startTime.getTime() -
          b.session.startTime.getTime()
      );

  const attendanceRate =
    child.attendance.length === 0
      ? "--"
      : `${Math.round(
          (child.attendance.filter(
            (record) =>
              record.status ===
                "PRESENT" ||
              record.status ===
                "LATE"
          ).length /
            child.attendance.length) *
            100
        )}%`;

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

            {child.studentUser.firstName}{" "}
            {child.studentUser.lastName}

          </h1>

          <p className="mt-2 text-gray-500">
            View your child's schedule,
            attendance, and learning
            progress.
          </p>

        </div>

        <Link
          href="/parent"
          className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
        >
          ← Parent Dashboard
        </Link>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Upcoming Classes"
          value={String(
            upcomingRegistrations.length
          )}
          icon={
            <GraduationCap className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Attendance Rate"
          value={attendanceRate}
          icon={
            <ClipboardCheck className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Attendance Records"
          value={String(
            child.attendance.length
          )}
          icon={
            <CalendarDays className="h-5 w-5 text-[#7AAACD]" />
          }
        />

      </div>

      {/* Upcoming Sessions */}

      <div className="rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-2xl font-semibold">
            Upcoming Sessions
          </h2>

        </div>

        {upcomingRegistrations.length === 0 ? (

          <div className="p-12 text-center">

            <h3 className="text-2xl font-semibold">
              No Upcoming Classes
            </h3>

            <p className="mt-3 text-gray-500">
              Future registrations will
              appear here automatically.
            </p>

          </div>

        ) : (

          <div className="space-y-5 p-6">

            {upcomingRegistrations.map(
              (registration) => (
                    <div
                      key={registration.id}
                      className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
    
                      <div className="flex items-start justify-between">
    
                        <div className="flex items-center gap-4">
    
                          <div className="rounded-2xl bg-[#7AAACD]/10 p-3">
    
                            <GraduationCap className="h-7 w-7 text-[#7AAACD]" />
    
                          </div>
    
                          <div>
    
                            <h3 className="text-xl font-semibold">
                              {registration.session.course.title}
                            </h3>
    
                            <p className="mt-2 text-gray-600">
                              {registration.session.startTime.toLocaleString()}
                            </p>
    
                          </div>
    
                        </div>
    
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-medium ${getRegistrationStatusClassName(
                            registration.status
                          )}`}
                        >
                          {getRegistrationStatusLabel(
                            registration.status
                          )}
                        </span>
    
                      </div>
    
                      <div className="mt-6 grid gap-5 md:grid-cols-3">
    
                        <Info
                          icon={
                            <MapPin className="h-4 w-4" />
                          }
                          title="Room"
                          value={
                            registration.session.room ??
                            "TBD"
                          }
                        />
    
                        <Info
                          icon={
                            <User className="h-4 w-4" />
                          }
                          title="Teacher"
                          value={
                            registration.session.teacher
                              ? `${registration.session.teacher.firstName} ${registration.session.teacher.lastName}`
                              : "Unassigned"
                          }
                        />
    
                        <Info
                          icon={
                            <CalendarDays className="h-4 w-4" />
                          }
                          title="Date"
                          value={registration.session.startTime.toLocaleDateString()}
                        />
    
                      </div>
    
                    </div>
    
                  )
                )}
    
              </div>
    
            )}
    
          </div>
    
          {/* Attendance */}
    
          <div className="mt-8 rounded-3xl border bg-white shadow-sm">
    
            <div className="border-b px-6 py-5">
    
              <h2 className="text-2xl font-semibold">
                Attendance History
              </h2>
    
            </div>
    
            {child.attendance.length === 0 ? (
    
              <div className="p-12 text-center">
    
                <h3 className="text-2xl font-semibold">
                  No Attendance Records
                </h3>
    
                <p className="mt-3 text-gray-500">
                  Attendance records will appear after your child begins attending classes.
                </p>
    
              </div>
    
            ) : (
    
              <div className="space-y-5 p-6">
    
                {child.attendance.map((record) => (
    
                  <div
                    key={record.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
    
                    <div className="flex items-start justify-between">
    
                      <div>
    
                        <h3 className="text-xl font-semibold">
                          {record.session.course.title}
                        </h3>
    
                        <p className="mt-2 text-gray-600">
                          {record.session.startTime.toLocaleString()}
                        </p>
    
                      </div>
    
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                          record.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : record.status === "LATE"
                            ? "bg-yellow-100 text-yellow-700"
                            : record.status === "EXCUSED_ABSENT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status.replaceAll("_", " ")}
                      </span>
    
                    </div>
    
                    <div className="mt-6 grid gap-5 md:grid-cols-2">
    
                      <Info
                        icon={
                          <CalendarDays className="h-4 w-4" />
                        }
                        title="Check In"
                        value={
                          record.checkInTime
                            ? record.checkInTime.toLocaleString()
                            : "Not Checked In"
                        }
                      />
    
                      <Info
                        icon={
                          <CalendarDays className="h-4 w-4" />
                        }
                        title="Check Out"
                        value={
                          record.checkOutTime
                            ? record.checkOutTime.toLocaleString()
                            : "Not Checked Out"
                        }
                      />
    
                    </div>
    
                  </div>
    
                ))}
    
              </div>
    
            )}
    
          </div>
    
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
    
          <p className="mt-2 font-medium break-words">
            {value}
          </p>
    
        </div>
      );
    }
