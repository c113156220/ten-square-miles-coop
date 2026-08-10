import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List co-op products",
  description:
    "List products in the co-op catalogue (name, category, member and guest price, tax status, temperature handling and pre-order info).",
  inputSchema: {
    category: z.string().trim().describe("Optional category filter, e.g. produce or processed.").nullable(),
    preorder_only: z.boolean().describe("Only return items currently open for pre-order.").nullable(),
    limit: z.number().int().describe("Maximum rows to return (1-100, default 25).").nullable(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, preorder_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const take = Math.min(Math.max(limit ?? 25, 1), 100);

    let query = supabase
      .from("products")
      .select(
        "id, name, category, price_member, price_guest, is_tax_exempt, temp_control, is_preorder, preorder_threshold, preorder_deadline",
      )
      .order("created_at", { ascending: false })
      .limit(take);

    if (category) query = query.eq("category", category);
    if (preorder_only) query = query.eq("is_preorder", true);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
