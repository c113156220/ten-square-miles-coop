import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { SiteShell, PageHeader } from "@/components/site-shell";

const verifySearchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify email · 信箱驗證" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: verifySearchSchema,
  component: VerifyPage,
});

function VerifyPage() {
  const { token } = useSearch({ from: "/verify" });
  const { verifyToken } = useAuth();
  const [state, setState] = useState<"pending" | "ok" | "fail">("pending");

  useEffect(() => {
    if (!token) {
      setState("fail");
      return;
    }
    setState(verifyToken(token) ? "ok" : "fail");
  }, [token, verifyToken]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Verify / 驗證"
        title={state === "ok" ? "Email verified" : state === "fail" ? "Link invalid" : "Verifying…"}
        body={
          state === "ok"
            ? "感謝驗證！您現在可以完整使用平台。"
            : state === "fail"
              ? "This verification link is invalid or already used. Please resend from your account."
              : "Please wait a moment…"
        }
      />
      <Link
        to="/"
        className="inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
      >
        Continue to shop →
      </Link>
    </SiteShell>
  );
}
