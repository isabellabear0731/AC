import Link from "next/link";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import AddChildForm from "@/components/add-child-form";

export default async function AddChildPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#7AAACD]">
              Parent Portal
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Add Child
            </h1>

            <p className="mt-2 text-gray-600">
              Create a student account and add your child to your account.
            </p>
          </div>

          <Link
            href="/dashboard/parent"
            className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold">
              Child Information
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter your child&apos;s information below.
            </p>
          </div>

          <AddChildForm />
        </div>
      </div>
    </div>
  );
}
