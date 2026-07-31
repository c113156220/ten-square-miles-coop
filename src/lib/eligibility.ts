import type { AuthUser, Role } from "@/lib/auth";

export type GateTarget = "governance" | "surplus";

export type GateReason =
  | "auth_required"
  | "profile_incomplete"
  | "pending_review"
  | "verified_member_required";

export type GateSearch = {
  from?: GateTarget;
  next?: string;
  reason?: GateReason;
};

export enum EligibilityState {
  Anonymous = "anonymous",
  TrialIncomplete = "trial_incomplete",
  MemberPending = "member_pending",
  VerifiedTrial = "verified_trial",
  VerifiedMember = "verified_member",
}

const VERIFIED_MEMBER_ROLES: Role[] = ["member", "admin"];

export function resolveEligibilityState(user: AuthUser | null): EligibilityState {
  if (!user) return EligibilityState.Anonymous;
  if (!user.verified) {
    return VERIFIED_MEMBER_ROLES.includes(user.role)
      ? EligibilityState.MemberPending
      : EligibilityState.TrialIncomplete;
  }
  if (VERIFIED_MEMBER_ROLES.includes(user.role)) return EligibilityState.VerifiedMember;
  return EligibilityState.VerifiedTrial;
}

export function requireAuthAndEligibility(
  user: AuthUser | null,
  target: GateTarget,
): { allowed: true } | { allowed: false; reason: GateReason; search: GateSearch } {
  const state = resolveEligibilityState(user);
  const next = target === "governance" ? "/governance" : "/calculator";

  if (state === EligibilityState.Anonymous) {
    return { allowed: false, reason: "auth_required", search: { from: target, next, reason: "auth_required" } };
  }

  if (state === EligibilityState.TrialIncomplete) {
    return {
      allowed: false,
      reason: "profile_incomplete",
      search: { from: target, next, reason: "profile_incomplete" },
    };
  }

  if (state === EligibilityState.MemberPending) {
    return {
      allowed: false,
      reason: "pending_review",
      search: { from: target, next, reason: "pending_review" },
    };
  }

  if (target === "surplus" && state !== EligibilityState.VerifiedMember) {
    return {
      allowed: false,
      reason: "verified_member_required",
      search: { from: target, next, reason: "verified_member_required" },
    };
  }

  return { allowed: true };
}
