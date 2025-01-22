"use client"

import { useCallback } from "react"
import { useLocalStorageSync } from "./useLocalStorageSync"

export function useUserData(session) {
  const { syncToDatabase } = useLocalStorageSync(session)

  const syncUserData = useCallback(async () => {
    if (session) {
      await syncToDatabase()
    } else {
      // User is logging out, save server data to localStorage
      try {
        const response = await fetch("/api/user/data")
        if (response.ok) {
          const data = await response.json()
          localStorage.setItem("favorites", JSON.stringify(data.favorites || []))
          localStorage.setItem("vidLinkProgress", JSON.stringify(data.vidLinkProgress || {}))
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
  }, [session, syncToDatabase])

  return { syncUserData }
}

