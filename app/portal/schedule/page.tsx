import { prisma } from "@/lib/prisma";
import { getPortalContext } from "@/lib/portal";

import PortalHeader from "@/components/portal/PortalHeader";
import CalendarView from "@/components/calendar-view";
import {
  getRegistrationStatusClassName,
  getRegistrationStatusLabel,
} from "@/lib/registration-status";
import {
  GraduationCap,
  CalendarDays,
  MapPin,
  User,
} from "lucide-react";


export const dynamic = "force-dynamic";

export default async function PortalSchedulePage() {
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

      status: {
        in: [
          "APPROVED",
          "WAITLISTED",
        ],
      },

      session: {
        startTime: {
          gte: new Date(),
        },
      },
    },

    include: {
      student: {
        include: {
          studentUser: true,
        },
      },

      session: {
        include: {
          teacher: true,
          course: true,
        },
      },
    },

    orderBy: {
      session: {
        startTime: "asc",
      },
    },
  });

  const events =
    registrations.map((registration) => ({
      title:
        portal.role === "PARENT"
          ? `${registration.student.studentUser.firstName}: ${registration.session.course.title}`
          : registration.session.course.title,

      start:
        registration.session.startTime,

      end:
        registration.session.endTime,
    }));

  return (
    <div>

      <PortalHeader
        title="Schedule"
        subtitle="Upcoming classes and events."
      />

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

      <div className="border-b px-6 py-5">

        <h2 className="text-2xl font-semibold">
          Calendar
        </h2>

        <p className="mt-1 text-gray-500">
          View all upcoming classes in calendar format.
        </p>

      </div>

      <div className="p-6">
        <CalendarView events={events} />
      </div>

      </div>

      <div className="mt-8 rounded-3xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-2xl font-semibold">
            Upcoming Sessions
          </h2>

        </div>

        {registrations.length === 0 ? (

          <div className="p-12 text-center">

          <div className="mx-auto max-w-md">

            <h3 className="text-2xl font-semibold">
              No Upcoming Classes
            </h3>

            <p className="mt-3 text-gray-500">
              Once you're registered for classes, they will appear here automatically.
            </p>

          </div>

          </div>

        ) : (

          <div className="space-y-5 p-6">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-4">

                    <div className="rounded-2xl bg-[#7AAACD]/10 p-3">
                      <GraduationCap className="h-7 w-7 text-[#7AAACD]" />
                    </div>

                    <div>

                      <h3 className="text-xl font-semibold">
                        {registration.session.course.title}
                      </h3>

                      {portal.role === "PARENT" && (
                        <p className="mt-1 text-gray-500">
                          Child:{" "}
                          {registration.student.studentUser.firstName}{" "}
                          {registration.student.studentUser.lastName}
                        </p>
                      )}

                    </div>

                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${getRegistrationStatusClassName(
                      registration.status
                    )}`}
                  >
                    {getRegistrationStatusLabel(
                      registration.status
                    )}
                  </span>

                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                  <Info
                    icon={<CalendarDays className="h-4 w-4" />}
                    title="Date & Time"
                    value={`${registration.session.startTime.toLocaleDateString()} • ${registration.session.startTime.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                  />

                  <Info
                    icon={<MapPin className="h-4 w-4" />}
                    title="Room"
                    value={registration.session.room ?? "TBD"}
                  />

                  <Info
                    icon={<User className="h-4 w-4" />}
                    title="Teacher"
                    value={
                      registration.session.teacher
                        ? `${registration.session.teacher.firstName} ${registration.session.teacher.lastName}`
                        : "Unassigned"
                    }
                  />

                </div>

              </div>
            ))}

          </div>

        )}

      </div>

    </div>
  );
}
function Info({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <div className="flex items-center gap-2 text-sm text-gray-500">

        {icon}

        <span>{title}</span>

      </div>

      <p className="mt-2 font-medium">
        {value}
      </p>

    </div>
  );
}
