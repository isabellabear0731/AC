"use client";

import { useRouter } from "next/navigation";

export default function DeleteResourceButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function remove() {
    if (
      !confirm(
        "Delete this resource?"
      )
    ) {
      return;
    }

    const res =
      await fetch(
        `/api/resources/${id}`,
        {
          method: "DELETE",
        }
      );

    if (res.ok) {
      router.refresh();
    } else {
      alert(
        "Unable to delete."
      );
    }
  }

  return (
    <button
      onClick={remove}
      className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}