import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";


export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    include: {
      teachers: true,
      sessions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-bold">
          Course Management
        </h1>

        <Link
          href="/admin/courses/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          New Course
        </Link>
      </div>

      
  
      {courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded border p-4"
            >
              <h2 className="text-xl font-semibold">
                {course.title}
              </h2>

              <p>Category: {course.category}</p>

              <p>Price: ${course.price}</p>

              <p>
                Sessions: {course.sessions.length}
              </p>

              <p>
                Teachers: {course.teachers.length}
              </p>
              <Link
                href={`/admin/courses/${course.id}`}
                className="mt-2 inline-block rounded bg-blue-600 px-3 py-1 text-white"
                >
                Manage
                </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );


}
