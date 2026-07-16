"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Parent = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function UserCreateForm() {
  const router = useRouter();

  const [parents, setParents] = useState<Parent[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "PARENT",
    parentId: "",
  });

  useEffect(() => {
    async function loadParents() {
      const res = await fetch("/api/users?role=PARENT&active=true");

      if (res.ok) {
        setParents(await res.json());
      }
    }

    loadParents();
  }, []);

  async function createUser(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/admin/users",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      alert("User created.");

      router.push("/admin/users");
      router.refresh();
    } else {
      const data = await res.json();

      alert(data.error);
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: "#F8F8F3",
      }}
    >
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">

        <h1 className="mb-8 text-4xl font-bold">
          Create User
        </h1>

        <form
          onSubmit={createUser}
          className="space-y-5"
        >

          <input
            className="w-full rounded-xl border p-3"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) =>
              setForm({
                ...form,
                firstName:
                  e.target.value,
              })
            }
            required
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) =>
              setForm({
                ...form,
                lastName:
                  e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            className="w-full rounded-xl border p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
            required
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone:
                  e.target.value,
              })
            }
          />

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            placeholder="Temporary Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password:
                  e.target.value,
              })
            }
            required
          />

          <select
            className="w-full rounded-xl border p-3"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role:
                  e.target.value,
                parentId: "",
              })
            }
          >
            <option value="PARENT">
              Parent
            </option>

            <option value="STUDENT">
              Student
            </option>

            <option value="TEACHER">
              Teacher
            </option>

            <option value="ADMIN">
              Admin
            </option>

          </select>

          {form.role ===
            "STUDENT" && (
            <select
              className="w-full rounded-xl border p-3"
              value={form.parentId}
              onChange={(e) =>
                setForm({
                  ...form,
                  parentId:
                    e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Parent
              </option>

              {parents.map(
                (parent) => (
                  <option
                    key={parent.id}
                    value={parent.id}
                  >
                    {parent.firstName}{" "}
                    {parent.lastName}
                  </option>
                )
              )}

            </select>
          )}

          <button
            className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white"
          >
            Create User
          </button>

        </form>

      </div>
    </div>
  );
}