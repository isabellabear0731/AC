import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const logs =
    await prisma.auditLog.findMany({
      include: {
        actor: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });

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
            Audit Log
          </h1>

          <p className="mt-2 text-gray-500">
            View all important system activity.
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

      <div className="mb-8 grid gap-5 md:grid-cols-4">

        <StatCard
          title="Records"
          value={logs.length}
        />

        <StatCard
          title="Today"
          value={
            logs.filter((log) => {
              const today =
                new Date();

              return (
                log.createdAt.toDateString() ===
                today.toDateString()
              );
            }).length
          }
        />

        <StatCard
          title="Unique Users"
          value={
            new Set(
              logs
                .map((l) => l.actorId)
                .filter(Boolean)
            ).size
          }
        />

        <StatCard
          title="Entity Types"
          value={
            new Set(
              logs.map(
                (l) => l.entityType
              )
            ).size
          }
        />

      </div>

      {/* Activity */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <table className="w-full">

          <thead
            style={{
              background: "#EBEBCF",
            }}
          >
            <tr>

              <th className="px-5 py-4 text-left">
                Time
              </th>

              <th className="px-5 py-4 text-left">
                User
              </th>

              <th className="px-5 py-4 text-left">
                Action
              </th>

              <th className="px-5 py-4 text-left">
                Entity
              </th>

              <th className="px-5 py-4 text-left">
                Description
              </th>

            </tr>
          </thead>

          <tbody>

            {logs.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-500"
                >
                  No audit records found.
                </td>

              </tr>

            ) : (

              logs.map((log) => (

                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-5 py-4 text-sm">

                    {log.createdAt.toLocaleString()}

                  </td>

                  <td className="px-5 py-4">

                    {log.actor
                      ? `${log.actor.firstName} ${log.actor.lastName}`
                      : "System"}

                  </td>

                  <td className="px-5 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${badgeColor(
                        log.action
                      )}`}
                    >
                      {formatAction(
                        log.action
                      )}
                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <div className="font-medium">
                      {log.entityType}
                    </div>

                    <div className="text-xs text-gray-400">
                      {log.entityId}
                    </div>

                  </td>

                  <td className="px-5 py-4 text-gray-600">

                    {log.description ??
                      "-"}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

function formatAction(
  action: string
) {
  return action
    .replaceAll("_", " ")
    .toUpperCase();
}

function badgeColor(
  action: string
) {
  if (
    action.includes("CREATE")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    action.includes("UPDATE")
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (
    action.includes("DELETE")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    action.includes("APPROVE")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    action.includes("REJECT")
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    action.includes("WAITLIST")
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (
    action.includes("CANCEL")
  ) {
    return "bg-gray-100 text-gray-700";
  }

  return "bg-slate-100 text-slate-700";
}