import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditUserForm from "./user-form";

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
    where: { id },
  
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
  
      teachingCourses: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Edit User
      </h1>

      <EditUserForm user={user} />
      {user.role === "PARENT" && (
        <div className="mt-8 rounded border p-4">
          <h2 className="text-xl font-bold mb-3">
            Children
          </h2>

          {user.children.length === 0 ? (
            <p>No children linked.</p>
          ) : (
            <ul className="list-disc ml-6">
              {user.children.map((child) => (
                <li key={child.id}>
                  {child.studentUser.firstName}{" "}
                  {child.studentUser.lastName}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {user.role === "STUDENT" &&
        user.studentProfile && (
          <div className="mt-8 rounded border p-4 space-y-2">
            <h2 className="text-xl font-bold">
              Student Information
            </h2>

            <p>
              Parent:
              {" "}
              {user.studentProfile.parent.firstName}
              {" "}
              {user.studentProfile.parent.lastName}
            </p>

            <p>
              Attendance Records:
              {" "}
              {user.studentProfile.attendance.length}
            </p>

            <p>
              Teacher Comments:
              {" "}
              {user.studentProfile.comments.length}
            </p>

            <p>
              Notes:
              {" "}
              {user.studentProfile.notes || "None"}
            </p>
          </div>
      )}

      {user.role === "TEACHER" && (
        <div className="mt-8 rounded border p-4">
          <h2 className="text-xl font-bold mb-3">
            Assigned Courses
          </h2>

          {user.teachingCourses.length === 0 ? (
            <p>No courses assigned.</p>
          ) : (
            <ul className="list-disc ml-6">
              {user.teachingCourses.map((tc) => (
                <li key={tc.id}>
                  {tc.course.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}