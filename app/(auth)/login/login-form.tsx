"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthShell from "@/components/auth-shell";

type Message = {
  text: string;
  tone: "success" | "error" | "info";
};

export default function LoginForm({
  initialMessage,
}: {
  initialMessage?: Message;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] =
    useState<Message | null>(initialMessage ?? null);
  const [showResend, setShowResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setShowResend(false);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.ok) {
      window.location.href = "/dashboard";
      return;
    }

    if (result?.error?.includes("EMAIL_NOT_VERIFIED")) {
      setMessage({
        text:
          "Your email address has not been verified yet. Check your inbox or request a new link.",
        tone: "info",
      });
      setShowResend(true);
      return;
    }

    setMessage({
      text: "Invalid email or password.",
      tone: "error",
    });
  }

  async function resendVerification() {
    if (!email) {
      setMessage({
        text: "Enter your email address first.",
        tone: "error",
      });
      return;
    }

    setIsResending(true);

    const response = await fetch(
      "/api/auth/resend-verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );
    const data = await response.json();

    setIsResending(false);
    setMessage({
      text:
        data.message ??
        data.error ??
        "Unable to request a verification email.",
      tone: response.ok ? "success" : "error",
    });
  }

  const messageClasses = {
    success:
      "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <AuthShell
      title="Log-In Portal"
      subtitle="Supporting Every Child’s Journey"
      footer={
        <div className="mt-6 space-y-3 text-center text-sm">
          <Link
            href="/forgot-password"
            className="block text-gray-500 hover:text-[#7AAACD]"
          >
            Forgot your password?
          </Link>
          <p className="text-gray-500">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#7AAACD]"
            >
              Sign up
            </Link>
          </p>
        </div>
      }
    >
      {message && (
        <div
          role="status"
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${messageClasses[message.tone]}`}
        >
          {message.text}

          {showResend && (
            <button
              type="button"
              onClick={resendVerification}
              disabled={isResending}
              className="mt-2 block font-semibold underline disabled:opacity-60"
            >
              {isResending
                ? "Sending..."
                : "Send a new verification email"}
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
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
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
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
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}
