import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function RejectRegistrationPage({
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

          <h1 className="text-4xl font-bold text-red-700">
            Reject Registration
          </h1>

          <p className="mt-2 text-gray-500">
            This reason will be saved and shown in the
            parent's notification and email.
          </p>

        </div>

        <Link
          href={`/admin/registrations/${registration.id}`}
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Back
        </Link>

      </div>

      {/* Registration Summary */}

      <div className="rounded-3xl border bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Registration Summary
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div>

            <p className="text-sm text-gray-500">
              Student
            </p>

            <p className="font-semibold">
              {registration.student.studentUser.firstName}{" "}
              {registration.student.studentUser.lastName}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Parent
            </p>

            <p className="font-semibold">
              {guardianName}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Course
            </p>

            <p className="font-semibold">
              {registration.session.course.title}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Session
            </p>

            <p className="font-semibold">
              {registration.session.startTime.toLocaleString()}
            </p>

          </div>

        </div>

      </div>

      {/* Reject Form */}

      <form
        action={`/api/registrations/${registration.id}/reject`}
        method="POST"
        className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"
      >

        <h2 className="text-xl font-semibold">
          Rejection Reason
        </h2>

        <p className="mt-2 text-gray-500">
          Please provide a clear explanation.
        </p>

        <textarea
          name="reason"
          required
          rows={8}
          placeholder="Example:
• Class is already full.
• Required intake documents are missing.
• Student does not meet age requirements.
• Schedule conflict."
          className="mt-5 w-full rounded-xl border p-4"
        />

        <div className="mt-8 flex gap-4">

          <button
            type="submit"
            className="rounded-xl bg-red-600 px-6 py-3 text-white hover:bg-red-700"
          >
            Reject Registration
          </button>

          <Link
            href={`/admin/registrations/${registration.id}`}
            className="rounded-xl border bg-white px-6 py-3 hover:bg-gray-50"
          >
            Cancel
          </Link>

        </div>

      </form>

      {/* Suggestions */}

      <div className="mt-8 rounded-3xl border bg-amber-50 p-6">

        <h2 className="text-lg font-semibold text-amber-800">
          Common Reasons
        </h2>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">

          <li>
            Class capacity has been reached.
          </li>

          <li>
            Required intake evaluation has not been completed.
          </li>

          <li>
            Required documents are missing.
          </li>

          <li>
            Student does not meet age requirements.
          </li>

          <li>
            Requested schedule conflicts with another enrollment.
          </li>

          <li>
            Other administrative reasons.
          </li>

        </ul>

      </div>

    </div>
  );
}
