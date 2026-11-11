import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import CategoryForm from "./category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const category = await prisma.courseCategory.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      color: true,
      sortOrder: true,
      isActive: true,
    },
  });

  if (!category) {
    notFound();
  }

  return <CategoryForm category={category} />;
}
