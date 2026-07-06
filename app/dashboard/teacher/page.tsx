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
  MessageCircle,
  Users,
} from "lucide-react";

import Link from "next/link";

export default async function TeacherDashboard() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  const teacher =
    await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },

      include: {
        teachingSessions: {
          orderBy: {
            startTime: "asc",
          },
          include: {
            course: true,
          },
        },
      },
    });

  const firstName =
    teacher?.firstName ??
    session.user.name ??
    "Teacher";

  const coursesWithSessions = Array.from(
    (teacher?.teachingSessions ?? []).reduce(
      (
        courses,
        teachingSession
      ) => {
        const existing = courses.get(
          teachingSession.courseId
        );

        if (existing) {
          existing.sessions.push(teachingSession);
        } else {
          courses.set(teachingSession.courseId, {
            id: teachingSession.courseId,
            title: teachingSession.course.title,
            sessions: [teachingSession],
          });
        }

        return courses;
      },
      new Map<
        string,
        {
          id: string;
          title: string;
          sessions: NonNullable<
            typeof teacher
          >["teachingSessions"];
        }
      >()
    ).values()
  );

  return (
    <PageContainer>

      <DashboardHero
        title={`Welcome back, ${firstName}`}
        subtitle="Manage today's classes and student attendance."
        accent={roleTheme.teacher}
      >
        <div className="flex items-center gap-4">
          <NotificationBell />
          <LogoutButton />
        </div>
      </DashboardHero>

      <DashboardSection title="Teaching Tools">

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <QuickActionCard
            href="/calendar"
            icon={CalendarDays}
            title="Schedule"
            description="View today's teaching schedule"
          />

          <QuickActionCard
            href="/messages"
            icon={MessageCircle}
            title="Messages"
            description="Communicate with parents"
          />

          <QuickActionCard
            href="/students"
            icon={Users}
            title="Students"
            description="View student profiles"
          />

          <QuickActionCard
            href="/attendance"
            icon={ClipboardCheck}
            title="Attendance"
            description="Review attendance records"
          />

        </div>

      </DashboardSection>

      <DashboardSection title="My Courses">

        <div className="space-y-6">

          {coursesWithSessions.map(
            (course) => (
              <div
                key={course.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-2xl font-semibold">
                      {course.title}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      {course.sessions.length} Sessions
                    </p>
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  {course.sessions.map(
                    (session) => (

                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >

                        <div>

                          <p className="font-medium">
                            {session.startTime.toLocaleString()}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Room: {session.room ?? "N/A"}
                          </p>

                        </div>

                        <Link
                          href={`/admin/sessions/${session.id}`}
                          className="rounded-xl bg-[#FAD78A] px-5 py-2 font-medium text-gray-800 transition hover:opacity-90"
                        >
                          Take Attendance
                        </Link>

                      </div>

                    )
                  )}

                </div>

              </div>
            )
          )}

        </div>

      </DashboardSection>

    </PageContainer>
  );
}
