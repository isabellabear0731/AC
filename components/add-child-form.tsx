"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddChildForm() {
  const router = useRouter();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function submit() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/children",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            phone,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(
          data.error ??
            "Unable to create child."
        );
        return;
      }

      alert(
        "Child added successfully."
      );

      router.push(
        "/parent/children"
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">
            First Name *
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={firstName}
            onChange={(e) =>
              setFirstName(
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Last Name *
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={lastName}
            onChange={(e) =>
              setLastName(
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Student Email *
          </label>

          <input
            type="email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Temporary Password *
          </label>

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <p className="mt-2 text-sm text-gray-500">
            The student can change this
            after their first login.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">
            Phone
          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white disabled:opacity-50"
      >
        {loading
          ? "Creating..."
          : "Create Child"}
      </button>
    </div>
  );
}