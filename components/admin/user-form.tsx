"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
};

export default function UserForm({
  user,
}: {
  user: User;
}) {
  const router = useRouter();

  const [form, setForm] = useState(user);

  async function save() {
    const res = await fetch(
      `/api/admin/users/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          isActive: form.isActive,
        }),
      }
    );

    if (res.ok) {
      alert("User updated.");
      router.refresh();
    } else {
      alert("Update failed.");
    }
  }

  async function remove() {
    const confirmed = confirm(
      "Delete this account?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    const res = await fetch(
      `/api/admin/users/${user.id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (res.ok) {
      router.push("/admin/users");
      router.refresh();
    } else {
      alert(data.error ?? "Delete failed.");
    }
  }

  return (
    <div className="space-y-8">

      {/* Basic Information */}

      <div className="space-y-5">

        <div>
          <label className="mb-1 block text-sm font-medium">
            First Name
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={form.firstName}
            onChange={(e) =>
              setForm({
                ...form,
                firstName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Last Name
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={form.lastName}
            onChange={(e) =>
              setForm({
                ...form,
                lastName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            disabled
            className="w-full rounded-xl border bg-gray-100 p-3 text-gray-500"
            value={form.email}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Phone
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={form.phone ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />
        </div>

      </div>

      {/* Account */}

      <div className="rounded-2xl border bg-gray-50 p-6 space-y-5">

        <h2 className="text-xl font-semibold">
          Account Information
        </h2>

        <div>

          <label className="mb-1 block text-sm font-medium">
            Role
          </label>

          <input
            disabled
            value={form.role}
            className="w-full rounded-xl border bg-gray-100 p-3 font-medium"
          />

        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white p-4">

          <div>

            <p className="font-medium">
              Account Status
            </p>

            <p className="text-sm text-gray-500">
              Disable login without deleting data.
            </p>

          </div>

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

        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white p-4">

          <div>

            <p className="font-medium">
              Email Verification
            </p>

            <p className="text-sm text-gray-500">
              Current verification status
            </p>

          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              form.emailVerified
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {form.emailVerified
              ? "Verified"
              : "Pending"}
          </span>

        </div>

      </div>

      {/* Future Admin Actions */}

      <div className="rounded-2xl border p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Account Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <button
            disabled
            className="rounded-xl border bg-gray-100 px-5 py-2 text-gray-500"
          >
            Reset Password
          </button>

          {!form.emailVerified && (
            <button
              disabled
              className="rounded-xl border bg-gray-100 px-5 py-2 text-gray-500"
            >
              Resend Verification
            </button>
          )}

        </div>

        <p className="mt-3 text-sm text-gray-500">
          These actions will be enabled in the next update.
        </p>

      </div>

      {/* Bottom Buttons */}

      <div className="flex gap-4">

        <button
          onClick={save}
          className="rounded-xl bg-[#7AAACD] px-6 py-3 font-medium text-white hover:opacity-90"
        >
          Save Changes
        </button>

        <button
          onClick={remove}
          className="rounded-xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
        >
          Delete Account
        </button>

      </div>

    </div>
  );
}