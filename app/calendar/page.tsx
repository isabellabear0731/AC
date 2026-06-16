import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar-view";

export default async function CalendarPage() {
  const sessions = await prisma.courseSession.findMany({
    include: {
      course: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const events = sessions.map((session) => ({
    title: `${session.course.title} (${session.room ?? "No Room"})`,
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