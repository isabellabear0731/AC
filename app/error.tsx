"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-8"
      style={{
        background: "#F8F8F1",
      }}
    >
      <div className="w-full max-w-lg rounded-[2rem] border border-[#dce7d5] bg-white p-8 text-center shadow-[0_20px_55px_rgba(29,70,36,0.14)] sm:p-12">

        <BrandLogo compact className="mx-auto mb-8" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">

          <TriangleAlert className="h-10 w-10 text-red-600" />

        </div>

        <h1 className="gps-heading mt-8 text-4xl font-bold">
          We&apos;re Sorry!
        </h1>

        <p className="mt-4 text-gray-500">
          An unexpected error occurred while loading this page.
          Please try again. If the problem continues,
          contact the center administrator.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#4D9632] px-6 py-3 text-white transition hover:opacity-90"
          >
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="rounded-xl border px-6 py-3 transition hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>

        </div>

      </div>
    </div>
  );
}
