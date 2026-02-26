import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_2px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:brightness-110",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_2px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:brightness-110",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:brightness-110",
        warning:
          "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:brightness-110",
        accent:
          "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_2px_12px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:brightness-110",
        outline:
          "border border-white/[0.1] bg-white/[0.03] text-slate-300 shadow-xs hover:bg-white/[0.06] hover:text-white hover:border-white/[0.15]",
        secondary:
          "bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white",
        ghost:
          "text-slate-400 hover:bg-white/[0.06] hover:text-white",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
