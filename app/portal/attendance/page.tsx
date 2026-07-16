import { prisma } from "@/lib/prisma";
import { getPortalContext } from "@/lib/portal";

import PortalHeader from "@/components/portal/PortalHeader";

import {
  GraduationCap,
  CalendarDays,
  MapPin,
  User,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalAttendancePage() {
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

  const attendance =
    await prisma.attendance.findMany({
      where: {
        studentId: {
          in: studentIds,
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
          startTime: "desc",
        },
      },
    });

  const presentCount =
    attendance.filter(
      (a) => a.status === "PRESENT"
    ).length;

  const lateCount =
    attendance.filter(
      (a) => a.status === "LATE"
    ).length;

  const absentCount =
    attendance.filter(
      (a) =>
        a.status ===
          "UNEXCUSED_ABSENT" ||
        a.status ===
          "EXCUSED_ABSENT"
    ).length;

  return (
    <div>

      <PortalHeader
        title="Attendance"
        subtitle="Attendance records for enrolled courses."
      />

      <div className="mb-8 grid gap-5 md:grid-cols-4">

        <StatCard
          title="Total Records"
          value={attendance.length}
          icon={
            <CalendarDays className="h-5 w-5 text-[#7AAACD]" />
          }
        />

        <StatCard
          title="Present"
          value={presentCount}
          icon={
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          }
        />

        <StatCard
          title="Late"
          value={lateCount}
          icon={
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          }
        />

        <StatCard
          title="Absent"
          value={absentCount}
          icon={
            <XCircle className="h-5 w-5 text-red-600" />
          }
        />

      </div>

      {attendance.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

          <h2 className="text-2xl font-semibold">
            No Attendance Records
          </h2>

          <p className="mt-3 text-gray-500">
            Attendance will appear here once classes begin.
          </p>

        </div>

      ) : (

        <div className="space-y-6">
                    {attendance.map((record) => (

<div
  key={record.id}
  className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md"
>

  <div className="flex items-start justify-between">

    <div className="flex items-center gap-4">

      <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

        <GraduationCap className="h-7 w-7 text-[#7AAACD]" />

      </div>

      <div>

        <h2 className="text-xl font-semibold">
          {record.session.course.title}
        </h2>

        {portal.role === "PARENT" && (

          <p className="mt-1 text-gray-500">

            Child:{" "}
            {record.student.studentUser.firstName}{" "}
            {record.student.studentUser.lastName}

          </p>

        )}

      </div>

    </div>

    <span
      className={`rounded-full px-4 py-2 text-sm font-medium ${getAttendanceStatusClassName(
        record.status
      )}`}
    >
      {formatAttendanceStatus(
        record.status
      )}
    </span>

  </div>

  <div className="mt-6 grid gap-5 md:grid-cols-2">

    <Info
      icon={<CalendarDays className="h-4 w-4" />}
      title="Class Time"
      value={`${record.session.startTime.toLocaleDateString()} • ${record.session.startTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`}
    />

    <Info
      icon={<MapPin className="h-4 w-4" />}
      title="Room"
      value={record.session.room ?? "TBD"}
    />

    <Info
      icon={<User className="h-4 w-4" />}
      title="Teacher"
      value={
        record.session.teacher
          ? `${record.session.teacher.firstName} ${record.session.teacher.lastName}`
          : "Unassigned"
      }
    />

    <Info
      icon={<Clock3 className="h-4 w-4" />}
      title="Check In"
      value={
        record.checkInTime
          ? record.checkInTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "Not Checked In"
      }
    />

    <Info
      icon={<Clock3 className="h-4 w-4" />}
      title="Check Out"
      value={
        record.checkOutTime
          ? record.checkOutTime.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "Not Checked Out"
      }
    />

  </div>

  {(record.reason ||
    record.arrivalNote ||
    record.departureNote) && (

    <div className="mt-6 rounded-2xl bg-gray-50 p-5">

      <h3 className="mb-3 font-semibold">
        Notes
      </h3>

      {record.reason && (
        <p>
          <strong>Reason:</strong>{" "}
          {record.reason}
        </p>
      )}

      {record.arrivalNote && (
        <p className="mt-2">
          <strong>Arrival:</strong>{" "}
          {record.arrivalNote}
        </p>
      )}

      {record.departureNote && (
        <p className="mt-2">
          <strong>Departure:</strong>{" "}
          {record.departureNote}
        </p>
      )}

    </div>

  )}

</div>

))}

</div>

)}

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

function formatAttendanceStatus(
status: string
) {
switch (status) {
case "PRESENT":
return "Present";

case "LATE":
return "Late";

case "EXCUSED_ABSENT":
return "Excused";

case "UNEXCUSED_ABSENT":
return "Absent";

default:
return status;
}
}

function getAttendanceStatusClassName(
status: string
) {
switch (status) {
case "PRESENT":
return "bg-green-100 text-green-700";

case "LATE":
return "bg-yellow-100 text-yellow-700";

case "EXCUSED_ABSENT":
return "bg-blue-100 text-blue-700";

case "UNEXCUSED_ABSENT":
return "bg-red-100 text-red-700";

default:
return "bg-gray-100 text-gray-700";
}
}