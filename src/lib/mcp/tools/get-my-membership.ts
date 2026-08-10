import { defineTool } from "@lovable.dev/mcp-js";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_membership",
  title: "Get my membership",
  description:
    "Return the signed-in user's co-op membership record: member ID, status, trial dates, share count, contribution points and training status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);

    const { data, error } = await supabase
      .from("members")
      .select(
        "id, name, email, member_id, identity_type, status, trial_start_date, trial_end_date, stock_shares, contribution_points, edu_training_completed",
      )
      .eq("user_id", ctx.getUserId() ?? "")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No membership record found for this account." }] };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { member: data },
    };
  },
});
