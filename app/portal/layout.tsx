import Link from "next/link";

import { PortalProvider } from "@/components/portal/PortalProvider";
import { getPortalContext } from "@/lib/portal";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portal =
    await getPortalContext();

  return (
    <PortalProvider
      value={{
        role: portal.role,

        selectedStudentId:
          portal.selectedStudent?.id ??
          null,

        children:
          portal.children.map(
            (child) => ({
              id: child.id,

              studentUser: {
                firstName:
                  child.studentUser
                    .firstName,

                lastName:
                  child.studentUser
                    .lastName,
              },
            })
          ),
      }}
    >
      <div
        className="min-h-screen"
        style={{
          background: "#F8F8F3",
        }}
      >
        <header className="border-b bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

            <h1 className="text-2xl font-bold">
              Student Portal
            </h1>

            <nav className="flex gap-6 text-sm font-medium">

              <Link href="/portal/courses">
                Courses
              </Link>

              <Link href="/portal/schedule">
                Schedule
              </Link>

              <Link href="/portal/attendance">
                Attendance
              </Link>

              <Link href="/portal/materials">
                Materials
              </Link>

              <Link href="/portal/payments">
                Payments
              </Link>

              <Link href="/messages">
                Messages
              </Link>

              <Link href="/dashboard">
                Dashboard
              </Link>

            </nav>

          </div>

        </header>

        <main className="mx-auto max-w-7xl p-8">
          {children}
        </main>

      </div>

    </PortalProvider>
  );
}