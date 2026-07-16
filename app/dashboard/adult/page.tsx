import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import LogoutButton from "@/components/logout-button";
import NotificationBell from "@/components/notification-bell";

import PageContainer from "@/components/ui/PageContainer";
import DashboardHero from "@/components/ui/DashboardHero";
import DashboardSection from "@/components/ui/DashboardSection";
import QuickActionCard from "@/components/ui/QuickActionCard";

import { roleTheme } from "@/lib/theme";

import {
  Calendar,
  BookOpen,
  CreditCard,
  MessageCircle,
  ClipboardList,
  User,
} from "lucide-react";

export default async function AdultDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADULT") {
    redirect("/dashboard");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

  const firstName =
    user?.firstName ??
    session.user.name ??
    "Student";

  return (
    <PageContainer>

      <DashboardHero
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Manage your classes, attendance and learning resources."
        accent={roleTheme.student}
      >
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </DashboardHero>

      <DashboardSection title="My Learning">

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          <QuickActionCard
            href="/portal/schedule"
            icon={Calendar}
            title="My Schedule"
            description="View upcoming classes"
          />

          <QuickActionCard
            href="/portal/attendance"
            icon={ClipboardList}
            title="Attendance"
            description="View attendance history"
          />

          <QuickActionCard
            href="/portal/materials"
            icon={BookOpen}
            title="Learning Materials"
            description="Lesson resources, photos and evaluations"
          />

          <QuickActionCard
            href="/portal/payments"
            icon={CreditCard}
            title="Payments"
            description="Invoices and payment history"
          />

          <QuickActionCard
            href="/messages"
            icon={MessageCircle}
            title="Messages"
            description="Communicate with teachers"
          />

          <QuickActionCard
            href="/profile"
            icon={User}
            title="My Profile"
            description="Manage your account"
          />

        </div>

      </DashboardSection>

      <DashboardSection title="Announcements">

        <div className="rounded-2xl border bg-white p-6">

          <h3 className="text-lg font-semibold">
            📢 Center Updates
          </h3>

          <div className="mt-4 space-y-3 text-gray-600">

            <p>
              • Welcome to the Adult Student Portal.
            </p>

            <p>
              • New courses are now open for registration.
            </p>

            <p>
              • Upcoming center events will appear here.
            </p>

          </div>

        </div>

      </DashboardSection>

    </PageContainer>
  );
}