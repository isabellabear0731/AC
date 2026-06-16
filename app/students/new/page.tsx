"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewStudentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    notes: "",
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const res = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create student");
      return;
    }

    alert("Student created successfully!");

    router.push("/dashboard/parent");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Add Child
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          className="w-full border rounded p-2"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) =>
            setForm({
              ...form,
              firstName: e.target.value,
            })
          }
          required
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) =>
            setForm({
              ...form,
              lastName: e.target.value,
            })
          }
          required
        />

        <input
          type="email"
          className="w-full border rounded p-2"
          placeholder="Student Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          className="w-full border rounded p-2"
          placeholder="Temporary Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.dateOfBirth}
          onChange={(e) =>
            setForm({
              ...form,
              dateOfBirth: e.target.value,
            })
          }
        />

        <textarea
          className="w-full border rounded p-2"
          placeholder="Notes"
          rows={4}
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
        />

        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          type="submit"
        >
          Create Student
        </button>
      </form>
    </div>
  );
}