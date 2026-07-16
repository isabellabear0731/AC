import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegisterForm from "@/components/register-form";

export default async function PortalRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "PARENT" &&
    session.user.role !== "ADULT"
  ) {
    redirect("/portal/courses");
  }

  const { id } = await params;

  const courseSession =
    await prisma.courseSession.findUnique({
      where: {
        id,
      },

      include: {
        course: true,
        teacher: true,
      },
    });

  if (!courseSession) {
    notFound();
  }

  let students: Array<{
    id: string;
    studentUser: {
      firstName: string;
      lastName: string;
    };
  }> = [];

  if (session.user.role === "PARENT") {
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

    students =
      parent?.children ?? [];
  }

  if (session.user.role === "ADULT") {
    const profile =
      await prisma.studentProfile.findUnique({
        where: {
          studentUserId:
            session.user.id,
        },

        include: {
          studentUser: true,
        },
      });

    if (profile) {
      students = [profile];
    }
  }

  return (
    <div className="mx-auto max-w-3xl">

      <h1 className="text-4xl font-bold">
        Register
      </h1>

      <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-semibold">
          {courseSession.course.title}
        </h2>

        <div className="mt-6 space-y-2 text-gray-600">

          <p>
            <strong>Time:</strong>{" "}
            {courseSession.startTime.toLocaleString()}
          </p>

          <p>
            <strong>Room:</strong>{" "}
            {courseSession.room ??
              "TBD"}
          </p>

          <p>
            <strong>Teacher:</strong>{" "}
            {courseSession.teacher
              ? `${courseSession.teacher.firstName} ${courseSession.teacher.lastName}`
              : "TBD"}
          </p>

          <p>
            <strong>Price:</strong>{" "}
            ${courseSession.course.price}
          </p>

        </div>

      </div>

      <div className="mt-8">

        <RegisterForm
          sessionId={courseSession.id}
          students={students}
          isAdult={
            session.user.role ===
            "ADULT"
          }
        />

      </div>

    </div>
  );
}