"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [color, setColor] =
    useState("#7AAACD");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await fetch(
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

    router.push(
      "/admin/categories"
    );
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        New Course Category
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-6"
      >
        <div>
          <label>
            Category Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="mt-2 w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label>Color</label>

          <input
            type="color"
            value={color}
            onChange={(e) =>
              setColor(
                e.target.value
              )
            }
            className="mt-2 h-10 w-20"
          />
        </div>

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Save Category
        </button>
      </form>
    </div>
  );
}