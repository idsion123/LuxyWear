"use client";

import { AuthProvider } from "@/store/auth-context";
import { CartProvider } from "@/store/cart-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
