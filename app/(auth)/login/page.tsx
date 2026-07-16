import LoginForm from "./login-form";

type Message = {
  text: string;
  tone: "success" | "error" | "info";
};

function getMessage({
  verification,
  reset,
  signup,
}: {
  verification?: string;
  reset?: string;
  signup?: string;
}): Message | undefined {
  if (verification === "success") {
    return {
      text: "Your email is verified. You can sign in now.",
      tone: "success",
    };
  }

  if (verification === "expired") {
    return {
      text:
        "That verification link has expired. Sign in to request a new one.",
      tone: "error",
    };
  }

  if (verification === "invalid") {
    return {
      text:
        "That verification link is invalid or has already been used.",
      tone: "error",
    };
  }

  if (reset === "success") {
    return {
      text:
        "Your password has been reset. Sign in with your new password.",
      tone: "success",
    };
  }

  if (signup === "check-email") {
    return {
      text:
        "Your account was created. Check your email for a verification link before signing in.",
      tone: "info",
    };
  }

  return undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    verification?: string;
    reset?: string;
    signup?: string;
  }>;
}) {
  const query = await searchParams;

  return <LoginForm initialMessage={getMessage(query)} />;
}
