"use client"

import { usePeriodicSync } from "@/app/hooks/usePeriodicSync"

export function PeriodicSyncProvider({ children }) {
  usePeriodicSync()
  return children
}

