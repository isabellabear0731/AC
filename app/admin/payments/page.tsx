import { prisma } from "@/lib/prisma";
import {
  CreditCard,
  DollarSign,
  Receipt,
  User,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
  }>;
}) {
  const { status } =
    await searchParams;
  
    const payments =
  await prisma.payment.findMany({
    where:
      status &&
      status !== "ALL"
        ? {
            status:
              status as
                | "PAID"
                | "UNPAID",
          }
        : undefined,

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

    const unpaid =
      payments.filter(
        (p) => p.status === "UNPAID"
      );
    
    const paid =
      payments.filter(
        (p) => p.status === "PAID"
      );
    
    const outstanding =
      unpaid.reduce(
        (sum, p) => sum + p.amount,
        0
      );
    
    const revenue =
      paid.reduce(
        (sum, p) => sum + p.amount,
        0
      );

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
            Payments
          </h1>

          <p className="mt-2 text-gray-500">
            Review invoices, payment history, and record received payments.
          </p>

        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
        >
          ← Dashboard
        </Link>

      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-5 md:grid-cols-3">

      <StatCard
        title="Outstanding"
        value={`$${outstanding}`}
        icon={
          <DollarSign className="h-5 w-5 text-red-600" />
        }
      />

      <StatCard
        title="Paid"
        value={String(paid.length)}
        icon={
          <CreditCard className="h-5 w-5 text-green-600" />
        }
      />

      <StatCard
        title="Revenue"
        value={`$${revenue}`}
        icon={
          <Receipt className="h-5 w-5 text-[#7AAACD]" />
        }
      />

      </div>

      <div className="mb-8 flex flex-wrap gap-3">

        <FilterButton
          href="/admin/payments"
          active={!status}
        >
          All
        </FilterButton>

        <FilterButton
          href="/admin/payments?status=PAID"
          active={status === "PAID"}
        >
          Paid
        </FilterButton>

        <FilterButton
          href="/admin/payments?status=UNPAID"
          active={status === "UNPAID"}
        >
          Unpaid
        </FilterButton>

      </div>

      {payments.length === 0 ? (

        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

          <CreditCard className="mx-auto h-14 w-14 text-gray-300" />

          <h2 className="mt-5 text-2xl font-semibold">
            No Outstanding Payments
          </h2>

          <p className="mt-3 text-gray-500">
            All invoices have been paid.
          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {payments.map((payment) => (

            <div
              key={payment.id}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="rounded-2xl bg-[#7AAACD]/10 p-3">

                    <User className="h-7 w-7 text-[#7AAACD]" />

                  </div>

                  <div>

                    <h2 className="text-2xl font-semibold">

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

                    <p className="mt-1 text-gray-500">

                      {
                        payment.registration
                          .session.course.title
                      }

                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    payment.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "UNPAID"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payment.status}
                </span>

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">

                <Info
                  title="Amount"
                  value={`$${payment.amount}`}
                />

                <Info
                  title="Invoice Date"
                  value={payment.createdAt.toLocaleDateString()}
                />

                <Info
                  title="Status"
                  value={payment.status}
                />

              </div>

              <div className="mt-6 border-t pt-6">

              <div className="mt-6 border-t pt-6">
                {payment.status === "UNPAID" && (

                  <form
                    action={`/api/payments/${payment.id}/pay`}
                    method="POST"
                  >

                    <button
                      type="submit"
                      className="rounded-xl bg-green-600 px-6 py-3 text-white transition hover:bg-green-700"
                    >
                      Mark as Paid
                    </button>

                  </form>

                )}

                </div>

              </div>

            </div>

          ))}

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
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 font-semibold">
        {value}
      </p>

    </div>
  );
}

function FilterButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#7AAACD] text-white"
          : "border bg-white hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}