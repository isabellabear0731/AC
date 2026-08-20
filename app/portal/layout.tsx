import Link from "next/link";

import { PortalProvider } from "@/components/portal/PortalProvider";
import { getPortalContext } from "@/lib/portal";
import {
  getDashboardHref,
  getPortalLabel,
} from "@/lib/role-navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portal =
    await getPortalContext();

  const dashboardHref =
    getDashboardHref(portal.role);

  const portalLabel =
    getPortalLabel(portal.role);

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

            <Link
              href={dashboardHref}
              aria-label={`${portalLabel} home`}
              className="text-2xl font-bold transition hover:text-[#7AAACD]"
            >
              {portalLabel}
            </Link>

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

              <Link href={dashboardHref}>
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
