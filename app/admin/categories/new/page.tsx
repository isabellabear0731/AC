"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#7AAACD");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/categories",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          color,
        }),
      }
    );

    if (res.ok) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      alert("Failed to create category.");
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mx-auto max-w-xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              New Course Category
            </h1>

            <p className="mt-2 text-gray-500">
              Create a reusable course category.
            </p>
          </div>

          <Link
            href="/admin/categories"
            className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
          >
            ← Categories
          </Link>

        </div>

        {/* Form Card */}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border bg-white p-8 shadow-sm space-y-6"
        >

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="mt-2 w-full rounded-xl border p-3 focus:border-[#7AAACD] focus:outline-none"
              placeholder="Example: STEM"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Color
            </label>

            <div className="mt-2 flex items-center gap-4">

              <input
                type="color"
                value={color}
                onChange={(e) =>
                  setColor(e.target.value)
                }
                className="h-12 w-20 cursor-pointer rounded border"
              />

              <span className="text-gray-600">
                {color}
              </span>

            </div>

            <p className="mt-2 text-sm text-gray-500">
              Used for calendars and course labels.
            </p>
          </div>

          <div className="flex justify-end gap-3">

            <Link
              href="/admin/categories"
              className="rounded-xl border bg-white px-5 py-3 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl px-6 py-3 text-white transition hover:opacity-90"
              style={{
                background: "#7AAACD",
              }}
            >
              Save Category
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}