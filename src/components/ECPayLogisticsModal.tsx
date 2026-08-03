import { useMemo, useState } from "react";
import { MapPin, X } from "lucide-react";

export type LogisticsSubType = "UNIMARTC2C" | "FAMI C2C";

export type LogisticsStore = {
  CVSStoreName: string;
  CVSStoreID: string;
  CVSAddress: string;
  LogisticsSubType: LogisticsSubType;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (store: LogisticsStore) => void;
};

const STORES: Array<{ name: string; id: string; address: string; subtype: LogisticsSubType }> = [
  { name: "7-ELEVEN 清大門市", id: "UNIMART001", address: "新竹市東區光復路二段101號", subtype: "UNIMARTC2C" },
  { name: "全家 新竹科學門市", id: "FAMI001", address: "新竹市東區光復路一段123號", subtype: "FAMI C2C" },
  { name: "7-ELEVEN 交大門市", id: "UNIMART002", address: "新竹市東區大學路1001號", subtype: "UNIMARTC2C" },
  { name: "全家 煙波門市", id: "FAMI002", address: "新竹市東區光復路二段258號", subtype: "FAMI C2C" },
];

export function ECPayLogisticsModal({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STORES;
    return STORES.filter((store) => `${store.name} ${store.address} ${store.id}`.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute inset-x-4 top-10 mx-auto w-full max-w-3xl rounded-3xl border border-border bg-white shadow-elevated"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ECPay E-Map</p>
            <h3 className="text-lg font-bold">選擇超商門市</h3>
          </div>
          <button onClick={onClose} className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
            <p className="text-sm font-semibold">支援門市類型</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-xl border border-primary/20 bg-white p-3">
                <p className="font-semibold">7-11 / UNIMARTC2C</p>
                <p className="text-xs text-muted-foreground">綠界超商交貨便門市取貨</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-white p-3">
                <p className="font-semibold">全家 / FAMI C2C</p>
                <p className="text-xs text-muted-foreground">綠界全家超商取貨</p>
              </div>
            </div>
            <label className="block pt-2">
              <span className="mb-1 block text-xs font-bold text-muted-foreground">搜尋門市</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="搜尋門市名稱 / 地址 / 代號"
              />
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">可選門市</p>
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filtered.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onSelect({
                    CVSStoreName: store.name,
                    CVSStoreID: store.id,
                    CVSAddress: store.address,
                    LogisticsSubType: store.subtype,
                  })}
                  className="flex w-full items-start gap-3 rounded-2xl border border-border bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{store.name}</span>
                    <span className="block text-xs text-muted-foreground">{store.address}</span>
                    <span className="mt-1 inline-flex rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {store.subtype}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
