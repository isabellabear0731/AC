"use client";

import { useState } from "react";

export default function RegisterForm({
  sessionId,
  students,
  isAdult,
}: {
  sessionId: string;

  students: {
    id: string;

    studentUser: {
      firstName: string;
      lastName: string;
    };
  }[];

  isAdult: boolean;
}) {
  const adultProfile =
    isAdult
      ? students[0] ?? null
      : null;

  const [studentId, setStudentId] =
    useState(
      adultProfile?.id ?? ""
    );

  async function register() {
    const payload =
      isAdult
        ? { sessionId }
        : {
            studentId,
            sessionId,
          };

    const res = await fetch(
      "/api/registrations",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
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
          "Session is currently full.\n\nYou have been added to the waitlist."
        );
      } else {
        alert(
          "Registration submitted successfully. Pending approval."
        );
      }
    } else {
      const data =
        await res.json();

      alert(
        data.error ??
          "Registration failed."
      );
    }
  }

  return (
    <div className="space-y-4">

      {!isAdult && (
        students.length === 0 ? (
          <div className="rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
            No child profiles are linked to your parent account yet.
            Please contact the center before registering.
          </div>
        ) : (
          <select
            className="w-full rounded-xl border p-3"
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

            {students.map((child) => (
              <option
                key={child.id}
                value={child.id}
              >
                {child.studentUser.firstName}{" "}
                {child.studentUser.lastName}
              </option>
            ))}
          </select>
        )
      )}

      {isAdult &&
        adultProfile && (
          <div className="rounded-xl border bg-gray-50 p-4">

            <p className="text-sm text-gray-500">
              Registering as
            </p>

            <p className="mt-1 font-semibold">
              {adultProfile.studentUser.firstName}{" "}
              {adultProfile.studentUser.lastName}
            </p>

          </div>
      )}

      {isAdult &&
        !adultProfile && (
          <div className="rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
            Your learner profile has not been created yet.
            Please contact the center before registering for a course.
          </div>
      )}

      <button
        onClick={register}
        disabled={!studentId}
        className="rounded-xl bg-[#4d9632] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#36721f] disabled:opacity-50"
      >
        Confirm Registration
      </button>

    </div>
  );
}
