import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { prisma } from "@/lib/prisma";
import NotificationBell from "@/components/notification-bell";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  const student = await prisma.studentProfile.findUnique({
    where: {
      studentUserId: session.user.id,
    },
    include: {
      parent: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">
          Student Dashboard
        </h1>
      </div>

      <div className="rounded-lg border p-4">
        <p>
          Welcome, {session.user.email}
        </p>
        
        <div className="flex items-center gap-4">
        <NotificationBell />
        <LogoutButton />

      </div>

        <p>
          Parent: {student?.parent.firstName}{" "}
          {student?.parent.lastName}
        </p>

        <p>
          Account Status: Active
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          My Schedule
        </div>

        <div className="rounded border p-4">
          Attendance
        </div>

        <div className="rounded border p-4">
          Teacher Comments
        </div>

        <div className="rounded border p-4">
          Evaluations
        </div>
      </div>
    </div>
  );
}