import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getMyMembershipTool from "./tools/get-my-membership";
import listMyOrdersTool from "./tools/list-my-orders";
import listMyWishesTool from "./tools/list-my-wishes";
import createWishTool from "./tools/create-wish";

// The OAuth issuer must be the direct Supabase host, not the publish-time proxy.
function issuerUrl(): string {
  const projectId = import.meta.env["VITE_SUPABASE_PROJECT_ID"] as string | undefined;
  if (projectId) return `https://${projectId}.supabase.co/auth/v1`;

  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const ref = url?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
  return `https://${ref ?? "project-ref-unset"}.supabase.co/auth/v1`;
}

export default defineMcp({
  name: "ten-square-miles-coop",
  title: "十圓方里 Ten Square Miles Co-op",
  version: "0.1.0",
  instructions:
    "Tools for the 十圓方里 (Ten Square Miles) co-operative platform. Browse the pre-order catalogue, check the signed-in member's membership status, orders, and wishlist requests, and submit new sourcing wishes. All member data is scoped to the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: issuerUrl(),
    acceptedAudiences: "authenticated",
  }),
  tools: [listProductsTool, getMyMembershipTool, listMyOrdersTool, listMyWishesTool, createWishTool],
});
