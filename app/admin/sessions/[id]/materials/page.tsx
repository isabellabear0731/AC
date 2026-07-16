import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Link from "next/link";
import DeleteResourceButton from "./delete-resource-button";

import UploadForm from "./upload-form";

export const dynamic = "force-dynamic";

export default async function MaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "TEACHER"
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const courseSession =
    await prisma.courseSession.findUnique({
      where: {
        id,
      },

      include: {
        course: true,

        teacher: true,

        teachingResources: {
          include: {
            uploadedBy: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!courseSession) {
    notFound();
  }

  if (
    session.user.role === "TEACHER" &&
    courseSession.teacherId !== session.user.id
  ) {
    redirect("/dashboard/teacher");
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
            Teaching Resources
          </h1>

          <p className="mt-2 text-gray-600">
            {courseSession.course.title}
          </p>

          <p className="text-gray-500">
            {courseSession.startTime.toLocaleString()}
          </p>

        </div>

        <Link
          href={`/admin/sessions/${id}`}
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Back to Session
        </Link>

      </div>

      <UploadForm
        sessionId={id}
      />

      <div className="mt-10 rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-2xl font-semibold">
            Uploaded Resources
          </h2>

        </div>

        {courseSession.teachingResources.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            No resources uploaded yet.
          </div>

        ) : (

          <div className="divide-y">

            {courseSession.teachingResources.map(
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

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

                      <span>
                        Type:
                        {" "}
                        {resource.resourceType}
                      </span>

                      <span>
                        Uploaded by:
                        {" "}
                        {resource.uploadedBy.firstName}
                        {" "}
                        {resource.uploadedBy.lastName}
                      </span>

                      <span>
                        {resource.createdAt.toLocaleDateString()}
                      </span>

                    </div>

                    <div className="mt-2 flex gap-3 text-sm">

                      {resource.visibleToStudent && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                          Student
                        </span>
                      )}

                      {resource.visibleToParent && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                          Parent
                        </span>
                      )}

                    </div>

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

                    <DeleteResourceButton
                      id={resource.id}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>
    </div>
  );
}