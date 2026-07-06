"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const result = await signIn(
      "credentials",
      {
        email,
        password,
        redirect: false,
      }
    );

    if (result?.ok) {
      window.location.href =
        "/dashboard";
    } else {
      alert(
        "Invalid email or password."
      );
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{
        backgroundColor: "#EBEBCF",
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
        <div className="mb-8 text-center">
          {/* Replace with your logo later */}
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{
              backgroundColor:
                "#7AAACD",
            }}
          >
            GC
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Log-In Portal
          </h1>

          <p className="mt-2 text-gray-500">
            Supporting Every Child&apos;s
            Journey
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#7AAACD] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90"
            style={{
              backgroundColor:
                "#7AAACD",
            }}
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-[#7AAACD]"
          >
            Forgot your password?
          </a>
        </div>

        <div className="mt-10 border-t pt-5 text-center text-xs text-gray-400">
          © 2026 The Gifted Center
        </div>
      </div>
    </div>
  );
}
