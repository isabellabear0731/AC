import Link from "next/link";
import { SearchX } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-8"
      style={{
        background: "#F8F8F1",
      }}
    >
      <div className="w-full max-w-lg rounded-[2rem] border border-[#dce7d5] bg-white p-8 text-center shadow-[0_20px_55px_rgba(29,70,36,0.14)] sm:p-12">

        <BrandLogo compact className="mx-auto mb-8" />

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#4D9632]/10">

          <SearchX className="h-10 w-10 text-[#4D9632]" />

        </div>

        <h1 className="gps-heading mt-8 text-4xl font-bold">
          Oops! We couldn&apos;t find that page.
        </h1>

        <p className="mt-4 text-gray-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It may have been moved or no longer exists.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#4D9632] px-6 py-3 text-white transition hover:opacity-90"
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
