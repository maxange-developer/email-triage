"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginDevPage() {
  const [rememberMe, setRememberMe] = useState(false);

  function handleGoogleSignIn() {
    if (rememberMe) {
      document.cookie = "remember_session=true; max-age=31536000; path=/";
    }
    signIn("google", { callbackUrl: "/app" });
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">

        {/* Dev warning banner */}
        <div className="mb-6 bg-[var(--priority-medium-bg)] border border-[var(--priority-medium)] rounded-[4px] p-4 flex items-start gap-3">
          <AlertTriangle
            size={16}
            strokeWidth={1.5}
            className="text-[var(--priority-medium)] shrink-0 mt-0.5"
          />
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--priority-medium)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Developer Route
            </p>
            <p className="text-[12px] text-[var(--ink-2)] leading-relaxed">
              Real Google OAuth flow. For testing purposes only. End users
              should use the public demo at <code className="text-[var(--ink-1)]">/login</code>.
            </p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] p-8 md:p-10 space-y-6">
          <div className="flex justify-center mb-2">
            <Image
              src="/images/angel1-black.webp"
              alt="Angel1"
              width={140}
              height={56}
              className="object-contain w-auto"
              priority
            />
          </div>

          <div className="text-center space-y-1">
            <h1
              className="text-[20px] font-medium text-[var(--ink-1)]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Developer sign-in
            </h1>
            <p className="text-[13px] text-[var(--ink-3)]">
              Real Gmail OAuth — requires test user access.
            </p>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={cn(
                "w-4 h-4 border transition-all duration-200 flex items-center justify-center shrink-0 rounded-[2px]",
                rememberMe
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : "border-[var(--ink-3)] hover:border-[var(--accent)]",
              )}
            >
              {rememberMe && <Check size={10} className="text-white" strokeWidth={2.5} />}
            </button>
            <label
              className="text-[var(--ink-2)] text-[13px] cursor-pointer hover:text-[var(--ink-1)] transition-colors"
              onClick={() => setRememberMe(!rememberMe)}
            >
              Remember session (1 year)
            </label>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 rounded-[4px]"
          >
            Continue with Google
          </button>

          <p className="text-[11px] text-[var(--ink-3)] text-center leading-relaxed">
            You will see a Google &quot;unverified app&quot; warning — this is normal in
            Testing mode. Continue past it to test the OAuth flow.
          </p>
        </div>
      </div>
    </div>
  );
}
