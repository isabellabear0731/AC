import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const registration =
    await prisma.registration.findUnique({
      where: {
        id,
      },

      include: {
        payment: true,

        student: {
          include: {
            parent: true,
            studentUser: true,
          },
        },

        session: {
          include: {
            course: true,
            teacher: true,
        
            registrations: true,
          },
        },
      },
    });

  if (!registration) {
    notFound();
  }

  const parent = registration.student.parent;

  const guardianName =
    parent
      ? `${parent.firstName} ${parent.lastName}`
      : "Adult Student";

  const guardianEmail =
    parent?.email ??
    registration.student.studentUser.email;

  const guardianPhone =
    parent?.phone ??
    "Not Provided";

  const approvedCount =
    registration.session.registrations.filter(
      (r) => r.status === "APPROVED"
    ).length;
  
  const waitlistedCount =
    registration.session.registrations.filter(
      (r) => r.status === "WAITLISTED"
    ).length;
  
  const capacity =
    registration.session.capacityOverride ??
    registration.session.course.capacity;
  
  const remainingSeats =
    capacity == null
      ? null
      : Math.max(0, capacity - approvedCount);

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
            Registration Review
          </h1>

          <p className="mt-2 text-gray-500">
            Review this registration before making a decision.
          </p>

        </div>

        <Link
          href="/admin/registrations"
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Registration Queue
        </Link>

      </div>

      {/* Student */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Student Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <Info
            title="Student"
            value={`${registration.student.studentUser.firstName} ${registration.student.studentUser.lastName}`}
          />

        <Info
          title="Parent"
          value={guardianName}
        />

        <Info
          title="Email"
          value={guardianEmail}
        />

        <Info
          title="Phone"
          value={guardianPhone}
        />

        </div>

      </div>

      {/* Course */}

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Course Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <Info
            title="Course"
            value={registration.session.course.title}
          />

          <Info
            title="Teacher"
            value={
              registration.session.teacher
                ? `${registration.session.teacher.firstName} ${registration.session.teacher.lastName}`
                : "Unassigned"
            }
          />

          <Info
            title="Session"
            value={registration.session.startTime.toLocaleString()}
          />

          <Info
            title="Room"
            value={registration.session.room ?? "N/A"}
          />

        </div>

      </div>

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Session Capacity
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-4">

          <Info
            title="Capacity"
            value={
              capacity == null
                ? "Unlimited"
                : String(capacity)
            }
          />

          <Info
            title="Approved"
            value={String(approvedCount)}
          />

          <Info
            title="Waitlisted"
            value={String(waitlistedCount)}
          />

          <Info
            title="Seats Remaining"
            value={
              remainingSeats == null
                ? "Unlimited"
                : String(remainingSeats)
            }
          />

        </div>

        <div className="mt-6">

          {remainingSeats == null ? (

            <div className="rounded-xl bg-green-50 p-4 text-green-700">

              Unlimited capacity. Students can be approved immediately.

            </div>

          ) : remainingSeats > 0 ? (

            <div className="rounded-xl bg-green-50 p-4 text-green-700">

              ✅ {remainingSeats} seat(s) available.
              Waitlisted students may be promoted.

            </div>

          ) : (

            <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700">

              ⚠ This session is currently full.
              Additional approvals will exceed capacity.

            </div>

          )}

        </div>

      </div>

      {/* Status */}

      <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Registration Status
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

        <div>
          <p className="text-sm text-gray-500">
            Current Status
          </p>

          <div className="mt-2">

            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                registration.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : registration.status === "WAITLISTED"
                  ? "bg-blue-100 text-blue-700"
                  : registration.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {registration.status}
            </span>

          </div>

          </div>

          <Info
            title="Payment"
            value={
              registration.payment
                ? registration.payment.status
                : "Not Created"
            }
          />

          <Info
            title="Registered"
            value={registration.createdAt.toLocaleString()}
          />

          <Info
            title="Approved At"
            value={
              registration.approvedAt
                ? registration.approvedAt.toLocaleString()
                : "-"
            }
          />

        </div>

      </div>

      {/* Reason */}

      {registration.cancelReason && (

        <div className="mt-8 rounded-3xl border bg-red-50 p-6">

          <h2 className="text-lg font-semibold text-red-700">
            Existing Reason
          </h2>

          <p className="mt-3">
            {registration.cancelReason}
          </p>

        </div>

      )}

      {/* Actions */}

      <div className="mt-8 flex flex-wrap gap-4">

        <form
          action={`/api/registrations/${registration.id}/approve`}
          method="POST"
        >
          <button
            className="rounded-xl bg-green-600 px-6 py-3 text-white"
          >
            Approve
          </button>
        </form>

        <Link
          href={`/admin/registrations/${registration.id}/reject`}
          className="rounded-xl bg-red-600 px-6 py-3 text-white"
        >
          Reject
        </Link>

        <Link
          href={`/admin/registrations/${registration.id}/waitlist`}
          className="rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Waitlist
        </Link>

        <Link
          href={`/admin/registrations/${registration.id}/cancel`}
          className="rounded-xl bg-gray-600 px-6 py-3 text-white"
        >
          Cancel
        </Link>

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
    <div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>
  );
}
