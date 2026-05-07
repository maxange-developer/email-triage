"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Check, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), {
  ssr: false,
});

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function LoginPage() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useI18n();

  function handleSignIn() {
    if (USE_MOCK) {
      router.push("/app");
      return;
    }
    if (rememberMe) {
      document.cookie = "remember_session=true; max-age=31536000; path=/";
    }
    signIn("google", { callbackUrl: "/app" });
  }

  return (
    <>
      <ThreeBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        {/* Login card */}
        <div className="glass border border-neon-green/30 w-full max-w-md p-8 animate-fade-up space-y-6">
          {/* Logo */}
          <Image
            src="/images/logo.webp"
            alt="Angel1"
            width={180}
            height={72}
            className="object-contain w-auto mx-auto my-0"
            priority
          />

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold text-neon-green whitespace-nowrap">
              {t.login.title}
              <span className="text-white">.</span>
            </h1>
            <p className="text-white/60 text-sm">{t.login.subtitle}</p>
          </div>

          {/* Security info */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              {t.login.security_title}
            </p>
            <p className="text-xs text-white/30 leading-relaxed">
              {t.login.security_desc}
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
                "w-4 h-4 border transition-all duration-200",
                "flex items-center justify-center shrink-0",
                rememberMe
                  ? "border-neon-green bg-neon-green/20"
                  : "border-white/30 hover:border-neon-green/50",
              )}
            >
              {rememberMe && <Check size={10} className="text-neon-green" />}
            </button>
            <label
              className="text-white/50 text-sm cursor-pointer hover:text-white/70 transition-colors"
              onClick={() => setRememberMe(!rememberMe)}
            >
              {t.login.remember}
            </label>
          </div>

          {/* Connect button */}
          <button
            onClick={handleSignIn}
            className="w-full h-12 border-2 border-neon-green text-white text-sm font-semibold uppercase tracking-wider relative overflow-hidden hover:text-black transition-all duration-300 group"
          >
            <span className="absolute inset-0 bg-neon-green scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            <span className="relative z-10">{t.login.cta}</span>
          </button>

          {/* Demo bypass — only in mock mode */}
          {USE_MOCK && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/30 text-xs text-center mb-3 uppercase tracking-widest">
                {t.login.demo_label}
              </p>
              <button
                onClick={() => {
                  document.cookie = "mock_bypass=true; path=/";
                  window.location.href = "/app";
                }}
                className="w-full py-2.5 border border-dashed border-white/20 text-white/40 text-sm hover:border-neon-green hover:text-neon-green transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                {t.login.demo_cta}
              </button>
              <p className="text-white/20 text-xs text-center mt-2">
                {t.login.demo_note}
              </p>
            </div>
          )}

          {/* Language switcher — inside card, centered */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-center">
            <LanguageSwitcher flagPriority />
          </div>
        </div>
      </div>
    </>
  );
}
