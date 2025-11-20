import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

/**
 * LoginPage
 * Renders the login experience. If `VITE_LOGIN_URL` is set, it shows a single
 * action to continue to the provided external login link (same-window redirect).
 * Otherwise, it falls back to a real local login form bound to /api/auth/login.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const loginUrl = (import.meta.env.VITE_LOGIN_URL as string | undefined) || undefined;
  const [, setLocation] = useLocation();

  const handleExternalLogin = () => {
    if (!loginUrl) return;
    // Redirect in the same tab for a seamless auth flow
    window.location.href = loginUrl;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      await res.json();
      setLocation("/");
    } catch (err: any) {
      setError(String(err?.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border bg-card/80 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            {loginUrl ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Continue to sign in using the configured login provider.
                </p>
                <Button type="button" className="w-full" onClick={handleExternalLogin}>
                  Continue to Login
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Using external login at: {loginUrl}
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                {error ? (
                  <p className="text-center text-xs text-destructive mt-2">{error}</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Local login is enabled. You can also configure VITE_LOGIN_URL for external auth.
                  </p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}