"use client";

import { useState } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function MessageForm({
  users,
}: {
  users: User[];
}) {
  const [receiverId, setReceiverId] =
    useState("");

  const [content, setContent] =
    useState("");

  async function sendMessage() {
    const res = await fetch(
      "/api/messages",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          receiverId,
          content,
        }),
      }
    );

    if (res.ok) {
      alert("Message sent!");
      setContent("");
    } else {
      alert("Failed to send.");
    }
  }

  return (
    <div className="space-y-4">
      <select
        className="w-full rounded border p-2"
        value={receiverId}
        onChange={(e) =>
          setReceiverId(e.target.value)
        }
      >
        <option value="">
          Select recipient
        </option>

        {users.map((u) => (
          <option
            key={u.id}
            value={u.id}
          >
            {u.firstName}{" "}
            {u.lastName} ({u.role})
          </option>
        ))}
      </select>

      <textarea
        className="w-full rounded border p-2"
        rows={6}
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        placeholder="Write your message..."
      />

      <button
        onClick={sendMessage}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Send Message
      </button>
    </div>
  );
}