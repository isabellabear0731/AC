import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    verified?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const search = params.search ?? "";
  const role = params.role ?? "";
  const status = params.status ?? "";
  const verified = params.verified ?? "";

  const users = await prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(role
        ? {
            role: role as
              | "ADMIN"
              | "PARENT"
              | "TEACHER"
              | "STUDENT",
          }
        : {}),

      ...(status
        ? {
            isActive: status === "active",
          }
        : {}),

      ...(verified
        ? {
            emailVerified:
              verified === "verified",
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            User Management
          </h1>

          <p className="mt-2 text-gray-500">
            Manage all users in the system.
          </p>
        </div>

        <div className="flex gap-3">

          <Link
            href="/admin/users/new"
            className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white hover:opacity-90"
          >
            + New User
          </Link>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>

        </div>

      </div>

      {/* Filters */}

      <form
        className="mb-6 rounded-2xl border bg-white p-5"
      >
        <div className="grid gap-4 md:grid-cols-5">

          <input
            name="search"
            defaultValue={search}
            placeholder="Search..."
            className="rounded-xl border p-3"
          />

          <select
            name="role"
            defaultValue={role}
            className="rounded-xl border p-3"
          >
            <option value="">
              All Roles
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="PARENT">
              Parent
            </option>

            <option value="STUDENT">
              Student
            </option>

            <option value="TEACHER">
              Teacher
            </option>

          </select>

          <select
            name="status"
            defaultValue={status}
            className="rounded-xl border p-3"
          >
            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

          </select>

          <select
            name="verified"
            defaultValue={verified}
            className="rounded-xl border p-3"
          >
            <option value="">
              All Verification
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="pending">
              Pending
            </option>

          </select>

          <button
            className="rounded-xl bg-[#7AAACD] text-white"
          >
            Search
          </button>

        </div>
      </form>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <table className="w-full">

          <thead
            style={{
              background: "#EBEBCF",
            }}
          >
            <tr>

              <th className="px-6 py-4 text-left">
                Name
              </th>

              <th className="px-6 py-4 text-left">
                Email
              </th>

              <th className="px-6 py-4 text-left">
                Role
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-left">
                Verified
              </th>

              <th className="px-6 py-4 text-left">
                Created
              </th>

              <th className="px-6 py-4 text-center">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4 font-medium">
                  {user.firstName}{" "}
                  {user.lastName}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {user.email}
                </td>

                <td className="px-6 py-4">
                  <span
                    className="rounded-full px-3 py-1 text-sm"
                    style={{
                      background:
                        "#EBEBCF",
                    }}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4">

                  <span
                    className={
                      user.isActive
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </td>

                <td className="px-6 py-4">

                  <span
                    className={
                      user.emailVerified
                        ? "text-green-600 font-medium"
                        : "text-orange-600 font-medium"
                    }
                  >
                    {user.emailVerified
                      ? "Verified"
                      : "Pending"}
                  </span>

                </td>

                <td className="px-6 py-4 text-gray-500">
                  {user.createdAt.toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-center">

                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded-xl bg-[#7AAACD] px-4 py-2 text-white hover:opacity-90"
                  >
                    Edit
                  </Link>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
}