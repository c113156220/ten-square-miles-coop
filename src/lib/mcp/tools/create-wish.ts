import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_wish",
  title: "Create a wishlist request",
  description:
    "Submit a product wish / demand survey entry for the signed-in member (a product they would like the co-op to source).",
  inputSchema: {
    product_name: z.string().trim().min(1).describe("Product the member wants the co-op to source."),
    type: z.string().trim().min(1).describe("Wish type, e.g. wish or survey."),
    expected_qty: z.number().int().describe("Expected quantity, default 1.").nullable(),
    reference_link: z.string().trim().describe("Optional reference URL for the product.").nullable(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ product_name, type, expected_qty, reference_link }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", ctx.getUserId() ?? "")
      .maybeSingle();

    if (memberError) return { content: [{ type: "text", text: memberError.message }], isError: true };
    if (!member) {
      return { content: [{ type: "text", text: "No membership record found for this account." }], isError: true };
    }

    const { data, error } = await supabase
      .from("wishlist_surveys")
      .insert({
        member_id: member.id,
        product_name,
        type,
        expected_qty: expected_qty ?? 1,
        reference_link: reference_link ?? null,
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { wish: data },
    };
  },
});
