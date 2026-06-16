import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ParentCoursesPage() {
  const courses =
  await prisma.course.findMany({
    where: {
      isActive: true,
    },

    include: {
      sessions: {
        include: {
          registrations: {
            where: {
              status: "APPROVED",
            },
          },
        },

        orderBy: {
          startTime: "asc",
        },
      },
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Course Catalog
      </h1>

      <div className="mt-6 grid gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded border p-4"
          >
            <h2 className="text-xl font-semibold">
              {course.title}
            </h2>

            <p>{course.description}</p>

            <p className="mt-2">
              Category: {course.category}
            </p>

            <p>
              Price: ${course.price}
            </p>

            <p>
              Location:{" "}
              {course.location ??
                "TBD"}
            </p>

            <div className="mt-4 space-y-2">
                <h3 className="font-semibold">
                    Sessions
                </h3>

                {course.sessions.map((session) => {
  const approved =
    session.registrations.length;

  const capacity =
    course.capacity;

  const remaining =
    capacity == null
      ? null
      : capacity - approved;

  return (
    <div
      key={session.id}
      className="flex items-center justify-between rounded border p-3"
    >
      <div>
        <p>
          {session.startTime.toLocaleString()}
        </p>

        <p className="text-sm text-gray-500">
          Room: {session.room ?? "TBD"}
        </p>

        <p className="text-sm text-gray-500">
          {capacity == null
            ? "Unlimited seats"
            : `${remaining} seats remaining`}
        </p>
      </div>

      <Link
        href={`/parent/register/${session.id}`}
        className="rounded bg-blue-600 px-3 py-2 text-white"
      >
        Register
      </Link>
    </div>
  );
})}
                </div>
          </div>
        ))}
      </div>
      
    </div>
    
  );
}