import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const body = await req.json();

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      isActive: body.isActive,
    },
  });

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  // Prevent deleting yourself

  if (session.user.id === id) {
    return NextResponse.json(
      {
        error: "You cannot delete your own account.",
      },
      {
        status: 400,
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      children: true,
      studentProfile: true,
      teachingSessions: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        error: "User not found.",
      },
      {
        status: 404,
      }
    );
  }

  // Parent safety

  if (
    user.role === "PARENT" &&
    user.children.length > 0
  ) {
    return NextResponse.json(
      {
        error:
          "Cannot delete a parent with linked students.",
      },
      {
        status: 400,
      }
    );
  }

  // Teacher safety

  if (
    user.role === "TEACHER" &&
    user.teachingSessions.length > 0
  ) {
    return NextResponse.json(
      {
        error:
          "Remove assigned sessions before deleting this teacher.",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Messages

    await tx.message.deleteMany({
      where: {
        OR: [
          {
            senderId: id,
          },
          {
            receiverId: id,
          },
        ],
      },
    });

    // Notifications

    await tx.notification.deleteMany({
      where: {
        userId: id,
      },
    });

    // Uploaded Resources

    await tx.teachingResource.deleteMany({
      where: {
        uploadedById: id,
      },
    });

    // Attendance edits

    await tx.attendance.updateMany({
      where: {
        editedById: id,
      },

      data: {
        editedById: null,
      },
    });

    // Student-specific cleanup

    if (user.studentProfile) {
      await tx.teacherComment.deleteMany({
        where: {
          studentId: user.studentProfile.id,
        },
      });

      await tx.attendance.deleteMany({
        where: {
          studentId: user.studentProfile.id,
        },
      });

      await tx.registration.deleteMany({
        where: {
          studentId: user.studentProfile.id,
        },
      });

      await tx.studentProfile.delete({
        where: {
          id: user.studentProfile.id,
        },
      });
    }

    // Finally delete user

    await tx.user.delete({
      where: {
        id,
      },
    });
  });

  return NextResponse.json({
    success: true,
  });
}