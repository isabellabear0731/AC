"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/courses");
      router.refresh();
    } else {
      alert("Failed to create course");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Create Course
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          className="w-full border p-2 rounded"
          placeholder="Course Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          required
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <select
          className="w-full border p-2 rounded"
          value={form.categoryId}
          onChange={(e) =>
            setForm({
              ...form,
              categoryId: e.target.value,
            })
          }
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
          required
        />

        <input
          type="number"
          min={1}
          className="w-full border p-2 rounded"
          placeholder="Maximum students"
          value={form.capacity}
          onChange={(e) =>
            setForm({
              ...form,
              capacity: e.target.value,
            })
          }
        />


        <input
          className="w-full border p-2 rounded"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({
              ...form,
              location: e.target.value,
            })
          }
        />

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          type="submit"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}
