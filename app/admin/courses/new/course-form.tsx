"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage({
  categories,
}: {
  categories: Array<{
    id: string;
    name: string;
  }>;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    location: "",
    capacity: "",
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/courses",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      router.push("/admin/courses");
      router.refresh();
    } else {
      const error =
        await res.json();

      alert(
        error.error ??
          "Failed to create course."
      );
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Create Course
            </h1>

            <p className="mt-2 text-gray-500">
              Add a new course to the center.
            </p>
          </div>

          <Link
            href="/admin/courses"
            className="rounded-xl border bg-white px-5 py-2 hover:bg-gray-50"
          >
            ← Courses
          </Link>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm"
        >

          <div>

            <label className="block font-medium">
              Course Title
            </label>

            <input
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="STEM Foundations"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              required
            />

          </div>

          <div>

            <label className="block font-medium">
              Description
            </label>

            <textarea
              rows={4}
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="Course description..."
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

          </div>

          <div>

            <label className="block font-medium">
              Category
            </label>

            <select
              className="mt-2 w-full rounded-xl border p-3"
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId:
                    e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>

              <label className="block font-medium">
                Price ($)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-2 w-full rounded-xl border p-3"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value,
                  })
                }
                required
              />

            </div>

            <div>

              <label className="block font-medium">
                Maximum Capacity
              </label>

              <input
                type="number"
                min={1}
                className="mt-2 w-full rounded-xl border p-3"
                value={form.capacity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div>

            <label className="block font-medium">
              Location
            </label>

            <input
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="Room A101"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="flex justify-end gap-3">

            <Link
              href="/admin/courses"
              className="rounded-xl border bg-white px-5 py-3 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              className="rounded-xl px-6 py-3 text-white transition hover:opacity-90"
              style={{
                background: "#7AAACD",
              }}
            >
              Create Course
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}