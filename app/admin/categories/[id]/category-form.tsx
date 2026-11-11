"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function CategoryForm({
  category,
}: {
  category: Category;
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color ?? "#7AAACD");
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [isActive, setIsActive] = useState(category.isActive);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color,
          sortOrder: Number(sortOrder),
          isActive,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "Unable to update the category.");
        return;
      }

      setSuccess("Category updated successfully.");
      router.refresh();
    } catch (updateError) {
      console.error("Unable to update course category", updateError);
      setError("Unable to update the category. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F8F1" }}>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Edit Course Category</h1>
            <p className="mt-2 text-gray-500">Update how this category is shown in course management.</p>
          </div>

          <Link
            href="/admin/categories"
            className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50"
          >
            ← Categories
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="category-name">
              Category Name
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border p-3 focus:border-[#4D9632] focus:outline-none"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="category-color">
              Display Color
            </label>
            <div className="mt-2 flex items-center gap-4">
              <input
                id="category-color"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-12 w-20 cursor-pointer rounded border"
              />
              <span className="text-gray-600">{color}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="category-sort-order">
              Sort Order
            </label>
            <input
              id="category-sort-order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="mt-2 w-full rounded-xl border p-3 focus:border-[#4D9632] focus:outline-none"
              required
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active and available for new courses
          </label>

          <div aria-live="polite">
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/admin/categories" className="rounded-xl border bg-white px-5 py-3 transition hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#4D9632] px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
