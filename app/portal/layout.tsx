import Link from "next/link";

import AppFooter from "@/components/app-footer";
import BrandLogo from "@/components/brand-logo";
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
      <div className="min-h-screen">
        <header className="border-b border-[#dce7d5] bg-white/90 backdrop-blur">

          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">
              <BrandLogo href={dashboardHref} compact />
              <span className="border-l border-[#dce7d5] pl-4 text-sm font-semibold text-[#113b2b]">
                {portalLabel}
              </span>
            </div>

            <nav className="flex max-w-full gap-1 overflow-x-auto whitespace-nowrap pb-1 text-sm font-semibold text-gray-600 lg:pb-0">

              <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/portal/courses">
                Courses
              </Link>

              <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/portal/schedule">
                Schedule
              </Link>

              <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/portal/attendance">
                Attendance
              </Link>

              <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/portal/materials">
                Materials
              </Link>

              <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/portal/payments">
                Payments
              </Link>

              {portal.role !== "STUDENT" && (
                <Link className="rounded-lg px-3 py-2 transition hover:bg-[#eff6e8] hover:text-[#36721f]" href="/messages">
                  Messages
                </Link>
              )}

              <Link className="rounded-lg bg-[#eff6e8] px-3 py-2 text-[#36721f] transition hover:bg-[#e0efd6]" href={dashboardHref}>
                Dashboard
              </Link>

            </nav>

          </div>

        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-8">
          {children}
        </main>
        <AppFooter />

      </div>

    </PortalProvider>
  );
}
