"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();

    // Set the cookie
    document.cookie = `admin_token=${password}; path=/; max-age=604800; samesite=strict`;

    // Clear the password from state immediately
    setPassword("");

    router.push("/abmin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-3xl border border-border shadow-sm w-80">
        <h1 className="text-xl font-bold mb-6">Admin Access</h1>

        {/* Wrap in a form to satisfy browser standards */}
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl mb-4 bg-background"
            placeholder="Password"
            required
            autoComplete="off" // Tells browser not to store/suggest
            name="admin-password" // Helps prevent accidental mapping
          />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition"
          >
            Access
          </button>
        </form>
      </div>
    </div>
  );
}
