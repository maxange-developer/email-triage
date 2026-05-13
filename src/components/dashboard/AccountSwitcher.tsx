"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "@/contexts/AccountContext";
import { ChevronDown, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";

export default function AccountSwitcher() {
  const { accounts, activeAccount, switchAccount, addAccount } = useAccount();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-[4px] bg-[var(--surface)] border border-[var(--hairline)] hover:border-[var(--hairline-strong)] transition-colors duration-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse shrink-0" />
        <span className="text-[var(--ink-1)] text-sm max-w-[180px] truncate">
          {activeAccount?.emailAddress ?? "Select account"}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={cn(
            "text-[var(--ink-3)] transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 z-50 bg-[var(--surface)] border border-[var(--hairline)] rounded-[4px] min-w-[260px] animate-fade-up"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="p-2">
              <p className="eyebrow px-3 py-2">{t.switcher.accounts}</p>

              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={async () => {
                    await switchAccount(account.id);
                    setOpen(false);
                    if (pathname.startsWith("/app/email/")) {
                      router.push("/app");
                    } else {
                      router.refresh();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors duration-150",
                    account.id === activeAccount?.id
                      ? "bg-[var(--accent-soft)]"
                      : "hover:bg-[var(--surface-2)]",
                  )}
                >
                  <div className="w-8 h-8 rounded-[4px] flex items-center justify-center text-xs font-medium shrink-0 border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)]">
                    {account.emailAddress[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        account.id === activeAccount?.id
                          ? "text-[var(--ink-1)] font-medium"
                          : "text-[var(--ink-2)]",
                      )}
                    >
                      {account.emailAddress}
                    </p>
                    {account.displayName && (
                      <p className="text-[var(--ink-3)] text-xs truncate">
                        {account.displayName}
                      </p>
                    )}
                  </div>

                  {account.id === activeAccount?.id && (
                    <Check
                      size={14}
                      strokeWidth={1.5}
                      className="text-[var(--accent)] shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[var(--hairline)] p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  addAccount();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left hover:bg-[var(--surface-2)] transition-colors duration-150 text-[var(--accent)]"
              >
                <div className="w-8 h-8 rounded-[4px] flex items-center justify-center border border-dashed border-[var(--accent-line)]">
                  <Plus size={14} strokeWidth={1.5} />
                </div>
                <span className="text-sm">{t.switcher.addAccount}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
