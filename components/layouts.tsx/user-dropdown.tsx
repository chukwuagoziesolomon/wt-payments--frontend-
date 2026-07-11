"use client";

import { RiLogoutBoxLine, RiSettingsLine, RiTeamLine } from "@remixicon/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { useToast } from "@/components/ui/ToastProvider";

const API = "/backend";

function getToken() {
  return typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

type UserInfo = {
  full_name: string;
  email: string;
  profile_image: string | null;
};

export default function UserDropdown() {
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    full_name: "",
    email: "",
    profile_image: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await authFetch(`${API}/user/account-info`, {
        headers: authHeaders(),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result) {
        setUserInfo({
          full_name: json.result.full_name || "",
          email: json.result.email || "",
          profile_image: json.result.profile_image || null,
        });
      }
    } catch (err) {
      // Silent fail - use defaults
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notify("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("profile_image", file);

      const res = await authFetch(`${API}/user/account-info/profile-image`, {
        method: "POST",
        headers: authHeaders(),
        body: formDataObj,
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.result?.profile_image) {
        setUserInfo((prev) => ({ ...prev, profile_image: json.result.profile_image }));
        notify("Profile picture updated successfully!");
      } else {
        notify(json.data || "Failed to upload profile image");
      }
    } catch (err: any) {
      if (err.name !== "AuthExpiredError") {
        notify("Error uploading profile image");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-auto p-0 hover:bg-transparent relative group cursor-pointer" variant="ghost" title="Click to upload profile picture">
          <Avatar className="size-8">
            <AvatarImage alt="Profile image" height={32} src={userInfo.profile_image || ""} width={32} />
            <AvatarFallback>{getInitials(userInfo.full_name)}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleProfilePictureChange}
        disabled={uploading}
        className="hidden"
      />
      <DropdownMenuContent align="end" className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground text-sm">{userInfo.full_name || "User"}</span>
          <span className="truncate font-normal text-muted-foreground text-xs">{userInfo.email || "user@example.com"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
            <span>{uploading ? "Uploading..." : "Change picture"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RiSettingsLine aria-hidden="true" className="opacity-60" size={16} />
            <span>Account settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <RiTeamLine aria-hidden="true" className="opacity-60" size={16} />
            <span>Affiliate area</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <RiLogoutBoxLine aria-hidden="true" className="opacity-60" size={16} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
