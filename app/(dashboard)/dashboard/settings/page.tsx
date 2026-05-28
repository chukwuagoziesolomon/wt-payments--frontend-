"use client";

import WidgetConfigurationContent from "@/src/components/settings/WidgetConfigurationContent";
import * as React from "react";
import SettingsNav from "@/src/components/settings/SettingsNav";
import ApiConfigurationSection from "@/src/components/settings/ApiConfigurationSection";

function AccountInfoSettingsContent() {
  return (
    <>
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          <div />
        </div>
        <div className="bg-[#19191d] rounded-2xl p-12 border border-[#23242A]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Surname</label>
              <input
                type="text"
                className="w-full bg-[#19191d] border border-[#23242A] rounded-md px-4 py-2 text-white"
                value="Eze"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                className="w-full bg-[#19191d] border border-[#23242A] rounded-md px-4 py-2 text-white"
                value="Chukwubinyerem Emmanuella"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-[#19191d] border border-[#23242A] rounded-md px-4 py-2 text-white"
                value="ezeemmanuella710@gmail.com"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Phone Number</label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-[#23242A] border border-[#23242A] rounded-md px-3 py-2 text-white">
                  <span className="w-4 h-4 bg-green-600 rounded-full inline-block" />
                  +234
                </span>
                <input
                  type="text"
                  className="flex-1 bg-[#19191d] border border-[#23242A] rounded-md px-4 py-2 text-white min-w-0 truncate"
                  value="909 687 9086"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="bg-[#35373F] text-white px-6 py-2 rounded-md">Save Changes</button>
        </div>
      </div>
      <div className="w-full max-w-5xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Authentication</h2>
          <div />
        </div>
        <div className="bg-[#19191d] rounded-2xl p-8 border border-[#23242A]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1 flex items-center gap-4">
              <span className="text-white">Password</span>
              <button className="bg-[#23242A] text-white px-4 py-2 rounded-md text-sm">Change Password</button>
            </div>
            <div className="flex-1 flex items-center gap-4">
              <span className="text-white">Two factor - Auth</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked readOnly />
                <div className="w-14 h-8 bg-[#23242A] rounded-full peer-checked:bg-violet-500 transition-colors" />
                <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transform transition-transform peer-checked:translate-x-6" />
                <span className="ml-4 text-violet-400">Enable</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PayoutSettingsContent() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#19191d] rounded-xl p-12 border border-[#23242A]">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-1">Currency Configuration</h2>
        <p className="text-muted-foreground text-sm mb-4">Choose the currency your business will accept and settle in</p>
        <div className="flex flex-col gap-2 pb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="currency" value="USD" className="accent-violet-500" defaultChecked />
            <span className="text-white">USD</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="currency" value="NGN" className="accent-violet-500" />
            <span className="text-white">NGN</span>
          </label>
        </div>
        <div className="border-b border-[#23242A] mb-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Bank Account</h2>
        <p className="text-muted-foreground text-sm mb-4">Choose the currency your business will accept and settle in</p>
        <div className="flex flex-col gap-2 pb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="bank-currency" value="USD" className="accent-violet-500" defaultChecked />
            <span className="text-white">USD</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="radio" name="bank-currency" value="NGN" className="accent-violet-500" />
            <span className="text-white">NGN</span>
          </label>
        </div>
        <div className="border-b border-[#23242A]" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  // Read the `tab` query parameter if present to set the initial tab
  const getInitialTab = () => {
    if (typeof window === "undefined") return "webhook";
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "payout") return "payout";
    if (params.get("tab") === "account") return "account";
    return "webhook";
  };

  const [tab, setTab] = React.useState(getInitialTab);

  React.useEffect(() => {
    const onPop = () => setTab(getInitialTab());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <h1 className="text-xl font-semibold text-white mb-6">
        Setting{'>>'}{tab === "account" ? "Account Info" : tab === "payout" ? "Payout" : tab === "webhook" ? "Webhook Configuration" : ""}
      </h1>
      <SettingsNav active={tab} onChange={setTab} />

      {tab === "account" && <AccountInfoSettingsContent />}
      {tab === "webhook" && (
        <>
          {/* Mobile: render headings and sections full-bleed so they can stretch */}
          <>
            <h2 className="text-lg font-semibold text-white mb-3 px-2">API Configuration (Live)</h2>
            <div className="px-0">
              <ApiConfigurationSection mode="live" />
            </div>

            <h2 className="text-lg font-semibold text-white mb-3 mt-6 px-2">API Configuration (Test)</h2>
            <div className="px-0">
              <ApiConfigurationSection mode="test" />
            </div>
          </>
          <div className="hidden sm:block">
            <ApiConfigurationSection mode="live" />
            <ApiConfigurationSection mode="test" />
          </div>
        </>
      )}
      {tab === "payout" && <PayoutSettingsContent />}
      {tab === "widget" && <WidgetConfigurationContent />}
    </div>
  );
}
