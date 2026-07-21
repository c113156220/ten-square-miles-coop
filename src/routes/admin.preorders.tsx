import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/preorders")({
  component: PreordersPage,
});

type WishItem = { id: string; name: string; votes: number; converted?: boolean };
type Campaign = { id: string; name: string; qty: number; vendor: string; cold: boolean };
type Order = { id: string; name: string; stage: 0 | 1 | 2 };

const initialWishes: WishItem[] = [
  { id: "w1", name: "Organic Brown Rice 5kg", votes: 87 },
  { id: "w2", name: "Cold-Pressed Camellia Oil", votes: 132 },
  { id: "w3", name: "Pesticide-Free Bananas", votes: 54 },
];

const campaigns: Campaign[] = [
  { id: "c1", name: "Highland Brown Eggs (12ct)", qty: 200, vendor: "Sunhill Farm", cold: true },
  { id: "c2", name: "Wood-Fired Soy Sauce 500ml", qty: 150, vendor: "Old Kiln Brewery", cold: false },
  { id: "c3", name: "Seasonal Veggie Box 5kg", qty: 80, vendor: "Yushan Co-op", cold: true },
];

const stages = ["po.status.sourcing", "po.status.transit", "po.status.ready"] as const;

const initialOrders: Order[] = [
  { id: "o1", name: "Highland Brown Eggs", stage: 0 },
  { id: "o2", name: "Wood-Fired Soy Sauce", stage: 1 },
  { id: "o3", name: "Seasonal Veggie Box", stage: 2 },
];

function PreordersPage() {
  const { t } = useI18n();
  const [wishes, setWishes] = useState(initialWishes);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [orders, setOrders] = useState(initialOrders);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.preorders")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Zero-inventory supply chain
        </p>
      </header>

      <section className="rounded-md border border-border bg-white">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("po.wishlist")}</h2>
        </div>
        <ul className="divide-y divide-border">
          {wishes.map((w) => (
            <li key={w.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-semibold">{w.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {t("po.votes")}: {w.votes}
                </p>
              </div>
              <button
                onClick={() =>
                  setWishes(wishes.map((x) => (x.id === w.id ? { ...x, converted: true } : x)))
                }
                disabled={w.converted}
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
              >
                {w.converted ? "✓ Converted" : t("po.convert")}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("po.vendor")}</h2>
          <button
            onClick={() => setSheetOpen(true)}
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {t("po.generate")}
          </button>
        </div>
        {sheetOpen ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 font-mono">{c.qty}</td>
                  <td className="px-4 py-3">{c.vendor}</td>
                  <td className="px-4 py-3">
                    {c.cold ? (
                      <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        ❄ {t("po.cold")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Ambient</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">
            Click "Generate purchase sheet" after a pre-order deadline passes.
          </p>
        )}
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("po.fulfill")}</h2>
        </div>
        <ul className="divide-y divide-border">
          {orders.map((o) => (
            <li key={o.id} className="grid grid-cols-1 items-center gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto]">
              <p className="font-semibold">{o.name}</p>
              <div className="flex items-center gap-2">
                {stages.map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                      i === o.stage
                        ? "bg-primary text-primary-foreground"
                        : i < o.stage
                          ? "bg-primary/10 text-primary"
                          : "bg-stone-200 text-muted-foreground"
                    }`}
                  >
                    {t(s)}
                  </span>
                ))}
              </div>
              <button
                disabled={o.stage === 2}
                onClick={() =>
                  setOrders(orders.map((x) => (x.id === o.id ? { ...x, stage: (x.stage + 1) as 0 | 1 | 2 } : x)))
                }
                className="justify-self-end rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40"
              >
                {t("po.advance")} →
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
