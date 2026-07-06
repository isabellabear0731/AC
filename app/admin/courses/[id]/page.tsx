import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {course.title}
      </h1>

      <p className="mt-2">
        Category: {course.category?.name ?? "Uncategorized"}
      </p>

      <p>Price: ${course.price}</p>

      <p>Location: {course.location}</p>

      <div className="mt-6 rounded border p-4">
  <h2 className="text-xl font-semibold">
    Sessions
  </h2>

  <form
    action={`/api/courses/${id}/sessions`}
    method="POST"
    className="mt-4 space-y-3"
  >
    <div>
      <label>Start Time</label>

      <input
        type="datetime-local"
        name="startTime"
        className="w-full rounded border p-2"
        required
      />
    </div>

    <div>
      <label>End Time</label>

      <input
        type="datetime-local"
        name="endTime"
        className="w-full rounded border p-2"
        required
      />
    </div>

    <div>
      <label>Room</label>

      <input
        name="room"
        className="w-full rounded border p-2"
      />
    </div>

    <div>
      <label>Teacher</label>

      <select
        name="teacherId"
        className="w-full rounded border p-2"
        defaultValue=""
      >
        <option value="">Unassigned</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.firstName} {teacher.lastName}
          </option>
        ))}
      </select>
    </div>

    <button
      className="rounded bg-green-600 px-3 py-2 text-white"
      type="submit"
    >
      Add Session
    </button>
  </form>

  <div className="mt-6">
    {course.sessions.length === 0 ? (
      <p>No sessions yet.</p>
    ) : (
      <ul className="space-y-2">
        {course.sessions.map((session) => (
          <li
            key={session.id}
            className="rounded border p-3"
          >
            <div>
              Start:
              {" "}
              {session.startTime.toLocaleString()}
            </div>

            <div>
              End:
              {" "}
              {session.endTime.toLocaleString()}
            </div>

            <div>
              Room:
              {" "}
              {session.room ?? "N/A"}
            </div>

            <form
              action={`/api/sessions/${session.id}/teacher`}
              method="POST"
              className="mt-3 flex gap-2"
            >
              <select
                name="teacherId"
                className="rounded border p-2"
                defaultValue={session.teacherId ?? ""}
              >
                <option value="">Unassigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>

              <button
                className="rounded bg-blue-600 px-3 py-2 text-white"
                type="submit"
              >
                Assign Teacher
              </button>
            </form>

            <p className="mt-2 text-sm text-gray-500">
              Current teacher:{" "}
              {session.teacher
                ? `${session.teacher.firstName} ${session.teacher.lastName}`
                : "Unassigned"}
            </p>

            <form
              action={`/api/sessions/${session.id}/register`}
              method="POST"
              className="mt-3 flex gap-2"
            >
              <select
                name="studentId"
                className="rounded border p-2"
              >
                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.studentUser.firstName}
                    {" "}
                    {student.studentUser.lastName}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded bg-blue-600 px-3 py-2 text-white"
              >
                Register Student
              </button>
            </form>
            <Link
              href={`/admin/sessions/${session.id}`}
              className="mt-3 inline-block rounded bg-blue-600 px-3 py-1 text-white"
            >
              Take Attendance
            </Link>

            <ul className="mt-2 ml-6 list-disc">
              {session.registrations.map((r) => (
                <li key={r.id}>
                  {r.student.studentUser.firstName}
                  {" "}
                  {r.student.studentUser.lastName}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
    </div>
  );
}
