"use client";

import { useRef, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const uploadId = useRef<string | null>(null);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Please select a file.");
      return;
    }
    
    const MAX_SIZE = 30 * 1024 * 1024; // 30 MB
    
    if (file.size > MAX_SIZE) {
      setError("Files larger than 30 MB are not supported. Please compress the file or split it before uploading.");
      return;
    }

    setUploading(true);
    uploadId.current ??= crypto.randomUUID();

    try {

      // Upload file to Supabase through API

        const uploadData = new FormData();

        uploadData.append("file", file);

        uploadData.append(
          "resourceType",
          resourceType
        );
        uploadData.append("sessionId", sessionId);
        uploadData.append("uploadId", uploadId.current);

        const uploadResponse =
          await fetch(
            "/api/resources/upload",
            {
              method: "POST",
              body: uploadData,
            }
          );

        if (!uploadResponse.ok) {
          const payload = await uploadResponse.json().catch(() => null);
          throw new Error(payload?.error ?? "Upload failed.");
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
        const payload = await resourceResponse.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to save resource.");
      }

      setSuccess("Resource uploaded successfully.");

      router.refresh();

      setTitle("");
      setDescription("");
      setFile(null);
      uploadId.current = null;

    } catch (err) {
      console.error("Teaching resource upload failed", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
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

      <div aria-live="polite">
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{success}</p>}
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
