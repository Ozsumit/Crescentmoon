"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useUserDataSync } from "@/app/hooks/useUserDataSync";
import { Button } from "@/components/ui/button";

export default function LoginIndicator() {
  const { data: session } = useSession();
  const { updateUserData } = useUserDataSync();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (session) {
      setUserEmail(localStorage.getItem("userEmail") || session.user.email);
    } else {
      setUserEmail("");
    }
  }, [session]);

  const handleSignOut = async () => {
    await updateUserData(); // Ensure latest data is synced before signing out
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    signOut();
  };

  if (
    typeof window !== "undefined" &&
    localStorage.getItem("isLoggedIn") === "true"
  ) {
    return (
      <div className="flex items-center space-x-4">
        <span>Signed in as {userEmail}</span>
        <Button onClick={handleSignOut} variant="outline">
          Sign out
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center space-x-4">
      <span>Not signed in</span>
      {/* <Button href="/login" variant="outline">
        Sign in
      </Button> */}
    </div>
  );
}
