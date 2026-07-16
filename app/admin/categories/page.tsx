import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CourseCategoriesPage() {
  const categories =
  await prisma.courseCategory.findMany({
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return (
    <div className="mb-8 flex items-center justify-between">

      <div>
        <h1 className="text-4xl font-bold">
          Course Categories
        </h1>

        <p className="mt-2 text-gray-500">
          Organize courses into reusable categories.
        </p>
      </div>

      <div className="flex gap-3">

        <Link
          href="/admin/categories/new"
          className="rounded-xl bg-[#7AAACD] px-5 py-2 text-white"
        >
          + New Category
        </Link>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border bg-white px-5 py-2"
        >
          ← Dashboard
        </Link>

      </div>

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Color
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                  Courses
              </th>

              <th className="p-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map(
              (category) => (
                <tr
                  key={category.id}
                  className="border-b"
                >
                  <td className="p-4">
                    {category.name}
                  </td>
                  <td className="p-4">
                      {category._count.courses}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{
                          background:
                            category.color ??
                            "#ccc",
                        }}
                      />

                      {category.color ??
                        "None"}
                    </div>
                  </td>

                  <td className="p-4">
                    {category.isActive
                      ? "Active"
                      : "Inactive"}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="text-blue-600"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
