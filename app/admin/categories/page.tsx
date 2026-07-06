import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CourseCategoriesPage() {
  const categories =
    await prisma.courseCategory.findMany({
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Course Categories
          </h1>

          <p className="mt-2 text-gray-500">
            Manage available course
            categories.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Add Category
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