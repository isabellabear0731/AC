import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import NotificationBell from "@/components/notification-bell";

export default async function TeacherDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  const teacher =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },

      include: {
        teachingCourses: {
          include: {
            course: {
              include: {
                sessions: {
                  orderBy: {
                    startTime: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Teacher Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Welcome, {session.user.name}
          </p>
        </div>

        <NotificationBell />
        <LogoutButton />

      </div>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/messages"
          className="rounded-xl border p-4 hover:bg-gray-50 transition"
        >
          <h2 className="font-semibold">
            Messages
          </h2>

          <p className="text-gray-500">
            View your inbox
          </p>
        </Link>
      </div>
      <div className="mt-6 space-y-6">
        {teacher?.teachingCourses.map(
          (tc) => (
            <div
              key={tc.id}
              className="rounded border p-4"
            >
              <h2 className="text-xl font-semibold">
                {tc.course.title}
              </h2>

              <p className="text-gray-500">
                {
                  tc.course.sessions
                    .length
                }{" "}
                sessions
              </p>

              <div className="mt-4 space-y-2">
                {tc.course.sessions.map(
                  (s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <div>
                        <p>
                          {s.startTime.toLocaleString()}
                        </p>

                        <p className="text-sm text-gray-500">
                          Room:{" "}
                          {s.room ??
                            "N/A"}
                        </p>
                      </div>

                      <Link
                        href={`/admin/sessions/${s.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        Take Attendance
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
        
      </div>
    </div>
    
  );
  
}