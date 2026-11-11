import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";

export default async function AdultProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADULT") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F8F1" }}>
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4D9632]">My Profile</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">Coming Soon</h1>
        <p className="mt-4 text-gray-600">
          Profile editing is not available in the current portal release. Your account and learning records remain available.
        </p>
        <Link href="/dashboard/adult" className="mt-8 inline-block rounded-xl bg-[#4D9632] px-5 py-3 text-white hover:opacity-90">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
