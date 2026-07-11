import { Eye, EyeOff, Copy, Key } from "lucide-react";
import React from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function ApiConfigurationSection({ mode }: { mode: "live" | "test" }) {
  const isLive = mode === "live";
  const { notify } = useToast();
  const [showSecret, setShowSecret] = React.useState(false);
  const secretValue = "**************************************";
  const realSecret = "we_live_8h9jw984uj9828283jj90ujq02-09393090ow00w02934";

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    notify("Copied to clipboard");
  };

  return (
    <section className="mb-10 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="pb-4 border-b border-[#23242A] w-full">
          {/* Desktop: Everything in one line */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white">API Configuration</h2>
              <span className={`flex items-center gap-1.5 text-sm ${isLive ? "text-blue-400" : "text-yellow-400"}`}> 
                <span className={`w-2 h-2 rounded-full ${isLive ? "bg-blue-400" : "bg-yellow-400"}`}></span>
                {isLive ? "Live Mode" : "Test Mode"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isLive && (
                <span className="text-sm px-3 py-1 rounded-full border border-green-500 text-green-400 bg-transparent flex items-center gap-1.5">
                  Active <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                </span>
              )}
              <button className="px-3 py-1.5 rounded-lg border border-[#3a3a4a] bg-[#1a1a1f] hover:bg-[#25252b] text-white text-sm font-medium flex items-center gap-2 transition-colors">
                Regenerate API Key <Key className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Mobile: API Configuration header */}
          <div className="md:hidden mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-white">API Configuration</h3>
                <span className={`flex items-center gap-1.5 text-xs ${isLive ? "text-blue-400" : "text-yellow-400"}`}> 
                  <span className={`w-2 h-2 rounded-full ${isLive ? "bg-blue-400" : "bg-yellow-400"}`}></span>
                  {isLive ? "Live Mode" : "Test Mode"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {isLive && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-green-500 text-green-400 bg-transparent flex items-center gap-1.5">
                  Active <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                </span>
              )}
              <button className="px-3 py-1.5 rounded-lg border border-[#3a3a4a] bg-[#1a1a1f] hover:bg-[#25252b] text-white text-xs font-medium flex items-center gap-2 transition-colors ml-auto">
                Regenerate API Key <Key className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Fields Container */}
        <div className="mt-6 w-full">
          {/* Desktop: Cards with borders */}
          <div className="hidden md:flex md:flex-col md:gap-6">
            {/* API Secret Key */}
            <div className="flex flex-col gap-2 w-full rounded-xl bg-[#1a1a1f] p-5 border border-[#2a2a35]">
              <label className="block text-sm text-gray-400 font-medium">API Secret Key</label>
              <div className="flex items-center w-full gap-3 cursor-pointer hover:border-[#3a3a45] transition-colors">
                <input
                  type={showSecret ? "text" : "password"}
                  value={showSecret ? realSecret : secretValue}
                  readOnly
                  className="flex-1 bg-[#13131a] text-white px-4 py-3 rounded-lg border border-[#2a2a35] text-sm focus:outline-none focus:border-[#3a3a45]"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#3a3a40] border border-[#3a3a40] hover:bg-[#44444a] transition-colors flex-shrink-0"
                  onClick={() => setShowSecret((v) => !v)}
                  type="button"
                  aria-label={showSecret ? "Hide" : "Show"}
                >
                  {showSecret ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* API Public Key */}
            <div className="flex flex-col gap-2 w-full rounded-xl bg-[#1a1a1f] p-5 border border-[#2a2a35]">
              <label className="block text-sm text-gray-400 font-medium">API Public Key</label>
              <div className="flex items-center w-full gap-3 cursor-pointer hover:border-[#3a3a45] transition-colors">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-[#13131a] text-white px-4 py-3 rounded-lg border border-[#2a2a35] text-sm focus:outline-none focus:border-[#3a3a45]"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#3a3a40] border border-[#3a3a40] hover:bg-[#44444a] transition-colors flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* IP Whitelisted */}
            <div className="flex flex-col gap-2 w-full rounded-xl bg-[#1a1a1f] p-5 border border-[#2a2a35]">
              <label className="block text-sm text-gray-400 font-medium">IP Whitelisted</label>
              <div className="flex items-center w-full gap-3 cursor-pointer hover:border-[#3a3a45] transition-colors">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-[#13131a] text-white px-4 py-3 rounded-lg border border-[#2a2a35] text-sm focus:outline-none focus:border-[#3a3a45]"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#3a3a40] border border-[#3a3a40] hover:bg-[#44444a] transition-colors flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Webhook Live URL */}
            <div className="flex flex-col gap-2 w-full rounded-xl bg-[#1a1a1f] p-5 border border-[#2a2a35]">
              <label className="block text-sm text-gray-400 font-medium">Webhook Live URL</label>
              <div className="flex items-center w-full gap-3 cursor-pointer hover:border-[#3a3a45] transition-colors">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-[#13131a] text-white px-4 py-3 rounded-lg border border-[#2a2a35] text-sm focus:outline-none focus:border-[#3a3a45]"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#3a3a40] border border-[#3a3a40] hover:bg-[#44444a] transition-colors flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Full-width fields without card wrapper, more spacious */}
          <div className="flex flex-col gap-6 md:hidden w-full px-2 sm:px-0">
            {/* API Secret Key */}
            <div className="flex flex-col gap-3 w-full">
              <label className="block text-sm text-gray-400">API Secret Key</label>
              <div className="flex items-center w-[364px] max-w-full h-[70px] gap-4 bg-[#0f0f13] rounded-[12px] border border-[#2a2a35] pl-4 pr-3">
                <input
                  type={showSecret ? "text" : "password"}
                  value={showSecret ? realSecret : secretValue}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none truncate"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                  onClick={() => setShowSecret((v) => !v)}
                  type="button"
                  aria-label={showSecret ? "Hide" : "Show"}
                >
                  {showSecret ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* API Public Key */}
            <div className="flex flex-col gap-3 w-full">
              <label className="block text-sm text-gray-400">API Public Key</label>
              <div className="flex items-center w-[364px] max-w-full h-[70px] gap-4 bg-[#0f0f13] rounded-[12px] border border-[#2a2a35] pl-4 pr-3">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none break-words"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* IP Whitelisted */}
            <div className="flex flex-col gap-3 w-full">
              <label className="block text-sm text-gray-400">IP Whitelisted</label>
              <div className="flex items-center w-[364px] max-w-full h-[70px] gap-4 bg-[#0f0f13] rounded-[12px] border border-[#2a2a35] pl-4 pr-3">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none break-words"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Webhook Live URL */}
            <div className="flex flex-col gap-3 w-full">
              <label className="block text-sm text-gray-400">Webhook Live URL</label>
              <div className="flex items-center w-[364px] max-w-full h-[70px] gap-4 bg-[#0f0f13] rounded-[12px] border border-[#2a2a35] pl-4 pr-3">
                <input
                  type="text"
                  value={realSecret}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none break-words"
                />
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                  onClick={() => handleCopy(realSecret)}
                  type="button"
                  aria-label="Copy"
                >
                  <Copy className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}