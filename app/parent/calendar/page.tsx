import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/calendar-view";

export default async function ParentCalendar() {
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

          registrations: {
            include: {
              session: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const events =
    parent?.children.flatMap(
      (child) =>
        child.registrations.map(
          (r) => ({
            title:
              `${child.studentUser.firstName}: ` +
              r.session.course.title,

            start:
              r.session.startTime,

            end:
              r.session.endTime,
          })
        )
    ) ?? [];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Family Calendar
      </h1>

      <CalendarView events={events} />
    </div>
  );
}