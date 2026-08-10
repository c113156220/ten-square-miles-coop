import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_wishes",
  title: "List my wishlist requests",
  description: "List the signed-in member's wishlist / demand survey submissions.",
  inputSchema: {
    limit: z.number().int().describe("Maximum rows to return (1-50, default 20).").nullable(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const take = Math.min(Math.max(limit ?? 20, 1), 50);

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", ctx.getUserId() ?? "")
      .maybeSingle();

    if (memberError) return { content: [{ type: "text", text: memberError.message }], isError: true };
    if (!member) return { content: [{ type: "text", text: "No membership record found for this account." }] };

    const { data, error } = await supabase
      .from("wishlist_surveys")
      .select("id, product_name, type, expected_qty, reference_link, points_awarded, created_at")
      .eq("member_id", member.id)
      .order("created_at", { ascending: false })
      .limit(take);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { wishes: data ?? [] },
    };
  },
});
