import { createFileRoute, useSearch } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { z } from "zod";

const onboardingSearchSchema = z.object({
  from: z.enum(["governance", "surplus"]).optional(),
  next: z.string().optional(),
  reason: z
    .enum(["auth_required", "profile_incomplete", "pending_review", "verified_member_required"])
    .optional(),
});

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "入社教育訓練 · Member Onboarding — 十圓方里" },
      {
        name: "description",
        content: "四步驟入社教育訓練：實名驗證、合作社十講、隨機理念快問快答，通關後開通 30 天體驗帳號。",
      },
      { property: "og:title", content: "Co-op Member Onboarding — Ten Sq Miles" },
      { property: "og:description", content: "Verify identity, read the 5 co-op lectures, pass the random quiz, activate your 30-day trial pass." },
    ],
  }),
  validateSearch: onboardingSearchSchema,
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const { reason, from, next } = useSearch({ from: "/onboarding" });
  const entryNotice =
    reason === "auth_required"
      ? {
          title: "請先完成統一登入 / 註冊流程",
          body: "你正要進入社員模組，請先登入或完成入社教育訓練。",
        }
      : reason === "profile_incomplete"
        ? {
            title: "資料尚未完成，請先補件",
            body: "請完成身份驗證與教育流程後再返回目標模組。",
          }
        : reason === "pending_review"
          ? {
              title: "帳號審核中，請先完成必要流程",
              body: "你的社員資料仍在待審核狀態，完成補件後即可繼續。",
            }
          : reason === "verified_member_required"
            ? {
                title: "合作社結餘分配僅限已驗證正式社員",
                body: "請先完成正式社員資格與教育流程，再進入結餘分配模組。",
              }
            : undefined;

  return <OnboardingFlow entryNotice={entryNotice} fromModule={from} nextPath={next} />;
}