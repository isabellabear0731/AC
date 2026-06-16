import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const child =
  await prisma.studentProfile.findUnique({
    where: {
      id,
    },

    include: {
      studentUser: true,

      registrations: {
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },
      },

      attendance: {
        include: {
          session: {
            include: {
              course: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!child) {
    notFound();
  }

  const authSession =
  await getServerSession(authOptions);

if (
  child.parentId !==
  authSession?.user.id
) {
  notFound();
}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {
          child.studentUser
            .firstName
        }{" "}
        {
          child.studentUser
            .lastName
        }
      </h1>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">
            Upcoming Sessions
        </h2>

        {child.registrations.length === 0 ? (
            <p>No upcoming sessions.</p>
        ) : (
            <ul className="mt-4 space-y-3">
            {child.registrations
                .filter(
                (r) =>
                    r.session.startTime >
                    new Date()
                )
                .sort(
                (a, b) =>
                    a.session.startTime.getTime() -
                    b.session.startTime.getTime()
                )
                .map((r) => (
                <li
                    key={r.id}
                    className="rounded border p-3"
                >
                    <p className="font-semibold">
                    {r.session.course.title}
                    </p>

                    <p>
                    {r.session.startTime.toLocaleString()}
                    </p>

                    <p>
                    Room:{" "}
                    {r.session.room ??
                        "TBD"}
                    </p>
                </li>
                ))}
            </ul>
        )}
        </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">
          Attendance History
        </h2>

        {child.attendance.length === 0 ? (
          <p>No attendance records.</p>
        ) : (
          <ul className="space-y-2 mt-4">
            {child.attendance.map(
              (a) => (
                <li
                  key={a.id}
                  className="rounded border p-3"
                >
                  <p>
                    {
                      a.session.course
                        .title
                    }
                  </p>

                  <p>
                    Status:
                    {" "}
                    {a.status}
                  </p>

                  <p>
                    Check In:
                    {" "}
                    {a.checkInTime
                      ?.toLocaleString() ??
                      "N/A"}
                  </p>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}