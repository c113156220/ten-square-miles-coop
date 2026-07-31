import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const registerSearchSchema = z.object({
  from: z.enum(["governance", "surplus"]).optional(),
  next: z.string().optional(),
  reason: z
    .enum(["auth_required", "profile_incomplete", "pending_review", "verified_member_required"])
    .optional(),
});

export const Route = createFileRoute("/register")({
  validateSearch: registerSearchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/onboarding", search, replace: true });
  },
});
