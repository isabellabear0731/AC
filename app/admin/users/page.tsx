import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        User Management
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">
                  {user.firstName} {user.lastName}
                </td>

                <td className="border p-2">
                  {user.email}
                </td>

                <td className="border p-2">
                  {user.role}
                </td>

                <td className="border p-2">
                  {user.isActive
                    ? "✅ Active"
                    : "⏳ Inactive"}
                </td>

                <td className="border p-2 space-x-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded bg-blue-600 px-3 py-1 text-white"
                  >
                    Edit
                  </Link>

                  {user.isActive ? (
                    <form
                      action={`/api/admin/users/${user.id}/deactivate`}
                      method="POST"
                      className="inline"
                    >
                      <button className="rounded bg-red-600 px-3 py-1 text-white">
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form
                      action={`/api/admin/users/${user.id}/activate`}
                      method="POST"
                      className="inline"
                    >
                      <button className="rounded bg-green-600 px-3 py-1 text-white">
                        Activate
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}