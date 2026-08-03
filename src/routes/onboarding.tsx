import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/OnboardingFlow";

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
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return <OnboardingFlow />;
}