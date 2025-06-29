"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to check if component is mounted (client-side)
 * Helps prevent hydration mismatches
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * Component wrapper to prevent hydration issues
 * Only renders children after component is mounted on client
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
