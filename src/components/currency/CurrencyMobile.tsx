import { Copy, Filter, Search } from "lucide-react";

const rows = [
  { token: "USDC", chain: "BASE", address: "usdt..e72364847", active: true },
  { token: "USDC", chain: "BASE", address: "usdt..e72364847", active: true },
  { token: "USDT", chain: "ASSET", address: "usdt..e72364847", active: false },
  { token: "USDT", chain: "ASSET", address: "usdt..e72364847", active: false },
  { token: "USDT", chain: "ASSET", address: "usdt..e72364847", active: false },
  { token: "USDT", chain: "ASSET", address: "usdt..e72364847", active: false },
];

function Toggle({ checked }: { checked: boolean }) {
  return (
    <div
      className={`relative h-5 w-9 rounded-full transition-colors ${
        checked ? "bg-indigo-600" : "bg-zinc-700"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </div>
  );
}

export function CurrencyMobile() {
  return (
    <div className="md:hidden">
      <p className="text-sm text-muted-foreground mb-4">Toggle currencies you want to accept</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-background border border-border rounded pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-md border border-border">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl bg-card px-4 py-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800" />
                <div className="text-xl font-semibold">{row.token}/{row.chain}</div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={row.active} />
                <span className="text-base">{row.active ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-blue-300">
              <span className="text-lg">{row.address}</span>
              <Copy className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

