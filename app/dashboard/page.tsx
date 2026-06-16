import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");

    case "PARENT":
      redirect("/dashboard/parent");

    case "TEACHER":
      redirect("/dashboard/teacher");

    case "STUDENT":
      redirect("/dashboard/student");

    default:
      redirect("/login");
  }
}