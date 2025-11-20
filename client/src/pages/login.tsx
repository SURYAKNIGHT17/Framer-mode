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
 * Otherwise, it falls back to a local auth UI that supports both Sign In and
 * Create Account flows bound to /api/auth/login and /api/auth/register.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const loginUrl = (import.meta.env.VITE_LOGIN_URL as string | undefined) || undefined;
  const [, setLocation] = useLocation();

  /**
   * handleExternalLogin
   * When an external login URL is configured, redirect the user to that URL.
   */
  const handleExternalLogin = () => {
    if (!loginUrl) return;
    // Redirect in the same tab for a seamless auth flow
    window.location.href = loginUrl;
  };

  /**
   * validateInputs
   * Performs minimal client-side validation for email format and password length.
   * This is a UX enhancement; the server enforces its own validation as well.
   */
  const validateInputs = (emailRaw: string, passwordRaw: string) => {
    const e = emailRaw.trim();
    const p = passwordRaw.trim();
    const emailOk = /.+@.+\..+/.test(e);
    const passOk = p.length >= 6; // align with server schema
    if (!emailOk) return "Please enter a valid email address.";
    if (!passOk) return "Password must be at least 6 characters.";
    return null;
  };

  /**
   * onSubmit
   * Handles both Sign In and Create Account flows depending on current mode.
   * - login: POST /api/auth/login
   * - register: POST /api/auth/register
   * On success, navigates to the home page.
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const validationError = validateInputs(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await apiRequest("POST", endpoint, { email: email.trim(), password: password.trim() });
      await res.json();
      setLocation("/");
    } catch (err: any) {
      setError(String(err?.message || (mode === "login" ? "Login failed" : "Registration failed")));
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
                <div className="flex justify-center gap-2 mb-2" role="tablist" aria-label="Auth mode">
                  <Button type="button" variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")} aria-selected={mode === "login"}>
                    Sign In
                  </Button>
                  <Button type="button" variant={mode === "register" ? "default" : "outline"} onClick={() => setMode("register")} aria-selected={mode === "register"}>
                    Create Account
                  </Button>
                </div>
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
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Minimum 6 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Sign in" : "Create account")}
                </Button>
                {error ? (
                  <p className="text-center text-xs text-destructive mt-2">{error}</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    {mode === "login"
                      ? "Local login is enabled. You can also configure VITE_LOGIN_URL for external auth."
                      : "Account is created and session starts immediately upon success."}
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