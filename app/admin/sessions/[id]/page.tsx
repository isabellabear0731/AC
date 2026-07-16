import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import AttendanceButtons from "@/components/attendance-buttons";
import AttendanceNotes from "@/components/attendance-notes";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authSession =
    await getServerSession(authOptions);

  if (!authSession) {
    redirect("/login");
  }

  if (
    authSession.user.role !== "ADMIN" &&
    authSession.user.role !== "TEACHER"
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const session =
    await prisma.courseSession.findUnique({
      where: {
        id,
      },

      include: {
        course: {
          include: {
            category: true,
          },
        },

        teacher: true,

        registrations: {
          include: {
            student: {
              include: {
                studentUser: true,
              },
            },
          },

          orderBy: {
            createdAt: "asc",
          },
        },

        attendance: true,

        teachingResources: true,
      },
    });

  if (!session) {
    notFound();
  }

  if (
    authSession.user.role === "TEACHER" &&
    session.teacherId !== authSession.user.id
  ) {
    redirect("/dashboard/teacher");
  }

  const attendanceMap = new Map(
    session.attendance.map((attendance) => [
      attendance.studentId,
      attendance,
    ])
  );

  const presentCount =
    session.attendance.filter(
      (a) => a.status === "PRESENT"
    ).length;

  const lateCount =
    session.attendance.filter(
      (a) => a.status === "LATE"
    ).length;

  const excusedCount =
    session.attendance.filter(
      (a) =>
        a.status ===
        "EXCUSED_ABSENT"
    ).length;

  const unexcusedCount =
    session.attendance.filter(
      (a) =>
        a.status ===
        "UNEXCUSED_ABSENT"
    ).length;

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

          <h1 className="text-4xl font-bold text-gray-800">
            {session.title ||
              session.course.title}
          </h1>

          <p className="mt-2 text-gray-500">
            Session Management
          </p>

        </div>

        <Link
          href={`/admin/courses/${session.courseId}`}
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Back to Course
        </Link>

      </div>

      {/* Session Information */}

      <div className="rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="mb-6 text-2xl font-semibold">
          Session Information
        </h2>

        <div className="grid gap-6 md:grid-cols-3">

          <div>

            <p className="text-sm text-gray-500">
              Course
            </p>

            <p className="mt-1 font-semibold">
              {session.course.title}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Category
            </p>

            <p className="mt-1 font-semibold">
              {session.course.category?.name ??
                "Uncategorized"}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Teacher
            </p>

            <p className="mt-1 font-semibold">
              {session.teacher
                ? `${session.teacher.firstName} ${session.teacher.lastName}`
                : "Unassigned"}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Weekday
            </p>

            <p className="mt-1 font-semibold">
              {session.weekday ?? "N/A"}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Start Time
            </p>

            <p className="mt-1 font-semibold">
              {session.startTime.toLocaleString()}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              End Time
            </p>

            <p className="mt-1 font-semibold">
              {session.endTime.toLocaleString()}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Room
            </p>

            <p className="mt-1 font-semibold">
              {session.room ?? "N/A"}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Capacity
            </p>

            <p className="mt-1 font-semibold">
              {session.capacityOverride ??
                session.course.capacity ??
                "Unlimited"}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Status
            </p>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                session.isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {session.isCancelled
                ? "Cancelled"
                : "Active"}
            </span>

          </div>

        </div>

      </div>

      {/* Student Attendance */}

      <div className="mt-8 space-y-6">

        <h2 className="text-2xl font-semibold">
          Student Attendance
        </h2>
        {session.registrations.length === 0 ? (

          <div className="rounded-3xl border bg-white p-10 text-center text-gray-500 shadow-sm">
            No students are registered for this session.
          </div>

          ) : (

          session.registrations.map((registration) => {

            const attendance =
              attendanceMap.get(
                registration.student.id
              );

            const badgeClass =
              attendance?.status === "PRESENT"
                ? "bg-green-100 text-green-700"
                : attendance?.status === "LATE"
                ? "bg-yellow-100 text-yellow-700"
                : attendance?.status ===
                  "EXCUSED_ABSENT"
                ? "bg-blue-100 text-blue-700"
                : attendance?.status ===
                  "UNEXCUSED_ABSENT"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700";

            return (

              <div
                key={registration.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h3 className="text-xl font-semibold">
                      {registration.student.studentUser.firstName}{" "}
                      {registration.student.studentUser.lastName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Student ID: {registration.student.id}
                    </p>

                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${badgeClass}`}
                  >
                    {attendance?.status ??
                      "PENDING"}
                  </span>

                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">

                  <div>

                    <p className="text-sm text-gray-500">
                      Check In
                    </p>

                    <p className="mt-1 font-medium">
                      {attendance?.checkInTime
                        ? attendance.checkInTime.toLocaleString()
                        : "Not Checked In"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Check Out
                    </p>

                    <p className="mt-1 font-medium">
                      {attendance?.checkOutTime
                        ? attendance.checkOutTime.toLocaleString()
                        : "Not Checked Out"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Absence Reason
                    </p>

                    <p className="mt-1 font-medium">
                      {attendance?.reason ??
                        "—"}
                    </p>

                  </div>

                </div>

                <div className="mt-6">

                  <AttendanceNotes
                    studentId={
                      registration.student.id
                    }
                    sessionId={session.id}
                    arrival={
                      attendance?.arrivalNote
                    }
                    departure={
                      attendance?.departureNote
                    }
                  />

                </div>

                <div className="mt-6">

                  <AttendanceButtons
                    studentId={
                      registration.student.id
                    }
                    sessionId={session.id}
                  />

                </div>

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    href={`/admin/users/${registration.student.studentUser.id}`}
                    className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                  >
                    Student Profile
                  </Link>

                  <Link
                    href={`/students/${registration.student.id}/files`}
                    className="rounded-xl border px-4 py-2 hover:bg-gray-50"
                  >
                    Student Files
                  </Link>

                </div>

              </div>

            );

          })

          )}

          </div>

          {/* Attendance Summary */}

          <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
          Attendance Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-5">

          <div className="rounded-xl border p-4">

            <p className="text-sm text-gray-500">
              Registered
            </p>

            <p className="mt-1 text-3xl font-bold">
              {session.registrations.length}
            </p>

          </div>

          <div className="rounded-xl border p-4">

            <p className="text-sm text-gray-500">
              Present
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {presentCount}
            </p>

          </div>

          <div className="rounded-xl border p-4">

            <p className="text-sm text-gray-500">
              Late
            </p>

            <p className="mt-1 text-3xl font-bold text-yellow-600">
              {lateCount}
            </p>

          </div>
          <div className="rounded-xl border p-4">

<p className="text-sm text-gray-500">
  Excused
</p>

<p className="mt-1 text-3xl font-bold text-blue-600">
  {excusedCount}
</p>

</div>

<div className="rounded-xl border p-4">

<p className="text-sm text-gray-500">
  Unexcused
</p>

<p className="mt-1 text-3xl font-bold text-red-600">
  {unexcusedCount}
</p>

</div>

</div>

</div>

{/* Teaching Materials */}

<div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">

<div className="flex items-center justify-between">

<div>

<h2 className="text-xl font-semibold">
  Teaching Materials
</h2>

<p className="mt-2 text-gray-500">
  Upload lesson materials, class photos and evaluations for this session.
</p>

</div>

<Link
href={`/admin/sessions/${session.id}/materials`}
className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white transition hover:opacity-90"
>
Manage Materials
</Link>

</div>

<div className="mt-6 grid gap-4 md:grid-cols-3">

<div className="rounded-xl border p-4">

<p className="text-sm text-gray-500">
  Total Resources
</p>

<p className="mt-2 text-3xl font-bold">
  {session.teachingResources.length}
</p>

</div>

<div className="rounded-xl border p-4">

<p className="text-sm text-gray-500">
  Course
</p>

<p className="mt-2 font-semibold">
  {session.course.title}
</p>

</div>

<div className="rounded-xl border p-4">

<p className="text-sm text-gray-500">
  Assigned Teacher
</p>

<p className="mt-2 font-semibold">
  {session.teacher
    ? `${session.teacher.firstName} ${session.teacher.lastName}`
    : "Unassigned"}
</p>

</div>

</div>

</div>

{/* Navigation */}

<div className="mt-10 flex flex-wrap justify-between gap-4">

<Link
href={`/admin/courses/${session.courseId}`}
className="rounded-xl border bg-white px-5 py-3 hover:bg-gray-50"
>
← Back to Course
</Link>

<Link
href="/dashboard/admin"
className="rounded-xl bg-[#7AAACD] px-5 py-3 text-white transition hover:opacity-90"
>
Admin Dashboard
</Link>

</div>

</div>
);
}
