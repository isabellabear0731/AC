"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function EditUserForm({
  user,
}: {
  user: User;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      `/api/admin/users/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      alert("User updated.");
      router.refresh();
    } else {
      alert("Update failed.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4"
    >
      <input
        className="w-full rounded border p-2"
        value={form.firstName}
        onChange={(e) =>
          setForm({
            ...form,
            firstName: e.target.value,
          })
        }
      />

      <input
        className="w-full rounded border p-2"
        value={form.lastName}
        onChange={(e) =>
          setForm({
            ...form,
            lastName: e.target.value,
          })
        }
      />

      <input
        className="w-full rounded border p-2"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <select
        className="w-full rounded border p-2"
        value={form.role}
        onChange={(e) =>
          setForm({
            ...form,
            role: e.target.value,
          })
        }
      >
        <option value="PARENT">
          Parent
        </option>

        <option value="STUDENT">
          Student
        </option>

        <option value="TEACHER">
          Teacher
        </option>

        <option value="ADMIN">
          Admin
        </option>
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm({
              ...form,
              isActive: e.target.checked,
            })
          }
        />

        Active
      </label>

      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        type="submit"
      >
        Save Changes
      </button>
    </form>
  );
}