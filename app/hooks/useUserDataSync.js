import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function useUserDataSync() {
  const { data: session } = useSession()

  useEffect(() => {
    const syncData = async () => {
      if (session) {
        try {
          const response = await fetch("/api/user/data")
          if (response.ok) {
            const userData = await response.json()
            localStorage.setItem("favorites", JSON.stringify(userData.favorites || []))
            localStorage.setItem("vidLinkProgress", JSON.stringify(userData.vidLinkProgress || {}))
            localStorage.setItem("isLoggedIn", "true")
            localStorage.setItem("userEmail", session.user.email)
            localStorage.setItem("userId", userData.id)
          } else {
            console.error("Failed to fetch user data")
          }
        } catch (error) {
          console.error("Error syncing user data:", error)
        }
      } else {
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userId")
      }
    }

    syncData()
  }, [session])

  const updateUserData = async () => {
    if (session) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
      const vidLinkProgress = JSON.parse(localStorage.getItem("vidLinkProgress") || "{}")

      try {
        const response = await fetch("/api/user/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ favorites, vidLinkProgress }),
        })

        if (!response.ok) {
          console.error("Failed to update user data on the server")
        }
      } catch (error) {
        console.error("Error updating user data:", error)
      }
    }
  }

  return { updateUserData }
}

