import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function WaitlistRegistrationPage({
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
      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-blue-700">
            Place on Waitlist
          </h1>

          <p className="mt-2 text-gray-500">
            The family will receive a waitlist notification and email.
          </p>

        </div>

        <Link
          href={`/admin/registrations/${registration.id}`}
          className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
        >
          ← Back
        </Link>

      </div>

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

      <form
        action={`/api/registrations/${registration.id}/waitlist`}
        method="POST"
        className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"
      >

        <h2 className="text-xl font-semibold">
          Waitlist Note
        </h2>

        <p className="mt-2 text-gray-500">
          Optional note that will be included in the notification and email.
        </p>

        <textarea
          name="reason"
          rows={6}
          className="mt-5 w-full rounded-xl border p-4"
          placeholder="Example: Class is currently full. We will notify you immediately if a seat becomes available."
        />

        <div className="mt-8 flex gap-4">

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Place on Waitlist
          </button>

          <Link
            href={`/admin/registrations/${registration.id}`}
            className="rounded-xl border bg-white px-6 py-3 hover:bg-gray-50"
          >
            Cancel
          </Link>

        </div>

      </form>

    </div>
  );
}
