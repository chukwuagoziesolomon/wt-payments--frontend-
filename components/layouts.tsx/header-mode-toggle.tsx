"use client";

import React from "react";

export default function HeaderModeToggle() {
  const [isLive, setIsLive] = React.useState(false);

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm ${isLive ? "text-blue-400" : "text-yellow-400"}`}>{isLive ? "Live" : "Test"}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isLive}
          onChange={(e) => setIsLive(e.target.checked)}
        />
        <div className="w-10 h-6 bg-[#23242A] rounded-full peer-checked:bg-violet-500 transition-colors" />
        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transform transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  );
}
