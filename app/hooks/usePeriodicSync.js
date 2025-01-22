"use client"

import { useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export function usePeriodicSync() {
  const { data: session } = useSession()

  const checkAndSyncData = useCallback(async () => {
    if (session) {
      const favorites = localStorage.getItem("favorites")
      const vidLinkProgress = localStorage.getItem("vidLinkProgress")

      if (favorites !== null || vidLinkProgress !== null) {
        try {
          const response = await fetch("/api/user/data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              favorites: favorites ? JSON.parse(favorites) : null,
              vidLinkProgress: vidLinkProgress ? JSON.parse(vidLinkProgress) : null,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to sync data to database")
          }
        } catch (error) {
          console.error("Error syncing data to database:", error)
        }
      }
    }
  }, [session])

  useEffect(() => {
    const intervalId = setInterval(checkAndSyncData, 120000) // Check every 2 minutes

    return () => clearInterval(intervalId);
  }, [checkAndSyncData])
}

