import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { teacherCanAccessStudent } from "@/lib/teacher-access";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") redirect("/dashboard");

  const { id } = await params;
  if (session.user.role === "TEACHER" && !(await teacherCanAccessStudent(session.user.id, id))) {
    redirect("/dashboard/teacher");
  }

  const teacherScope = session.user.role === "TEACHER" ? { session: { teacherId: session.user.id } } : undefined;
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      studentUser: { select: { firstName: true, lastName: true } },
      attendance: {
        where: teacherScope,
        include: { session: { include: { course: { select: { title: true } } } } },
        orderBy: { session: { startTime: "desc" } },
      },
      registrations: {
        where: teacherScope,
        include: { session: { include: { course: { select: { title: true } } } } },
        orderBy: { session: { startTime: "desc" } },
      },
      comments: {
        where: session.user.role === "TEACHER" ? { teacherId: session.user.id } : undefined,
        include: { teacher: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!student) notFound();

  const backHref = session.user.role === "TEACHER" ? "/dashboard/teacher" : "/admin/users";
  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F8F3" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-4xl font-bold text-gray-800">{student.studentUser.firstName} {student.studentUser.lastName}</h1><p className="mt-2 text-gray-500">Student learning profile</p></div>
          <Link href={backHref} className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50">← Back</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3"><InfoCard title="Course Registrations" value={String(student.registrations.length)} /><InfoCard title="Attendance Records" value={String(student.attendance.length)} /><InfoCard title="Teacher Comments" value={String(student.comments.length)} /></div>
        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold">Course Registrations</h2>{student.registrations.length === 0 ? <p className="mt-4 text-gray-500">No course registrations are available.</p> : <div className="mt-5 space-y-3">{student.registrations.map((registration) => <div key={registration.id} className="rounded-xl border p-4"><p className="font-semibold">{registration.session.course.title}</p><p className="mt-1 text-sm text-gray-500">{registration.session.startTime.toLocaleString()} · {registration.status}</p></div>)}</div>}</section>
        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold">Attendance History</h2>{student.attendance.length === 0 ? <p className="mt-4 text-gray-500">No attendance records are available.</p> : <div className="mt-5 space-y-3">{student.attendance.map((attendance) => <div key={attendance.id} className="rounded-xl border p-4"><p className="font-semibold">{attendance.session.course.title}</p><p className="mt-1 text-sm text-gray-500">{attendance.session.startTime.toLocaleString()} · {attendance.status}</p></div>)}</div>}</section>
        <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-semibold">Teacher Comments</h2>{student.comments.length === 0 ? <p className="mt-4 text-gray-500">No teacher comments are available.</p> : <div className="mt-5 space-y-3">{student.comments.map((comment) => <div key={comment.id} className="rounded-xl border p-4"><p className="text-gray-700">{comment.comment}</p><p className="mt-2 text-sm text-gray-500">{comment.teacher.firstName} {comment.teacher.lastName} · {comment.createdAt.toLocaleString()}</p></div>)}</div>}</section>
        <div className="mt-8"><Link href={`/students/${student.id}/files`} className="rounded-xl bg-[#7AAACD] px-5 py-3 text-white hover:opacity-90">View Student Files</Link></div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
