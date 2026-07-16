"use client";

export default function AttendanceButtons({
  studentId,
  sessionId,
}: {
  studentId: string;
  sessionId: string;
}) {
  async function markAttendance(
    status:
      | "PENDING"
      | "PRESENT"
      | "LATE"
      | "EXCUSED_ABSENT"
      | "UNEXCUSED_ABSENT"
  ) {
    const res = await fetch(
      "/api/attendance",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          studentId,
          sessionId,
          status,
        }),
      }
    );

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Failed");
    }


  }
  
  async function markCheck(
    type: "checkin" | "checkout"
  ) {
    const res = await fetch(
      "/api/attendance/check",
      {
        method: "POST",
  
        headers: {
          "Content-Type":
            "application/json",
        },
  
        body: JSON.stringify({
          studentId,
          sessionId,
          type,
        }),
      }
    );
  
    if (res.ok) {
      window.location.reload();
    }
  }

  return (
    <div className="mt-5 space-y-4">

    <div className="flex flex-wrap gap-2">

      <button
        onClick={() =>
          markAttendance("PRESENT")
        }
        className="rounded bg-green-600 px-3 py-1 text-white"
      >
        Present
      </button>

      <button
        onClick={() =>
          markAttendance("EXCUSED_ABSENT")
        }
        className="rounded bg-red-600 px-3 py-1 text-white"
      >
        Excused Absent
      </button>

      <button
        onClick={() =>
          markAttendance("UNEXCUSED_ABSENT")
        }
        className="rounded bg-red-700 px-3 py-1 text-white"
      >
        Unexcused Absent
      </button>

      <button
        onClick={() =>
          markAttendance("LATE")
        }
        className="rounded bg-yellow-600 px-3 py-1 text-white"
      >
        Late
      </button>

      <button
        onClick={() =>
          markAttendance("PENDING")
        }
        className="rounded bg-gray-600 px-3 py-1 text-white"
      >
        Pending
      </button>
      </div>

      <div className="flex flex-wrap gap-2">

      <button
        onClick={() =>
          markCheck("checkin")
        }
        className="rounded bg-blue-600 px-3 py-1 text-white"
      >
        Check In
      </button>

      <button
        onClick={() =>
          markCheck("checkout")
        }
        className="rounded bg-purple-600 px-3 py-1 text-white"
      >
        Check Out
      </button>
      </div>
    </div>
  );
}
