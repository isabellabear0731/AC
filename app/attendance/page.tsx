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
      <div className="gps-page">
        <div className="gps-surface mx-auto max-w-xl p-8 text-center text-gray-500">
          Student profile not found.
        </div>
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
    <div className="gps-page">
      <div className="gps-content max-w-5xl">
      <div className="gps-surface mb-8 p-6 sm:p-8">
        <p className="gps-kicker">Learning portal</p>
        <h1 className="gps-heading mt-2 text-3xl font-bold sm:text-4xl">My Attendance</h1>
        <p className="mt-2 text-gray-500">Review your class attendance history.</p>
      </div>

      {attendance.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500 shadow-sm">
          No attendance records found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {attendance.map((record) => (
            <div
              key={record.id}
              className="rounded-3xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#113b2b]">
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
    </div>
  );
}
