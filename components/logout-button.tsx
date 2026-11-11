"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl bg-[#4d9632] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#36721f]"
    >
      Logout
    </button>
  );
}
