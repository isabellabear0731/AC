import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserForm from "@/components/admin/user-form";
import Link from "next/link";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      children: {
        include: {
          studentUser: true,
        },
      },

      studentProfile: {
        include: {
          parent: true,
          attendance: true,
          comments: true,
        },
      },

      teachingSessions: {
        include: {
          course: true,
        },

        orderBy: {
          startTime: "asc",
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="p-8">
        User not found.
      </div>
    );
  }

  const studentParent =
    user.studentProfile?.parent;

  const guardianName =
    studentParent
      ? `${studentParent.firstName} ${studentParent.lastName}`
      : "Adult Student";

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
            Edit User
          </h1>

          <p className="mt-2 text-gray-500">
            Manage account information and permissions.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Back to Users
        </Link>

      </div>

      {/* Account Information */}

      <div
        className="rounded-3xl border bg-white p-8 shadow-sm"
        style={{
          borderColor: "#D0CCCD",
        }}
      >
        <h2 className="mb-6 text-2xl font-semibold">
          Account Information
        </h2>

        <UserForm
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
          }}
        />
      </div>

      {/* Parent */}

      {user.role === "PARENT" && (
        <div
          className="mt-8 rounded-3xl border bg-white p-8 shadow-sm"
          style={{
            borderColor: "#D0CCCD",
          }}
        >
          <h2 className="mb-5 text-2xl font-semibold">
            Linked Children
          </h2>

          {user.children.length === 0 ? (
            <p className="text-gray-500">
              No children linked.
            </p>
          ) : (
            <div className="space-y-3">
              {user.children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-xl border p-4"
                >
                  <p className="font-semibold">
                    {child.studentUser.firstName}{" "}
                    {child.studentUser.lastName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student */}

      {user.role === "STUDENT" &&
        user.studentProfile && (
          <div
            className="mt-8 rounded-3xl border bg-white p-8 shadow-sm"
            style={{
              borderColor: "#D0CCCD",
            }}
          >
            <h2 className="mb-5 text-2xl font-semibold">
              Student Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-xl border p-4">
                <p className="text-gray-500">
                  Parent
                </p>

                <p className="mt-1 font-semibold">
                  {guardianName}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-gray-500">
                  Attendance Records
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {user.studentProfile.attendance.length}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-gray-500">
                  Teacher Comments
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {user.studentProfile.comments.length}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-gray-500">
                  Notes
                </p>

                <p className="mt-1">
                  {user.studentProfile.notes ||
                    "No notes"}
                </p>
              </div>

            </div>
          </div>
      )}

      {/* Teacher */}

      {user.role === "TEACHER" && (
        <div
          className="mt-8 rounded-3xl border bg-white p-8 shadow-sm"
          style={{
            borderColor: "#D0CCCD",
          }}
        >
          <h2 className="mb-5 text-2xl font-semibold">
            Assigned Sessions
          </h2>

          {user.teachingSessions.length === 0 ? (
            <p className="text-gray-500">
              No sessions assigned.
            </p>
          ) : (
            <div className="space-y-3">

              {user.teachingSessions.map(
                (session) => (
                  <div
                    key={session.id}
                    className="rounded-xl border p-4"
                  >
                    <p className="font-semibold">
                      {session.course.title}
                    </p>

                    <p className="mt-1 text-gray-500">
                      {session.startTime.toLocaleString()}
                    </p>
                  </div>
                )
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
