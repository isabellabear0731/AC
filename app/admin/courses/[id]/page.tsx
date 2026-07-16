import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [course, teachers, students] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        sessions: {
          include: {
            teacher: true,
            registrations: {
              include: {
                student: {
                  include: {
                    studentUser: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.user.findMany({
      where: {
        role: "TEACHER",
        isActive: true,
      },
      orderBy: {
        firstName: "asc",
      },
    }),
    prisma.studentProfile.findMany({
      include: {
        studentUser: true,
      },
    }),
  ]);

  if (!course) {
    notFound();
  }

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
            {course.title}
          </h1>
  
          <p className="mt-2 text-gray-500">
            Manage course information,
            sessions and registrations.
          </p>
        </div>
  
        <Link
          href="/admin/courses"
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Courses
        </Link>
  
      </div>
  
      {/* Course Information */}
  
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
  
        <h2 className="mb-6 text-2xl font-semibold">
          Course Information
        </h2>
  
        <div className="grid gap-6 md:grid-cols-2">
  
          <div>
  
            <p className="text-sm text-gray-500">
              Category
            </p>
  
            <p className="mt-1 text-lg font-medium">
              {course.category?.name ??
                "Uncategorized"}
            </p>
  
          </div>
  
          <div>
  
            <p className="text-sm text-gray-500">
              Price
            </p>
  
            <p className="mt-1 text-lg font-medium">
              ${course.price}
            </p>
  
          </div>
  
          <div>
  
            <p className="text-sm text-gray-500">
              Location
            </p>
  
            <p className="mt-1 text-lg font-medium">
              {course.location ??
                "Not Assigned"}
            </p>
  
          </div>
  
          <div>
  
            <p className="text-sm text-gray-500">
              Capacity
            </p>
  
            <p className="mt-1 text-lg font-medium">
              {course.capacity ??
                "Unlimited"}
            </p>
  
          </div>
  
        </div>
  
      </div>
  
      {/* Add Session */}
  
      <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
  
        <h2 className="mb-6 text-2xl font-semibold">
          Add New Session
        </h2>
  
        <form
          action={`/api/courses/${id}/sessions`}
          method="POST"
          className="space-y-6"
        >
  
          <div className="grid gap-6 md:grid-cols-2">
  
            <div>
  
              <label className="font-medium">
                Session Title
              </label>
  
              <input
                name="title"
                placeholder="Week 1"
                className="mt-2 w-full rounded-xl border p-3"
              />
  
            </div>
  
            <div>
  
              <label className="font-medium">
                Teacher
              </label>
  
              <select
                name="teacherId"
                className="mt-2 w-full rounded-xl border p-3"
                defaultValue=""
              >
  
                <option value="">
                  Unassigned
                </option>
  
                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.firstName}{" "}
                    {teacher.lastName}
                  </option>
                ))}
  
              </select>
  
            </div>
  
          </div>
  
          <div className="grid gap-6 md:grid-cols-3">
  
            <div>
  
              <label className="font-medium">
                Weekday
              </label>
  
              <select
                name="weekday"
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="MONDAY">
                  Monday
                </option>
  
                <option value="TUESDAY">
                  Tuesday
                </option>
  
                <option value="WEDNESDAY">
                  Wednesday
                </option>
  
                <option value="THURSDAY">
                  Thursday
                </option>
  
                <option value="FRIDAY">
                  Friday
                </option>
  
                <option value="SATURDAY">
                  Saturday
                </option>
  
                <option value="SUNDAY">
                  Sunday
                </option>
  
              </select>
  
            </div>
  
            <div>
  
              <label className="font-medium">
                Start Time
              </label>
  
              <input
                type="datetime-local"
                name="startTime"
                className="mt-2 w-full rounded-xl border p-3"
                required
              />
  
            </div>
  
            <div>
  
              <label className="font-medium">
                End Time
              </label>
  
              <input
                type="datetime-local"
                name="endTime"
                className="mt-2 w-full rounded-xl border p-3"
                required
              />
  
            </div>
  
          </div>
  
          <div className="grid gap-6 md:grid-cols-3">
  
            <div>
  
              <label className="font-medium">
                Room
              </label>
  
              <input
                name="room"
                className="mt-2 w-full rounded-xl border p-3"
              />
  
            </div>
  
            <div>
  
              <label className="font-medium">
                Capacity Override
              </label>
  
              <input
                type="number"
                min={1}
                name="capacityOverride"
                className="mt-2 w-full rounded-xl border p-3"
              />
  
            </div>
  
            <div>
  
              <label className="font-medium">
                Display Order
              </label>
  
              <input
                type="number"
                name="displayOrder"
                defaultValue={0}
                className="mt-2 w-full rounded-xl border p-3"
              />
  
            </div>
  
          </div>
  
          <button
            className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white hover:opacity-90"
            type="submit"
          >
            Add Session
          </button>
  
        </form>
  
      </div>
  
      {/* Upcoming Sessions */}

      <div className="mt-8">

      <h2 className="mb-6 text-2xl font-semibold">
        Upcoming Sessions
      </h2>

      {course.sessions.filter(
        (session) =>
          !session.isCancelled &&
          session.startTime >= new Date()
      ).length === 0 ? (

        <div className="rounded-3xl border bg-white p-10 text-center text-gray-500 shadow-sm">
          No upcoming sessions.
        </div>

      ) : (

        <div className="space-y-6">

          {course.sessions
            .filter(
              (session) =>
                !session.isCancelled &&
                session.startTime >= new Date()
            )
            .sort(
              (a, b) =>
                a.startTime.getTime() -
                b.startTime.getTime()
            )
            .map((session) => (

              <div
                key={session.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h3 className="text-2xl font-semibold">

                      {session.title ||
                        "Course Session"}

                    </h3>
                    <div className="mt-2 flex gap-2">
                      {session.isCancelled ? (

                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                          Cancelled
                        </span>

                      ) : (

                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          Upcoming
                        </span>

                      )}

                      </div>
                    

                    <p className="mt-2 text-gray-500">

                      {session.weekday || "No weekday"}

                      {" • "}

                      {session.startTime.toLocaleString()}

                    </p>

                  </div>

                  <Link
                    href={`/admin/sessions/${session.id}`}
                    className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white hover:opacity-90"
                  >
                    Manage Session
                  </Link>

                  <form
                    action={`/api/sessions/${session.id}`}
                    method="POST"
                    className="mt-3"
                  >

                    <input
                      type="hidden"
                      name="_method"
                      value="DELETE"
                    />

                    <button
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Cancel Session
                    </button>

                  </form>

                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Teacher
                    </p>

                    <p className="mt-1 font-medium">

                      {session.teacher
                        ? `${session.teacher.firstName} ${session.teacher.lastName}`
                        : "Unassigned"}

                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Room
                    </p>

                    <p className="mt-1 font-medium">
                      {session.room ?? "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Capacity
                    </p>

                    <p className="mt-1 font-medium">

                      {session.capacityOverride ??
                        course.capacity ??
                        "Unlimited"}

                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                    Students Registered
                    </p>

                    <p className="mt-1 font-medium">

                      {session.registrations.length}

                    </p>

                  </div>

                </div>

                <hr className="my-6" />

                <form
                  action={`/api/sessions/${session.id}/teacher`}
                  method="POST"
                  className="flex flex-wrap items-center gap-3"
                >

                  <select
                    name="teacherId"
                    defaultValue={
                      session.teacherId ?? ""
                    }
                    className="rounded-xl border p-3"
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {teachers.map((teacher) => (

                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.firstName}{" "}
                        {teacher.lastName}
                      </option>

                    ))}

                  </select>

                  <button
                    className="rounded-xl bg-[#7AAACD] px-5 py-3 text-white"
                  >
                    Save Teacher
                  </button>

                </form>

                <div className="mt-6">

                  <form
                    action={`/api/sessions/${session.id}/register`}
                    method="POST"
                    className="flex flex-wrap gap-3"
                  >

                    <select
                      name="studentId"
                      className="min-w-[280px] rounded-xl border p-3"
                    >

                      {students.map((student) => (

                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.studentUser.firstName}{" "}
                          {student.studentUser.lastName}
                        </option>

                      ))}

                    </select>

                    <button
                      className="rounded-xl bg-green-600 px-5 py-3 text-white"
                    >
                      Register Student
                    </button>

                  </form>

                </div>

                {session.registrations.length > 0 && (

                  <div className="mt-6">

                    <h4 className="mb-3 font-semibold">
                      Registered Students
                    </h4>

                    <div className="grid gap-2">

                      {session.registrations.map(
                        (registration) => (

                          <div
                            key={registration.id}
                            className="rounded-xl bg-gray-50 px-4 py-3"
                          >

                            {registration.student.studentUser.firstName}{" "}
                            {registration.student.studentUser.lastName}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            ))}

        </div>

      )}

      </div>
    
    {/* Past Sessions */}
    <div className="mt-10">

    <h2 className="mb-6 text-2xl font-semibold">
      Past Sessions
    </h2>

    {course.sessions.filter(
      (session) =>
        session.startTime < new Date()
    ).length === 0 ? (

      <div className="rounded-3xl border bg-white p-8 text-center text-gray-500 shadow-sm">
        No completed sessions.
      </div>

    ) : (

      <div className="space-y-4">

        {course.sessions
          .filter(
            (session) =>
              session.startTime < new Date()
          )
          .sort(
            (a, b) =>
              b.startTime.getTime() -
              a.startTime.getTime()
          )
          .map((session) => (

            <div
              key={session.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold text-lg">
                    {session.title ||
                      "Course Session"}
                  </h3>

                  <div className="mt-2 flex gap-2">
                    {session.isCancelled ? (

                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                        Cancelled
                      </span>

                    ) : (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        Upcoming
                      </span>

                    )}

                  </div>

                  <p className="text-gray-500 mt-1">
                    {session.startTime.toLocaleString()}
                  </p>

                </div>

                <Link
                  href={`/admin/sessions/${session.id}`}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  View Attendance
                </Link>

              </div>

            </div>

          ))}

      </div>

    )}

    </div>
    </div>
  );
}
