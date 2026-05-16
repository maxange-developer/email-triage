"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import AngelLogo from "@/components/AngelLogo";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const prefersReduced = useReducedMotion();

  function handleEnterDemo() {
    document.cookie = "mock_bypass=true; path=/; max-age=86400";
    router.push("/app");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden">
      {/* Editorial marker — top left */}
      <div
        className="absolute top-6 left-8 hidden md:block"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--ink-4)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Email Triage / v1.0
      </div>

      {/* Editorial marker — bottom right */}
      <div
        className="absolute bottom-6 right-8 hidden md:block"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--ink-4)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        massimilianoangelone.com
      </div>

      {/* Main split */}
      <div className="min-h-screen flex items-center justify-center px-4 lg:px-12 py-12">
        <div className="w-full max-w-[1040px] flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">

          {/* CLAIM — top on mobile, right on desktop */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col justify-center w-full lg:max-w-[500px] order-first lg:order-last text-center lg:text-left"
          >
            <h2
              className="leading-[1.0] lg:leading-[0.98] text-[var(--ink-1)] mb-6 lg:mb-8"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontStyle: "italic",
                letterSpacing: "-0.025em",
                fontSize: "clamp(36px, 7vw, 60px)",
              }}
            >
              Inbox triage,<br />
              <span className="not-italic" style={{ color: "var(--accent)" }}>
                done right.
              </span>
            </h2>

            <p
              className="text-[14px] lg:text-[16px] leading-[1.55] text-[var(--ink-2)] max-w-[440px] mx-auto lg:mx-0"
              style={{ fontWeight: 400 }}
            >
              An AI assistant that reads your mail with the attention you would give it yourself — but without the time you don&apos;t have.
            </p>

            <div
              className="hidden lg:flex mt-12 pt-6 border-t border-[var(--hairline)] items-center gap-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--ink-3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span>Next.js</span>
              <span className="text-[var(--ink-4)]">·</span>
              <span>Supabase</span>
              <span className="text-[var(--ink-4)]">·</span>
              <span>OpenAI</span>
              <span className="text-[var(--ink-4)]">·</span>
              <span>Gmail API</span>
            </div>
          </motion.div>

          {/* CARD — bottom on mobile, left on desktop */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full lg:max-w-[420px] order-last lg:order-first"
          >
            <div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] p-8 md:p-10 space-y-6">
              {/* Logo */}
              <div className="flex justify-center mb-2">
                <AngelLogo size="footer" />
              </div>

              {/* Demo description */}
              <p className="text-[13px] text-[var(--ink-2)] leading-relaxed text-center px-2">
                {t.login.demo_description}
              </p>

              {/* Features list */}
              <div className="pt-2 border-t border-[var(--hairline)] space-y-3">
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--ink-3)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.login.demo_features_label}
                </p>
                <ul className="space-y-2">
                  {[
                    t.login.demo_feature_1,
                    t.login.demo_feature_2,
                    t.login.demo_feature_3,
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[12.5px] text-[var(--ink-2)] leading-relaxed"
                    >
                      <span
                        className="w-[3px] h-[3px] rounded-full bg-[var(--accent)] shrink-0 mt-[7px]"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleEnterDemo}
                className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 rounded-[4px] flex items-center justify-center gap-2 group"
              >
                <span>{t.login.demo_primary_cta}</span>
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>

              {/* Language switcher */}
              <div className="border-t border-[var(--hairline)] pt-4 flex items-center justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
