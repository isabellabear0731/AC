"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CategoryCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#7AAACD");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error ?? "Unable to create category.");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (createError) {
      console.error("Unable to create course category", createError);
      setError("Unable to create category. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "#F8F8F3" }}>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-4xl font-bold text-gray-800">New Course Category</h1><p className="mt-2 text-gray-500">Create a reusable course category.</p></div>
          <Link href="/admin/categories" className="rounded-xl border bg-white px-5 py-2 transition hover:bg-gray-50">← Categories</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border bg-white p-8 shadow-sm">
          <div><label className="block text-sm font-medium text-gray-700" htmlFor="name">Category Name</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border p-3 focus:border-[#7AAACD] focus:outline-none" placeholder="Example: STEM" required maxLength={100} /></div>
          <div><label className="block text-sm font-medium text-gray-700" htmlFor="color">Display Color</label><div className="mt-2 flex items-center gap-4"><input id="color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-12 w-20 cursor-pointer rounded border" /><span className="text-gray-600">{color}</span></div><p className="mt-2 text-sm text-gray-500">Used for calendars and course labels.</p></div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex justify-end gap-3"><Link href="/admin/categories" className="rounded-xl border bg-white px-5 py-3 transition hover:bg-gray-50">Cancel</Link><button type="submit" disabled={saving} className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white transition hover:opacity-90 disabled:opacity-50">{saving ? "Saving..." : "Save Category"}</button></div>
        </form>
      </div>
    </div>
  );
}
