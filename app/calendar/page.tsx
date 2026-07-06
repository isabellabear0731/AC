import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar-view";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function CalendarPage() {
  const authSession = await getServerSession(authOptions);

  const sessions = await prisma.courseSession.findMany({
    where:
      authSession?.user.role === "TEACHER"
        ? {
            teacherId: authSession.user.id,
          }
        : undefined,
    include: {
      course: true,
      teacher: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const events = sessions.map((session) => ({
    title:
      `${session.course.title} (${session.room ?? "No Room"})` +
      (authSession?.user.role === "TEACHER"
        ? ""
        : ` — ${
            session.teacher
              ? `${session.teacher.firstName} ${session.teacher.lastName}`
              : "Unassigned"
          }`),
    start: session.startTime,
    end: session.endTime,
  }));

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Calendar
      </h1>

      <CalendarView events={events} />
    </div>
  );
}
