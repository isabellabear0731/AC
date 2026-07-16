import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-10"
      style={{
        backgroundColor: "#EBEBCF",
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            aria-label="The Gifted Center home"
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{
              backgroundColor: "#7AAACD",
            }}
          >
            GC
          </Link>

          <h1 className="text-3xl font-bold text-gray-800">
            {title}
          </h1>

          <p className="mt-2 text-gray-500">
            {subtitle}
          </p>
        </div>

        {children}

        {footer}

        <div className="mt-10 border-t pt-5 text-center text-xs text-gray-400">
          © 2026 The Gifted Center
        </div>
      </div>
    </div>
  );
}
