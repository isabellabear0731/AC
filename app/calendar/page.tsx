import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";
import {
  CalendarDays,
  GraduationCap,
  MapPin,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const authSession =
    await getServerSession(authOptions);

  const isTeacher =
    authSession?.user.role === "TEACHER";

  const isAdmin =
    authSession?.user.role === "ADMIN";

  const sessions =
    await prisma.courseSession.findMany({
      where: isTeacher
        ? {
            teacherId:
              authSession!.user.id,
          }
        : undefined,
  
      include: {
        course: true,
        teacher: true,
      },
  
      orderBy: {
        startTime: "asc",
      },
    });
  
  const upcomingSessions =
    sessions.filter(
      (session) =>
        !session.isCancelled &&
        session.startTime >= new Date()
    );

  const events =
    upcomingSessions.map((session) => ({
      title:
        `${session.course.title} (${session.room ?? "No Room"})` +
        (authSession?.user.role ===
        "TEACHER"
          ? ""
          : ` — ${
              session.teacher
                ? `${session.teacher.firstName} ${session.teacher.lastName}`
                : "Unassigned"
            }`),

      start: session.startTime,
      end: session.endTime,
    }));

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
          {isTeacher
            ? "Teaching Calendar"
            : "Center Calendar"}
        </h1>

        <p className="mt-2 text-gray-500">
          {isTeacher
            ? "View your upcoming teaching schedule."
            : "View all upcoming classes and sessions."}
        </p>

        </div>

        <Link
          href={
            isTeacher
              ? "/dashboard/teacher"
              : "/dashboard/admin"
          }
          className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
        >
          ← Dashboard
        </Link>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Upcoming Classes"
          value={String(
            upcomingSessions.length
          )}
          icon={
            <GraduationCap className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Today's Classes"
          value={String(
            upcomingSessions.filter((s) => {
              const today =
                new Date();

              return (
                s.startTime.toDateString() ===
                today.toDateString()
              );
            }).length
          )}
          icon={
            <CalendarDays className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Rooms"
          value={String(
            new Set(
              upcomingSessions.map(
                (s) => s.room
              )
            ).size
          )}
          icon={
            <MapPin className="h-5 w-5 text-[#7AAACD]" />
          }
        />

      </div>

      {/* Calendar */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-2xl font-semibold">
            Calendar
          </h2>

          <p className="mt-1 text-gray-500">
            {isTeacher
              ? "All upcoming teaching sessions."
              : "All upcoming center sessions."}
          </p>

        </div>

        <div className="p-6">

          <CalendarView events={events} />

        </div>

      </div>

      {/* Upcoming Sessions */}

      <div className="mt-8 rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-2xl font-semibold">
            Upcoming Classes
          </h2>

        </div>

        {upcomingSessions.length === 0 ? (

          <div className="p-12 text-center">

            <h3 className="text-2xl font-semibold">
              No Upcoming Classes
            </h3>

            <p className="mt-3 text-gray-500">
              Future teaching sessions will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-5 p-6">

            {upcomingSessions.map(
              (session) => (

                <div
                  key={session.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <h3 className="text-xl font-semibold">
                        {session.course.title}
                      </h3>

                      <p className="mt-2 text-gray-600">
                        {session.startTime.toLocaleString()}
                      </p>

                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        session.isCancelled
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {session.isCancelled
                        ? "Cancelled"
                        : "Scheduled"}
                    </span>

                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <Info
                      icon={
                        <MapPin className="h-4 w-4" />
                      }
                      title="Room"
                      value={
                        session.room ??
                        "TBD"
                      }
                    />

                    {isAdmin && (

                    <Info
                      icon={
                        <User className="h-4 w-4" />
                      }
                      title="Teacher"
                      value={
                        session.teacher
                          ? `${session.teacher.firstName} ${session.teacher.lastName}`
                          : "Unassigned"
                      }
                    />

                    )}

                  </div>

                </div>
              )
            )}

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

      <p className="mt-2 font-medium">
        {value}
      </p>

    </div>
  );
}