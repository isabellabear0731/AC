import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import NotificationBell from "@/components/notification-bell";
import LogoutButton from "@/components/logout-button";

import PageContainer from "@/components/ui/PageContainer";
import DashboardHero from "@/components/ui/DashboardHero";
import DashboardSection from "@/components/ui/DashboardSection";
import QuickActionCard from "@/components/ui/QuickActionCard";

import { roleTheme } from "@/lib/theme";

import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  MessageCircle,
  BarChart3,
} from "lucide-react";

export default async function StudentDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const student =
    await prisma.studentProfile.findUnique({
      where: {
        studentUserId: session.user.id,
      },

      include: {
        parent: true,
      },
    });

  const firstName =
    session.user.name ??
    "Student";

  const parent = student?.parent;

  const guardianName =
    parent
      ? `${parent.firstName} ${parent.lastName}`
      : "Adult Student";

  return (
    <PageContainer>
      <DashboardHero
        title={`Welcome, ${firstName}!`}
        subtitle="Ready for another great day of learning?"
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
            icon={CalendarDays}
            title="My Schedule"
            description="View upcoming classes and activities"
          />

          <QuickActionCard
            href="/portal/attendance"
            icon={ClipboardCheck}
            title="Attendance"
            description="Review your attendance history"
          />

          <QuickActionCard
            href="/portal/materials"
            icon={FileText}
            title="Learning Materials"
            description="View learning materials uploaded by your teachers."
          />

          <QuickActionCard
            href="/portal/messages"
            icon={MessageCircle}
            title="Messages"
            description="Read teacher feedback and messages"
          />

          <QuickActionCard
            href="/profile"
            icon={BarChart3}
            title="My Progress"
            description="View your learning progress"
          />
        </div>
      </DashboardSection>

      <DashboardSection title="My Information">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Student Information
          </h3>

          <div className="mt-4 space-y-2 text-gray-600">
            <p>
              <span className="font-medium">
                Parent:
              </span>{" "}
              {guardianName}
            </p>

            <p>
              <span className="font-medium">
                Account Status:
              </span>{" "}
              Active
            </p>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Center Reminder">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Reminder
          </h3>

          <div className="mt-4 space-y-2 text-gray-600">
            <p>
              • Be respectful to classmates and teachers.
            </p>

            <p>
              • Bring everything you need for class.
            </p>

            <p>
              • Have fun learning!
            </p>
          </div>
        </div>
      </DashboardSection>
    </PageContainer>
  );
}
