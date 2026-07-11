import * as React from "react";

export default function SettingsNav({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  const tabs = [
    { key: "account", label: "Account info" },
    { key: "payout", label: "Payout" },
    { key: "api", label: "API Keys" },
    { key: "webhooks", label: "Webhooks" },
    { key: "widget", label: "Widget" },
  ];

  return (
    <>
      {/* Mobile: horizontal pill nav */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-2 w-max flex-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full border text-[15px] font-medium transition-colors duration-150 ${active === tab.key
                ? 'bg-[#232345] text-[#A3A3FF] border-[#232345] shadow-sm'
                : 'bg-transparent text-[#B0B0C3] border-[#232345]'}
                `}
              style={{ minWidth: 160, borderWidth: 1.5 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: full width tab row */}
      <div className="hidden md:flex gap-2 bg-[#191A1E] mb-6 rounded-t-xl border-b border-[#23242A]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`flex-1 px-0 py-3 rounded-t-xl font-medium text-base focus:outline-none transition-colors duration-150 border-b-2 ${active === tab.key ? "bg-[#23242A] text-white border-b-primary" : "bg-transparent text-muted-foreground border-b-transparent"}`}
            style={{ minWidth: 0 }}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
