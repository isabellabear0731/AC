"use client";

import { useState } from "react";

export default function RegisterForm({
  sessionId,
  children,
}: {
  sessionId: string;

  children: {
    id: string;

    studentUser: {
      firstName: string;
      lastName: string;
    };
  }[];
}) {
  const [studentId, setStudentId] =
    useState("");

  async function register() {
    const res = await fetch(
      "/api/registrations",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          studentId,
          sessionId,
        }),
      }
    );

    if (res.ok) {
  const data =
    await res.json();

  if (
    data.status ===
    "WAITLISTED"
  ) {
    alert(
      "Session full. Added to waitlist."
    );
  } else {
    alert(
      "Registration submitted!"
    );
  }
} else {
      const data =
        await res.json();

      alert(
        data.error ??
          "Registration failed"
      );
    }
  }

  return (
    <div className="space-y-4">
      <select
        className="w-full rounded border p-2"
        value={studentId}
        onChange={(e) =>
          setStudentId(
            e.target.value
          )
        }
      >
        <option value="">
          Select Child
        </option>

        {children.map((child) => (
          <option
            key={child.id}
            value={child.id}
          >
            {
              child.studentUser
                .firstName
            }{" "}
            {
              child.studentUser
                .lastName
            }
          </option>
        ))}
      </select>

      <button
        onClick={register}
        disabled={!studentId}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Confirm Registration
      </button>
    </div>
  );
}