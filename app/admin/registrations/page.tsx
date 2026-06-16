import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RegistrationPage() {
  const registrations =
    await prisma.registration.findMany({
      where: {
        status: "PENDING",
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
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Pending Registrations
      </h1>

      <div className="mt-6 space-y-4">
        {registrations.length === 0 ? (
          <p>No pending registrations.</p>
        ) : (
          registrations.map((reg) => (
            <div
              key={reg.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold">
                {reg.student.studentUser.firstName}{" "}
                {reg.student.studentUser.lastName}
              </h2>

              <p className="mt-2">
                Course:{" "}
                {reg.session.course.title}
              </p>

              <p>
                Session:{" "}
                {reg.session.startTime.toLocaleString()}
              </p>

              <div className="mt-4 flex gap-2">
                <form
                  action={`/api/registrations/${reg.id}/approve`}
                  method="POST"
                >
                  <button
                    className="rounded bg-green-600 px-3 py-2 text-white"
                    type="submit"
                  >
                    Approve
                  </button>
                </form>

                <form
                  action={`/api/registrations/${reg.id}/reject`}
                  method="POST"
                >
                  <button
                    className="rounded bg-red-600 px-3 py-2 text-white"
                    type="submit"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}