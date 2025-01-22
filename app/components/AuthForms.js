"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, X } from "lucide-react";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const formShownCount = localStorage.getItem("formShownCount");
    if (!formShownCount) {
      setShowForm(true);
      localStorage.setItem("formShownCount", "1");
    } else {
      const count = parseInt(formShownCount, 10);
      if (count > 0) {
        startPeriodicUpdates();
        setupLocalStorageListeners();
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    // Get localStorage data
    const favorites = localStorage.getItem("favorites");
    const vidLinkProgress = localStorage.getItem("vidLinkProgress");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          favorites: favorites ? JSON.parse(favorites) : null,
          vidLinkProgress: vidLinkProgress ? JSON.parse(vidLinkProgress) : null,
        }),
      });

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const sendUpdates = async () => {
    const userId = localStorage.getItem("userId");
    const favorites = localStorage.getItem("favorites");
    const vidLinkProgress = localStorage.getItem("vidLinkProgress");

    if (userId && (favorites || vidLinkProgress)) {
      try {
        const response = await fetch("/api/auth/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            favorites: favorites ? JSON.parse(favorites) : null,
            vidLinkProgress: vidLinkProgress
              ? JSON.parse(vidLinkProgress)
              : null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error("Update failed:", data.error);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  const startPeriodicUpdates = () => {
    setInterval(sendUpdates, 60000); // Send updates every minute
  };

  const setupLocalStorageListeners = () => {
    window.addEventListener("storage", (e) => {
      if (e.key === "favorites" || e.key === "vidLinkProgress") {
        sendUpdates();
      }
    });
  };

  return (
    <>
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <Card className="w-[350px] relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <CardHeader>
              <CardTitle>Join</CardTitle>
              <CardDescription>
                This is an optional registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                By registering you accept the terms and conditions and cookies
                used in this site{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Log in
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
