import { prisma } from "@/lib/prisma";

export default async function AdminPaymentsPage() {
  const payments =
    await prisma.payment.findMany({
      where: {
        status: "UNPAID",
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
          No unpaid invoices.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold text-lg">
                {
                  payment.registration
                    .student.studentUser
                    .firstName
                }{" "}
                {
                  payment.registration
                    .student.studentUser
                    .lastName
                }
              </h2>

              <p className="mt-2">
                Course:{" "}
                {
                  payment.registration
                    .session.course.title
                }
              </p>

              <p>
                Amount: $
                {payment.amount}
              </p>

              <p className="font-medium text-red-600">
                Status: UNPAID
              </p>

              <form
                action={`/api/payments/${payment.id}/pay`}
                method="POST"
                className="mt-4"
              >
                <button
                  type="submit"
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Mark Paid
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}