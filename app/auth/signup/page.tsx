"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Info,
} from "lucide-react";
import {
  signUpWithFirebase,
  signInWithGooglePopup,
  isFirebaseConfigured,
  formatFirebaseAuthError,
} from "@/lib/firebase/client";
import { validatePasswordPolicy } from "@/lib/security/password-policy";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time password validation policy checks
  const passwordValidation = useMemo(() => {
    return validatePasswordPolicy(password, email);
  }, [password, email]);

  const passwordChecks = [
    { label: "At least 12 characters", valid: password.length >= 12 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "Number (0-9)", valid: /[0-9]/.test(password) },
    { label: "Special character (!@#$%^&*...)", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the Terms of Service to create an account.");
      return;
    }

    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0] || "Password does not meet security requirements.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create account via Firebase Authentication (Zero manual passwords; automatically dispatches verification email)
      const user = await signUpWithFirebase(email, password, name);

      // 3. Obtain cryptographically signed Firebase ID token
      const idToken = await user.getIdToken();

      // 4. Exchange ID token with DropAI backend to establish secure HttpOnly session
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name,
          action: "signup",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Could not initialize merchant session. Please try again.");
        setLoading(false);
        return;
      }

      // 5. Redirect to email verification enforcement screen
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Signup error:", err);
      // Generic security error handling
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email address already exists. Please sign in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError(err.message || "Could not complete account creation. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const user = await signInWithGooglePopup();
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          action: "google_signup",
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON API response from /api/auth/session:", res.status, text.slice(0, 150));
        throw new Error(`Authentication server returned status ${res.status}. Please refresh and try again.`);
      }

      if (!res.ok || !data.success) {
        setError(data.error || "Google authentication failed. Please try again.");
        setGoogleLoading(false);
        return;
      }

      // Google email addresses are verified by Google directly
      if (user.emailVerified || data.user?.isEmailVerified) {
        router.push("/app/dashboard");
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(user.email || "")}`);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      const friendlyError = formatFirebaseAuthError(err);
      if (friendlyError) {
        setError(friendlyError);
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            DropAI
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create your merchant account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enterprise identity backed by Firebase Authentication &amp; 256-bit encryption.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-medium">
                  Or register with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@yourstore.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password (min. 12 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 12 chars with upper, lower, number, symbol"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Security Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>Security Strength</span>
                    <span
                      className={
                        passwordValidation.strength === "STRONG"
                          ? "text-emerald-500 font-bold"
                          : passwordValidation.strength === "MEDIUM"
                          ? "text-amber-500 font-bold"
                          : "text-rose-500 font-bold"
                      }
                    >
                      {passwordValidation.strength}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordValidation.strength === "STRONG"
                          ? "w-full bg-emerald-500"
                          : passwordValidation.strength === "MEDIUM"
                          ? "w-2/3 bg-amber-500"
                          : "w-1/3 bg-rose-500"
                      }`}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
                    {passwordChecks.map((chk, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${
                          chk.valid
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {chk.valid ? (
                          <Check className="w-3 h-3 shrink-0" />
                        ) : (
                          <X className="w-3 h-3 shrink-0" />
                        )}
                        <span>{chk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline">
                  Privacy Policy
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || !passwordValidation.valid}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {loading ? "Creating Secure Account..." : "Create Merchant Account"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
