import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getPortalContext } from "@/lib/portal";
import {
  getRegistrationStatusClassName,
  getRegistrationStatusLabel,
} from "@/lib/registration-status";

export const dynamic = "force-dynamic";

export default async function PortalCoursesPage() {
  const portal =
    await getPortalContext();

  const studentIds =
    portal.role === "PARENT"
      ? portal.children.map((child) => child.id)
      : portal.selectedStudent
        ? [portal.selectedStudent.id]
        : [];

  const canRegister =
    portal.role === "PARENT" ||
    portal.role === "ADULT";

  const courses =
    await prisma.course.findMany({
      where: {
        isActive: true,
      },

      include: {
        category: true,

        sessions: {
          include: {
            registrations: {
              where: {
                OR: [
                  {
                    status: "APPROVED",
                  },
                  {
                    studentId: {
                      in: studentIds,
                    },
                  },
                ],
              },
            },

            teacher: true,
          },

          orderBy: {
            startTime: "asc",
          },
        },
      },

      orderBy: {
        title: "asc",
      },
    });

  return (
    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Course Catalog
        </h1>

        <p className="mt-2 text-gray-500">
          Browse all available courses.
        </p>

      </div>

      <div className="space-y-6">

        {courses.map((course) => (

          <div
            key={course.id}
            className="rounded-3xl border bg-white p-6 shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-semibold">
                  {course.title}
                </h2>

                <p className="mt-2 text-gray-600">
                  {course.description}
                </p>

              </div>

              {course.category && (

                <span
                  className="rounded-full px-4 py-2 text-sm font-medium text-white"
                  style={{
                    background:
                      course.category.color ??
                      "#7AAACD",
                  }}
                >
                  {course.category.name}
                </span>

              )}

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">

              <Info
                label="Price"
                value={`$${course.price}`}
              />

              <Info
                label="Location"
                value={
                  course.location ??
                  "TBD"
                }
              />

              <Info
                label="Capacity"
                value={
                  course.capacity
                    ? String(course.capacity)
                    : "Unlimited"
                }
              />

            </div>

            <div className="mt-8">

              <h3 className="mb-4 text-lg font-semibold">
                Sessions
              </h3>

              <div className="space-y-3">

                {course.sessions.length === 0 ? (

                  <div className="rounded-xl border p-4 text-gray-500">
                    No scheduled sessions.
                  </div>

                ) : (

                  course.sessions.map((sessionItem) => {

                    const userRegistrations =
                      sessionItem.registrations
                        .filter((registration) =>
                          studentIds.includes(
                            registration.studentId
                          )
                        )
                        .map((registration) => ({
                          ...registration,
                          child:
                            portal.children.find(
                              (child) =>
                                child.id ===
                                registration.studentId
                            ),
                        }));

                    const approved =
                      sessionItem.registrations.filter(
                        (registration) =>
                          registration.status ===
                          "APPROVED"
                      ).length;

                    const capacity =
                      sessionItem.capacityOverride ??
                      course.capacity;

                    const remaining =
                      capacity == null
                        ? null
                        : capacity - approved;

                    return (

                      <div
                        key={sessionItem.id}
                        className="flex flex-col gap-4 rounded-2xl border p-5 lg:flex-row lg:items-center lg:justify-between"
                      >

                        <div>

                          <div className="font-semibold">
                            {sessionItem.startTime.toLocaleString()}
                          </div>

                          <div className="text-sm text-gray-500">
                            Room: {sessionItem.room ?? "TBD"}
                          </div>

                          <div className="text-sm text-gray-500">
                            Teacher:{" "}
                            {sessionItem.teacher
                              ? `${sessionItem.teacher.firstName} ${sessionItem.teacher.lastName}`
                              : "TBD"}
                          </div>

                          <div className="text-sm text-gray-500">

                            {capacity == null
                              ? "Unlimited Seats"
                              : `${remaining} seat(s) remaining`}

                          </div>

                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                        {portal.role === "PARENT" &&
                          userRegistrations.length > 0 && (

                          <div className="space-y-2">

                            {userRegistrations.map(
                              (registration) => (

                                <div
                                  key={registration.id}
                                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-2"
                                >

                                  <span className="font-medium">

                                    {registration.child
                                      ?.studentUser
                                      .firstName}{" "}
                                    {registration.child
                                      ?.studentUser
                                      .lastName}

                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${getRegistrationStatusClassName(
                                      registration.status
                                    )}`}
                                  >
                                    {getRegistrationStatusLabel(
                                      registration.status
                                    )}
                                  </span>

                                </div>

                              )
                            )}

                          </div>

                        )}

                        {portal.role !== "PARENT" &&
                          userRegistrations.length > 0 && (

                          <div className="flex flex-wrap gap-2 lg:justify-end">

                            {userRegistrations.map(
                              (registration) => (

                                <span
                                  key={registration.id}
                                  className={`rounded-full px-3 py-1 text-sm font-medium ${getRegistrationStatusClassName(
                                    registration.status
                                  )}`}
                                >
                                  {getRegistrationStatusLabel(
                                    registration.status
                                  )}
                                </span>

                              )
                            )}

                          </div>

                        )}

                          {canRegister && (
                            <Link
                              href={`/portal/register/${sessionItem.id}`}
                              className="rounded-xl bg-[#7AAACD] px-5 py-3 text-white transition hover:opacity-90"
                            >
                              Register
                            </Link>
                          )}
                        </div>
                      </div>

                    );

                  })

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>
  );
}
