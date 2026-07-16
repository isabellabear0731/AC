"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/auth-shell";

export default function ResetPasswordForm({
  token,
}: {
  token: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(
      "/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      }
    );
    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Unable to reset password.");
      return;
    }

    window.location.href = "/login?reset=success";
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Choose a new password for your account."
      footer={
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-[#7AAACD]"
          >
            Back to sign in
          </Link>
        </div>
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
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
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
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{
            backgroundColor: "#7AAACD",
          }}
        >
          {isSubmitting
            ? "Resetting Password..."
            : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
}
