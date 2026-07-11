"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? (localStorage.getItem("authToken") || localStorage.getItem("token") || "") : "";
    if (token) {
      router.replace("/dashboard/cart");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
