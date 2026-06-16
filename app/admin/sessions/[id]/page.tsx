import { prisma } from "@/lib/prisma";
import AttendanceButtons from "@/components/attendance-buttons";
import AttendanceNotes from "@/components/attendance-notes";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

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
    where: { id },

    include: {
      course: {
        include: {
          teachers: true,
        },
      },

      registrations: {
        include: {
          student: {
            include: {
              studentUser: true,
            },
          },
        },
      },

      attendance: true,
    },
  });
    

  if (!session) {
    notFound();
  }
  if (authSession.user.role === "TEACHER") {
    const assigned =
      session.course.teachers.some(
        (t) =>
          t.teacherId ===
          authSession.user.id
      );
  
    if (!assigned) {
      redirect("/dashboard/teacher");
    }
  }
  
  const attendanceMap = new Map(
    session.attendance.map((a) => [
      a.studentId,
      a,
    ])
  );
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {session.course.title}
      </h1>

      <p className="mt-2">
        {session.startTime.toLocaleString()}
      </p>

      <div className="mt-6 space-y-4">
      {session.registrations.map((reg) => {
  const attendance =
    attendanceMap.get(reg.student.id);

  return (
    <div
      key={reg.id}
      className="rounded border p-4"
    >
      <h2 className="font-semibold">
        {reg.student.studentUser.firstName}{" "}
        {reg.student.studentUser.lastName}
      </h2>

      <p className="mt-2">
        Current Status:{" "}
        <span className="font-bold">
          {attendance?.status ??
            "NOT MARKED"}
        </span>
      </p>

      <p>
        Check In:
        {" "}
        {attendance?.checkInTime
          ? attendance.checkInTime.toLocaleString()
          : "Not checked in"}
      </p>

      <p>
        Check Out:
        {" "}
        {attendance?.checkOutTime
          ? attendance.checkOutTime.toLocaleString()
          : "Not checked out"}
      </p>
      
      <AttendanceNotes
        studentId={reg.student.id}
        sessionId={session.id}
        arrival={attendance?.arrivalNote}
        departure={attendance?.departureNote}
      />

      <AttendanceButtons
        studentId={reg.student.id}
        sessionId={session.id}
      />
    </div>
  );
})}
      </div>
    </div>
  );
}