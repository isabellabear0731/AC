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
  User,
} from "lucide-react";

export default async function ParentDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }

  const parent =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },

      include: {
        children: {
          include: {
            studentUser: true,
          },
        },
      },
    });

  const firstName =
    parent?.firstName ??
    session.user.name ??
    "Parent";

  return (
    <PageContainer>
      <DashboardHero
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Stay connected with your child's learning journey."
        accent={roleTheme.parent}
      >
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </DashboardHero>

      <DashboardSection title="My Children">
        <div className="grid gap-6 md:grid-cols-2">
          {parent?.children.map((child) => (
            <QuickActionCard
              key={child.id}
              href={`/parent/children/${child.id}`}
              icon={User}
              title={`${child.studentUser.firstName} ${child.studentUser.lastName}`}
              description="View schedule, attendance and progress"
            />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Family Services">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            href="/parent/calendar"
            icon={Calendar}
            title="Family Calendar"
            description="View upcoming classes and events"
          />

          <QuickActionCard
            href="/parent/courses"
            icon={BookOpen}
            title="Browse Courses"
            description="Register for available courses"
          />

          <QuickActionCard
            href="/parent/payments"
            icon={CreditCard}
            title="Payments"
            description="View invoices and payment status"
          />

          <QuickActionCard
            href="/messages"
            icon={MessageCircle}
            title="Messages"
            description="Communicate with teachers and staff"
          />
        </div>
      </DashboardSection>

      <DashboardSection title="Center Services">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="text-lg font-semibold">
            📢 Announcements
          </h3>

          <div className="mt-4 space-y-3 text-gray-600">
            <p>
              • Welcome to the Autism Center Parent Portal.
            </p>

            <p>
              • New course registrations are now open.
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