"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
};

export default function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  const router = useRouter();

  const [expanded, setExpanded] =
    useState(false);

  const [isRead, setIsRead] =
    useState(notification.isRead);

  const [loading, setLoading] =
    useState(false);

  async function toggle() {
    const nextExpanded =
      !expanded;

    setExpanded(nextExpanded);

    if (
      nextExpanded &&
      !isRead &&
      !loading
    ) {
      setLoading(true);

      try {
        const res =
          await fetch(
            `/api/notifications/${notification.id}/read`,
            {
              method: "POST",
            }
          );

        if (res.ok) {
          setIsRead(true);

          router.refresh();
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div
      className={`rounded-3xl border shadow-[0_8px_20px_rgba(21,60,42,0.05)] transition-all ${
        isRead
          ? "bg-white"
          : "border-[#b9d5a9] bg-[#f7fbf2]"
      }`}
    >
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-3 ${
              isRead
                ? "bg-gray-100"
                : "bg-[#e0efd6]"
            }`}
          >
            <Bell
              className={`h-5 w-5 ${
                isRead
                ? "text-gray-600"
                : "text-[#36721f]"
              }`}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {notification.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {new Date(
                notification.createdAt
              ).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRead && (
            <span className="rounded-full bg-[#4d9632] px-3 py-1 text-xs font-semibold text-white">
              NEW
            </span>
          )}

          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-6 py-5">
          <p className="whitespace-pre-wrap text-gray-700">
            {notification.message}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-gray-500">
                Type
              </p>

              <p className="mt-1 font-medium">
                {notification.type}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">
                Status
              </p>

              <p className="mt-1 font-medium">
                {isRead
                  ? "Read"
                  : "Unread"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">
                Created
              </p>

              <p className="mt-1 font-medium">
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
