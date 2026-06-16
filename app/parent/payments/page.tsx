import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function ParentPaymentsPage() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const payments =
    await prisma.payment.findMany({
      where: {
        status: "UNPAID",

        registration: {
          student: {
            parentId:
              session.user.id,
          },
        },
      },

      include: {
        registration: {
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
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Outstanding Payments
      </h1>

      {payments.length === 0 ? (
        <div className="mt-6 rounded border p-6 text-center text-gray-500">
          No outstanding payments.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((p) => (
            <div
              key={p.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold text-lg">
                {
                  p.registration.student
                    .studentUser.firstName
                }{" "}
                {
                  p.registration.student
                    .studentUser.lastName
                }
              </h2>

              <p className="mt-2">
                Course:{" "}
                {
                  p.registration.session
                    .course.title
                }
              </p>

              <p>
                Amount Due: ${p.amount}
              </p>

              <p className="font-medium text-red-600">
                Status: UNPAID
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}