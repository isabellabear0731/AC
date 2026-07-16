import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const registrations =
    await prisma.registration.findMany({
      include: {
        student: {
          include: {
            studentUser: true,
            parent: true,
          },
        },

        session: {
          include: {
            course: true,
            teacher: true,
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const stats = {
    pending: registrations.filter(
      (r) => r.status === "PENDING"
    ).length,

    approved: registrations.filter(
      (r) => r.status === "APPROVED"
    ).length,

    rejected: registrations.filter(
      (r) => r.status === "REJECTED"
    ).length,

    waitlisted: registrations.filter(
      (r) => r.status === "WAITLISTED"
    ).length,

    cancelled: registrations.filter(
      (r) => r.status === "CANCELLED"
    ).length,
  };

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

          <h1 className="text-4xl font-bold">
            Registration Queue
          </h1>

          <p className="mt-2 text-gray-500">
            Review and manage course registrations.
          </p>

        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Dashboard
        </Link>

      </div>

      {/* Statistics */}

      <div className="mb-8 grid gap-5 md:grid-cols-5">

        <StatCard
          title="Pending"
          value={stats.pending}
          color="text-yellow-600"
        />

        <StatCard
          title="Approved"
          value={stats.approved}
          color="text-green-600"
        />

        <StatCard
          title="Rejected"
          value={stats.rejected}
          color="text-red-600"
        />

        <StatCard
          title="Waitlisted"
          value={stats.waitlisted}
          color="text-blue-600"
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          color="text-gray-600"
        />

      </div>

      {/* Queue */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <table className="w-full">

          <thead
            style={{
              background: "#EBEBCF",
            }}
          >
            <tr>

              <th className="px-5 py-4 text-left">
                Student
              </th>

              <th className="px-5 py-4 text-left">
                Parent
              </th>

              <th className="px-5 py-4 text-left">
                Course
              </th>

              <th className="px-5 py-4 text-left">
                Status
              </th>

              <th className="px-5 py-4 text-left">
                Payment
              </th>

              <th className="px-5 py-4 text-center">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {registrations.map((reg) => {
              const parent = reg.student.parent;

              const guardianName =
                parent
                  ? `${parent.firstName} ${parent.lastName}`
                  : "Adult Student";

              return (
                <tr
                  key={reg.id}
                  className="border-t hover:bg-gray-50"
                >

                <td className="px-5 py-4">

                  {reg.student.studentUser.firstName}{" "}
                  {reg.student.studentUser.lastName}

                </td>

                <td className="px-5 py-4">

                  {guardianName}

                </td>

                <td className="px-5 py-4">

                  {reg.session.course.title}

                </td>

                <td className="px-5 py-4">

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">

                    {reg.status}

                  </span>

                </td>

                <td className="px-5 py-4">

                  {reg.payment
                    ? reg.payment.status
                    : "-"}

                </td>

                <td className="px-5 py-4 text-center">

                  <Link
                    href={`/admin/registrations/${reg.id}`}
                    className="rounded-xl bg-[#7AAACD] px-4 py-2 text-white hover:opacity-90"
                  >
                    Review
                  </Link>

                </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </p>

    </div>
  );
}
