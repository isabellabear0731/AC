import { prisma } from "@/lib/prisma";
import { getPortalContext } from "@/lib/portal";
import PortalHeader from "@/components/portal/PortalHeader";
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Receipt,
  GraduationCap,
  CalendarDays,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalPaymentsPage() {
  const portal =
    await getPortalContext();

  let payments = [];

  if (portal.role === "PARENT") {
    payments =
      await prisma.payment.findMany({
        where: {
          registration: {
            student: {
              parentId:
                portal.user.id,
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
  } else {
    payments =
      await prisma.payment.findMany({
        where: {
          registration: {
            student: {
              studentUserId:
                portal.user.id,
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
  }

  const unpaid =
    payments.filter(
      (payment) =>
        payment.status ===
        "UNPAID"
    );

  const paid =
    payments.filter(
      (payment) =>
        payment.status ===
        "PAID"
    );

  const totalOutstanding =
    unpaid.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  return (
    <div>

      <PortalHeader
        title="Payments"
        subtitle="Invoices and payment history."
      />

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

      <StatCard
        title="Outstanding"
        value={`$${totalOutstanding}`}
        icon={<DollarSign className="h-5 w-5 text-red-600" />}
      />

      <StatCard
        title="Unpaid"
        value={String(unpaid.length)}
        icon={<Receipt className="h-5 w-5 text-yellow-600" />}
      />

      <StatCard
        title="Paid"
        value={String(paid.length)}
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
      />

      </div>

      {/* Payment List */}

      {payments.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

        <CreditCard className="mx-auto h-14 w-14 text-gray-300" />

        <h2 className="mt-5 text-2xl font-semibold">
          No Payments
        </h2>

        <p className="mt-3 text-gray-500">
          Any invoices or payment history will appear here.
        </p>

        </div>

      ) : (

        <div className="space-y-5">

          {payments.map(
            (payment) => (

              <div
                key={payment.id}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >

              <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

                <GraduationCap className="h-7 w-7 text-[#7AAACD]" />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  {payment.registration.session.course.title}
                </h2>

                {portal.role === "PARENT" && (

                  <p className="mt-1 text-gray-500">

                    Child:{" "}
                    {payment.registration.student.studentUser.firstName}{" "}
                    {payment.registration.student.studentUser.lastName}

                  </p>

                )}

              </div>

              </div>

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                <Info
                  icon={<DollarSign className="h-4 w-4" />}
                  title="Amount"
                  value={`$${payment.amount}`}
                />

                <Info
                  icon={<CreditCard className="h-4 w-4" />}
                  title="Status"
                  value={payment.status}
                />

                <Info
                  icon={<CalendarDays className="h-4 w-4" />}
                  title="Paid"
                  value={
                    payment.paidAt
                      ? payment.paidAt.toLocaleDateString()
                      : "-"
                  }
                />

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
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