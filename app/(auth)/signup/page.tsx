"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth-shell";

type SignupRole = "PARENT" | "ADULT";

export default function SignupPage() {
  const [form, setForm] = useState({
    role: "PARENT" as SignupRole,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      }),
    });
    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to create account.");
      return;
    }

    window.location.href = "/login?signup=check-email";
  }

  const inputClasses =
    "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white";

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join The Gifted Center family."
      footer={
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#7AAACD]"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Account Type
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(event) =>
              setForm({
                ...form,
                role:
                  event.target.value === "ADULT"
                    ? "ADULT"
                    : "PARENT",
              })
            }
            className={inputClasses}
          >
            <option value="PARENT">
              Parent
            </option>
            <option value="ADULT">
              Adult
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) =>
                setForm({
                  ...form,
                  firstName: event.target.value,
                })
              }
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) =>
                setForm({
                  ...form,
                  lastName: event.target.value,
                })
              }
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) =>
              setForm({
                ...form,
                phone: event.target.value,
              })
            }
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            required
            className={inputClasses}
          />
          <p className="mt-1 text-xs text-gray-500">
            Use at least 8 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={form.confirmPassword}
            onChange={(event) =>
              setForm({
                ...form,
                confirmPassword: event.target.value,
              })
            }
            required
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{
            backgroundColor: "#7AAACD",
          }}
        >
          {isSubmitting
            ? "Creating Account..."
            : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}
