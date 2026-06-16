import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegisterForm from "@/components/register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "PARENT") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const courseSession =
    await prisma.courseSession.findUnique({
      where: {
        id,
      },

      include: {
        course: true,
      },
    });

  if (!courseSession) {
    notFound();
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
          },
        },
      },
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Register for Course
      </h1>

      <div className="mt-4 rounded border p-4">
        <h2 className="text-xl font-semibold">
          {courseSession.course.title}
        </h2>

        <p>
          {courseSession.startTime.toLocaleString()}
        </p>

        <p>
          Room:{" "}
          {courseSession.room ?? "TBD"}
        </p>
      </div>

      <div className="mt-6">
        <RegisterForm
          sessionId={courseSession.id}
          children={
            parent?.children ?? []
          }
        />
      </div>
    </div>
  );
}