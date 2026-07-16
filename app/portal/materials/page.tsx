import Link from "next/link";
import {
  BookOpen,
  Download,
  ExternalLink,
  GraduationCap,
  FileText,
  User,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getPortalContext } from "@/lib/portal";

import PortalHeader from "@/components/portal/PortalHeader";

export const dynamic = "force-dynamic";

export default async function PortalMaterialsPage() {
  const portal =
    await getPortalContext();

  let studentIds: string[] = [];

  if (portal.role === "PARENT") {
    studentIds =
      portal.children.map(
        (child) => child.id
      );
  } else if (portal.selectedStudent) {
    studentIds = [
      portal.selectedStudent.id,
    ];
  }

  const registrations =
    await prisma.registration.findMany({
      where: {
        studentId: {
          in: studentIds,
        },

        status: "APPROVED",
      },

      include: {
        student: {
          include: {
            studentUser: true,
          },
        },

        session: {
          include: {
            course: true,

            teacher: true,

            teachingResources: {
              where: {
                visibleToStudent: true,
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

      orderBy: {
        session: {
          startTime: "asc",
        },
      },
    });

  const totalResources =
    registrations.reduce(
      (sum, registration) =>
        sum +
        registration.session
          .teachingResources.length,
      0
    );

  const teacherCount =
    new Set(
      registrations
        .map(
          (registration) =>
            registration.session.teacher?.id
        )
        .filter(Boolean)
    ).size;

  return (
    <div>

      <PortalHeader
        title="Learning Materials"
        subtitle="Resources shared by your teachers."
      />

      <div className="mb-8 grid gap-5 md:grid-cols-3">

        <StatCard
          title="Courses"
          value={registrations.length}
          icon={
            <GraduationCap className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Resources"
          value={totalResources}
          icon={
            <BookOpen className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Teachers"
          value={teacherCount}
          icon={
            <User className="h-5 w-5 text-[#7AAACD]" />
          }
        />

      </div>

      {registrations.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

          <h2 className="text-2xl font-semibold">
            No Enrolled Courses
          </h2>

          <p className="mt-3 text-gray-500">
            Learning materials will appear once you're enrolled in a course.
          </p>

        </div>

      ) : (

        <div className="space-y-8">

          {registrations.map(
            (registration) => (

              <div
                key={registration.id}
                className="overflow-hidden rounded-3xl border bg-white shadow-sm"
              >

                <div className="border-b px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

                      <GraduationCap className="h-7 w-7 text-[#7AAACD]" />

                    </div>

                    <div>

                      <h2 className="text-2xl font-semibold">

                        {registration.session.course.title}

                      </h2>

                      {portal.role === "PARENT" && (

                        <p className="mt-1 text-gray-500">

                          Child:{" "}
                          {registration.student.studentUser.firstName}{" "}
                          {registration.student.studentUser.lastName}

                        </p>

                      )}

                      <p className="mt-2 text-gray-500">

                        {registration.session.startTime.toLocaleDateString()} •{" "}
                        {registration.session.startTime.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}

                      </p>

                    </div>

                  </div>

                </div>
                {registration.session.teachingResources.length === 0 ? (

<div className="p-10 text-center text-gray-500">
  No resources uploaded yet.
</div>

) : (

<div className="divide-y">

  {registration.session.teachingResources.map(
    (resource) => (

      <div
        key={resource.id}
        className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between"
      >

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-full bg-[#EBEBCF] px-3 py-1 text-xs font-semibold">

              <FileText className="h-4 w-4" />

              <span>
                {resource.resourceType}
              </span>

            </div>

            <h3 className="text-lg font-semibold">
              {resource.title}
            </h3>

          </div>

          {resource.description && (

            <p className="mt-3 text-gray-600">
              {resource.description}
            </p>

          )}

          <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-500">

            <span>
              Uploaded by{" "}
              {resource.uploadedBy.firstName}{" "}
              {resource.uploadedBy.lastName}
            </span>

            <span>
              {resource.createdAt.toLocaleDateString()}
            </span>

          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            href={resource.fileUrl}
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-[#7AAACD] px-4 py-2 text-white transition hover:opacity-90"
          >

            <ExternalLink className="h-4 w-4" />

            Open

          </Link>

          <Link
            href={resource.fileUrl}
            target="_blank"
            download
            className="flex items-center gap-2 rounded-xl border px-4 py-2 transition hover:bg-gray-50"
          >

            <Download className="h-4 w-4" />

            Download

          </Link>

        </div>

      </div>

    )
  )}

</div>

)}

</div>

)
)}

</div>

)}

</div>
);
}

function StatCard({
title,
value,
icon,
}: {
title: string;
value: number;
icon: React.ReactNode;
}) {
return (
<div className="rounded-3xl border bg-white p-6 shadow-sm">

<div className="flex items-center justify-between">

<div>

<p className="text-sm text-gray-500">
{title}
</p>

<p className="mt-2 text-3xl font-bold">
{value}
</p>

</div>

<div className="rounded-2xl bg-gray-50 p-3">

{icon}

</div>

</div>

</div>
);
}