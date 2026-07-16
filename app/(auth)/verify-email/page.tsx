import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
  }>;
}) {
  const { token } = await searchParams;
  const verificationToken =
    typeof token === "string" ? token : "";

  redirect(
    `/api/auth/verify-email?token=${encodeURIComponent(
      verificationToken
    )}`
  );
}
