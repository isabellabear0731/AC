import { prisma } from "@/lib/prisma";

export async function teacherCanAccessStudent(teacherId: string, studentId: string) {
  const registration = await prisma.registration.findFirst({
    where: { studentId, session: { teacherId } },
    select: { id: true },
  });
  return Boolean(registration);
}

export async function studentIsRegisteredForSession(studentId: string, sessionId: string) {
  const registration = await prisma.registration.findUnique({
    where: { studentId_sessionId: { studentId, sessionId } },
    select: { id: true },
  });
  return Boolean(registration);
}
