import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { teacherCanAccessStudent } from "@/lib/teacher-access";

export const dynamic = "force-dynamic";

export default async function StudentFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") redirect("/dashboard");

  const { id } = await params;
  if (session.user.role === "TEACHER" && !(await teacherCanAccessStudent(session.user.id, id))) {
    redirect("/dashboard/teacher");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: { studentUser: { select: { firstName: true, lastName: true } } },
  });
  if (!student) notFound();

  const files = await prisma.teachingResource.findMany({
    where: {
      session: {
        registrations: { some: { studentId: id } },
        ...(session.user.role === "TEACHER" ? { teacherId: session.user.id } : {}),
      },
    },
    include: {
      session: { include: { course: { select: { title: true } } } },
      uploadedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F8F1" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-4xl font-bold text-gray-800">Student Files</h1><p className="mt-2 text-gray-500">Materials shared for {student.studentUser.firstName} {student.studentUser.lastName}&apos;s assigned sessions.</p></div>
          <Link href={`/students/${id}`} className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50">← Student Profile</Link>
        </div>
        {files.length === 0 ? <div className="rounded-3xl border bg-white p-10 text-center text-gray-500 shadow-sm">No session files are available for this student.</div> : (
          <div className="space-y-4">{files.map((file) => (
            <div key={file.id} className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-xl font-semibold">{file.title}</h2><p className="mt-1 text-gray-500">{file.session?.course.title ?? "Course material"} · {file.resourceType}</p><p className="mt-2 text-sm text-gray-500">Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName} on {file.createdAt.toLocaleDateString()}</p></div>
              <div className="flex gap-3"><a href={file.fileUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#4D9632] px-4 py-2 text-white">Open</a><a href={`${file.fileUrl}?download=${encodeURIComponent(file.title)}`} className="rounded-xl border px-4 py-2">Download</a></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
