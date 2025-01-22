"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useLocalStorageSync } from "@/app/hooks/useLocalStorageSync"
import { Button } from "@/components/ui/button"

export default function LoginIndicator() {
  const { data: session } = useSession()
  const { syncToDatabase, syncFromDatabase } = useLocalStorageSync()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (session) {
      syncFromDatabase()
      setUserEmail(localStorage.getItem("userEmail") || session.user.email)
    } else {
      setUserEmail("")
    }
  }, [session, syncFromDatabase])

  const handleSignOut = async () => {
    await syncToDatabase() // Ensure latest data is synced before signing out
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    signOut()
  }

  if (localStorage.getItem("isLoggedIn") === "true") {
    return (
      (<div className="flex items-center space-x-4">
        <span>Signed in as {userEmail}</span>
        <Button onClick={handleSignOut} variant="outline">
          Sign out
        </Button>
      </div>)
    );
  }
  return (
    (<div className="flex items-center space-x-4">
      <span>Not signed in</span>
      <Button href="/login" variant="outline">
        Sign in
      </Button>
    </div>)
  );
}

