"use client";

import { useState } from "react";

export default function AttendanceNotes({
  studentId,
  sessionId,
  arrival,
  departure,
}: {
  studentId: string;
  sessionId: string;
  arrival?: string | null;
  departure?: string | null;
}) {
  const [arrivalNote, setArrivalNote] =
    useState(arrival ?? "");

  const [departureNote, setDepartureNote] =
    useState(departure ?? "");

  async function saveNotes() {
    const res = await fetch(
      "/api/attendance/notes",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          studentId,
          sessionId,
          arrivalNote,
          departureNote,
        }),
      }
    );

    if (res.ok) {
      alert("Saved");
      window.location.reload();
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <textarea
        className="w-full rounded border p-2"
        placeholder="Arrival note"
        value={arrivalNote}
        onChange={(e) =>
          setArrivalNote(
            e.target.value
          )
        }
      />

      <textarea
        className="w-full rounded border p-2"
        placeholder="Departure note"
        value={departureNote}
        onChange={(e) =>
          setDepartureNote(
            e.target.value
          )
        }
      />

      <button
        onClick={saveNotes}
        className="rounded bg-gray-700 px-3 py-1 text-white"
      >
        Save Notes
      </button>
    </div>
  );
}