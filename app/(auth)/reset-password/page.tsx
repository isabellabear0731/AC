import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
  }>;
}) {
  const { token } = await searchParams;
  const resetToken =
    typeof token === "string" ? token : "";

  return <ResetPasswordForm token={resetToken} />;
}
