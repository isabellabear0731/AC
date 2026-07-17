"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm({
  sessionId,
}: {
  sessionId: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [resourceType, setResourceType] =
    useState("MATERIAL");

  const [visibleToStudent, setVisibleToStudent] =
    useState(true);

  const [visibleToParent, setVisibleToParent] =
    useState(true);

  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }
    
    const MAX_SIZE = 30 * 1024 * 1024; // 30 MB
    
    if (file.size > MAX_SIZE) {
      alert(
        "Files larger than 30 MB are not supported. Please compress the file or split it into multiple files before uploading."
      );
      return;
    }

    setUploading(true);

    try {

      // Upload file to Supabase through API

        const uploadData = new FormData();

        uploadData.append("file", file);

        uploadData.append(
          "resourceType",
          resourceType
        );

        const uploadResponse =
          await fetch(
            "/api/resources/upload",
            {
              method: "POST",
              body: uploadData,
            }
          );

        if (!uploadResponse.ok) {
          throw new Error("Upload failed.");
        }

        const uploaded =
          await uploadResponse.json();

      // Save database record

      const resourceResponse =
        await fetch(
          "/api/resources",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sessionId,
              title,
              description,
              fileUrl:
              uploaded.fileUrl,
            mimeType:
              uploaded.mimeType,
              resourceType,
              visibleToStudent,
              visibleToParent,
            }),
          }
        );

      if (!resourceResponse.ok) {
        throw new Error(
          "Failed to save resource."
        );
      }

      alert(
        "Resource uploaded successfully."
      );

      router.refresh();

      setTitle("");
      setDescription("");
      setFile(null);

    } catch (err) {
      console.error(err);

      alert(
        "Upload failed."
      );
    }

    setUploading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm"
    >

      <div>

        <label className="font-medium">
          Title
        </label>

        <input
          className="mt-2 w-full rounded-xl border p-3"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

      </div>

      <div>

        <label className="font-medium">
          Description
        </label>

        <textarea
          rows={4}
          className="mt-2 w-full rounded-xl border p-3"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

      </div>

      <div>

        <label className="font-medium">
          Resource Type
        </label>

        <select
          className="mt-2 w-full rounded-xl border p-3"
          value={resourceType}
          onChange={(e) =>
            setResourceType(
              e.target.value
            )
          }
        >
          <option value="MATERIAL">
            Learning Material
          </option>

          <option value="PHOTO">
            Class Photo
          </option>

          <option value="EVALUATION">
            Parent Evaluation
          </option>

        </select>

      </div>

      <div>

        <label className="font-medium">
          Choose File
        </label>

        <input
          type="file"
          className="mt-2 block w-full"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ??
              null
            )
          }
          required
        />

        {file && (

          <p className="mt-2 text-sm text-gray-500">
            Selected:
            {" "}
            {file.name}
          </p>

        )}

      </div>

      <div className="space-y-3">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={
              visibleToStudent
            }
            onChange={(e) =>
              setVisibleToStudent(
                e.target.checked
              )
            }
          />

          Visible to Students

        </label>

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={
              visibleToParent
            }
            onChange={(e) =>
              setVisibleToParent(
                e.target.checked
              )
            }
          />

          Visible to Parents

        </label>

      </div>

      <button
        type="submit"
        disabled={uploading}
        className="rounded-xl bg-[#7AAACD] px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
      >
        {uploading
          ? "Uploading..."
          : "Upload Resource"}
      </button>

    </form>
  );
}