"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

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
        background: "#F8F8F3",
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border bg-white p-12 text-center shadow-sm">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">

          <TriangleAlert className="h-10 w-10 text-red-600" />

        </div>

        <h1 className="mt-8 text-4xl font-bold">
         We're Sorry!
        </h1>

        <p className="mt-4 text-gray-500">
          An unexpected error occurred while loading this page.
          Please try again. If the problem continues,
          contact the center administrator.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            onClick={() => reset()}
            className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white transition hover:opacity-90"
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