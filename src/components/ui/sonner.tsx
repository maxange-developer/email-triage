"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "!bg-[var(--surface)] !border !border-[var(--hairline)] !text-[var(--ink-1)] !rounded-[4px] !shadow-[0_4px_12px_rgba(0,0,0,0.05)] !text-sm",
          error: "!border-[var(--priority-high)]/40 !text-[var(--priority-high)]",
          success: "!border-[var(--accent)]/40 !text-[var(--accent)]",
          info: "!border-[var(--ink-3)] !text-[var(--ink-2)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
