"use client";

import { usePortal } from "./PortalProvider";

export default function StudentSelector() {
  const portal =
    usePortal();

  if (
    portal.role !== "PARENT"
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border bg-white p-4">

      <label className="block text-sm font-medium text-gray-600">
        Current Child
      </label>

      <select
        className="mt-2 w-full rounded-xl border p-2"
        defaultValue={
          portal.selectedStudentId ??
          ""
        }
      >
        {portal.children.map(
          (child) => (
            <option
              key={child.id}
              value={child.id}
            >
              {child.studentUser.firstName}{" "}
              {child.studentUser.lastName}
            </option>
          )
        )}
      </select>

    </div>
  );
}