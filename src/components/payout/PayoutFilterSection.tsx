"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icons from "@/components/icons";
import { ChevronDown, Filter, Eye, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

type PayoutSettings = {
  type: string;
  network_id: string | null;
  wallet_address: string | null;
  currency_id: string | null;
  bank_account_no: string;
  bank_name: string;
  account_name: string;
  bank_code: string;
};

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

export function PayoutFilterSection() {
  const { notify } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await authFetch(`${API}/user/settings/payout`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.data) {
        setSettings(json.data);
      } else {
        notify(json.data || "Failed to load payout settings");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error loading payout settings");
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        type: settings?.type || "FIAT",
        bank_account_no: formData.get("bank_account_no")?.toString() || settings?.bank_account_no || "",
        bank_name: formData.get("bank_name")?.toString() || settings?.bank_name || "",
        account_name: formData.get("account_name")?.toString() || settings?.account_name || "",
        bank_code: formData.get("bank_code")?.toString() || settings?.bank_code || "",
      };

      const res = await authFetch(`${API}/user/settings/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        notify("Payout details updated successfully!");
        setSettingsOpen(false);
      } else {
        notify(json.data || "Failed to save payout settings");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") notify("Error saving payout settings");
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    loadSettings();
    setSettingsOpen(true);
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full flex items-center justify-between md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="border border-border p-2"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="bg-background border-border text-foreground hover:bg-accent"
            onClick={openSettings}
          >
            <Icons.settingsIcon className="w-4 h-4 mr-2" />
            Payout Setting
          </Button>
        </div>

        <div className={`md:hidden mt-3 ${mobileOpen ? '' : 'hidden'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">All Payouts</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Completed</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    Time
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">Last 3 months</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full text-left bg-background border-border">
                    USD
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">USD ($)</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">EUR (€)</DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">GBP (£)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="bg-background border-border text-foreground hover:bg-accent">
                <Icons.settingsIcon className="w-4 h-4 mr-2" />
                Payout Setting
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 flex-wrap min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                All Payouts
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
              >
                Time
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                Last 3 months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-background border-border text-foreground hover:bg-accent flex-shrink-0"
              >
                USD
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                USD ($)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                EUR (€)
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent">
                GBP (£)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-background border-border text-foreground hover:bg-accent"
            onClick={openSettings}
          >
            <Icons.settingsIcon className="w-4 h-4 mr-2" />
            Payout Setting
          </Button>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout Settings</DialogTitle>
          </DialogHeader>
          {loadingSettings ? (
            <div className="py-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                <input
                  name="account_name"
                  defaultValue={settings?.account_name || ""}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                <input
                  name="bank_name"
                  defaultValue={settings?.bank_name || ""}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                <input
                  name="bank_account_no"
                  defaultValue={settings?.bank_account_no || ""}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Bank Code</label>
                <input
                  name="bank_code"
                  defaultValue={settings?.bank_code || ""}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
