import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPortalContext() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "PARENT" &&
    session.user.role !== "STUDENT" &&
    session.user.role !== "ADULT"
  ) {
    redirect("/dashboard");
  }

  const user =
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

  if (!user) {
    redirect("/login");
  }

  let selectedStudent = null;

  if (session.user.role === "PARENT") {
    selectedStudent =
      user.children[0] ?? null;
  } else {
    selectedStudent =
      await prisma.studentProfile.findUnique({
        where: {
          studentUserId:
            user.id,
        },

        include: {
          studentUser: true,
        },
      });
  }

  return {
    session,
    user,

    role: session.user.role,

    children:
      user.children,

    selectedStudent,
  };
}