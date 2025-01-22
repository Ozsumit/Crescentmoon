"use client"

import { useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

export function useLocalStorageSync() {
  const { data: session } = useSession()

  const syncToDatabase = useCallback(async () => {
    if (session) {
      const favorites = localStorage.getItem("favorites")
      const vidLinkProgress = localStorage.getItem("vidLinkProgress")

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
  }, [session])

  const syncFromDatabase = useCallback(async () => {
    if (session) {
      try {
        const response = await fetch("/api/user/data")
        if (response.ok) {
          const data = await response.json()
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("userEmail", session.user.email)
          localStorage.setItem("userId", data.id)
          if (data.favorites) {
            localStorage.setItem("favorites", JSON.stringify(data.favorites))
          }
          if (data.vidLinkProgress) {
            localStorage.setItem("vidLinkProgress", JSON.stringify(data.vidLinkProgress))
          }
        } else {
          throw new Error("Failed to fetch user data")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
  }, [session])

  useEffect(() => {
    if (session) {
      syncFromDatabase()
    } else {
      // Clear login status on session end
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userId")
    }
  }, [session, syncFromDatabase])

  return { syncToDatabase, syncFromDatabase }
}

