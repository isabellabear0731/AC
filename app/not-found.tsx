import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border bg-white p-12 text-center shadow-sm">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#7AAACD]/10">

          <SearchX className="h-10 w-10 text-[#7AAACD]" />

        </div>

        <h1 className="mt-8 text-4xl font-bold">
            Oops! We couldn't find that page.
        </h1>

        <p className="mt-4 text-gray-500">
          Sorry, we couldn't find the page you're looking for.
          It may have been moved or no longer exists.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white transition hover:opacity-90"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="rounded-xl border px-6 py-3 transition hover:bg-gray-50"
          >
            Back to Home
          </Link>

        </div>

      </div>
    </div>
  );
}