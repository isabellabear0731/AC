import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentMaterialsPage() {
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

      include: {
        registrations: {
          include: {
            session: {
              include: {
                course: true,

                teachingResources: {
                  where: {
                    visibleToStudent: true,
                    resourceType: "MATERIAL",
                  },

                  orderBy: {
                    createdAt: "desc",
                  },

                  include: {
                    uploadedBy: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!student) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            Learning Materials
          </h1>

          <p className="mt-2 text-gray-500">
            Materials shared by your teachers.
          </p>

        </div>

        <Link
          href="/dashboard/students"
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Dashboard
        </Link>

      </div>

      <div className="space-y-8">

        {student.registrations.map((registration) => (

          <div
            key={registration.id}
            className="rounded-3xl border bg-white shadow-sm"
          >

            <div className="border-b px-6 py-5">

              <h2 className="text-2xl font-semibold">
                {registration.session.course.title}
              </h2>

              <p className="mt-1 text-gray-500">
                {registration.session.startTime.toLocaleString()}
              </p>

            </div>

            {registration.session.teachingResources.length === 0 ? (

              <div className="p-6 text-gray-500">
                No learning materials available.
              </div>

            ) : (

              <div className="divide-y">

                {registration.session.teachingResources.map(
                  (resource) => (

                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-6"
                    >

                      <div>

                        <h3 className="text-lg font-semibold">
                          {resource.title}
                        </h3>

                        {resource.description && (

                          <p className="mt-2 text-gray-600">
                            {resource.description}
                          </p>

                        )}

                        <p className="mt-3 text-sm text-gray-500">
                          Uploaded by{" "}
                          {resource.uploadedBy.firstName}{" "}
                          {resource.uploadedBy.lastName}
                        </p>

                      </div>

                      <div className="flex gap-3">

                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          className="rounded-xl bg-[#7AAACD] px-4 py-2 text-white"
                        >
                          Open
                        </a>

                        <a
                          href={resource.fileUrl}
                          download
                          className="rounded-xl border px-4 py-2"
                        >
                          Download
                        </a>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}