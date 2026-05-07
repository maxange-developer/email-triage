"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "glass border border-white/15 bg-black/80 backdrop-blur-xl text-white text-sm",
          error: "!border-red-500/40 !text-red-400",
          success: "!border-neon-green/40 !text-neon-green",
          info: "!border-neon-blue/40 !text-neon-blue",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
