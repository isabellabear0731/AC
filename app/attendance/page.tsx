import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AttendancePage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const student =
    await prisma.studentProfile.findUnique({
      where: {
        studentUserId: session.user.id,
      },
    });

  if (!student) {
    return (
      <div className="p-6">
        Student profile not found.
      </div>
    );
  }

  const attendance =
    await prisma.attendance.findMany({
      where: {
        studentId: student.id,
      },

      include: {
        session: {
          include: {
            course: true,
          },
        },
      },

      orderBy: {
        session: {
          startTime: "desc",
        },
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        My Attendance
      </h1>

      {attendance.length === 0 ? (
        <div className="mt-6 rounded border p-6 text-center text-gray-500">
          No attendance records found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {attendance.map((record) => (
            <div
              key={record.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold text-lg">
                {record.session.course.title}
              </h2>

              <p className="text-gray-500">
                {record.session.startTime.toLocaleString()}
              </p>

              <p className="mt-2">
                Status:{" "}
                <span className="font-medium">
                  {record.status}
                </span>
              </p>

              <p>
                Check In:{" "}
                {record.checkInTime
                  ? record.checkInTime.toLocaleString()
                  : "N/A"}
              </p>

              <p>
                Check Out:{" "}
                {record.checkOutTime
                  ? record.checkOutTime.toLocaleString()
                  : "N/A"}
              </p>

              {record.arrivalNote && (
                <p className="mt-2">
                  Arrival Note:{" "}
                  {record.arrivalNote}
                </p>
              )}

              {record.departureNote && (
                <p>
                  Departure Note:{" "}
                  {record.departureNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}