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
          "bg-gradient-to-r from-[#c9a84c] to-[#e2cc7e] text-[#09090b] shadow-[0_2px_12px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_20px_rgba(201,168,76,0.4)] hover:brightness-110",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_2px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:brightness-110",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-[0_2px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:brightness-110",
        warning:
          "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-[0_2px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:brightness-110",
        accent:
          "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-[0_2px_12px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:brightness-110",
        outline:
          "border border-border bg-transparent text-foreground/70 shadow-xs hover:bg-primary/5 hover:text-foreground hover:border-[rgba(201,168,76,0.2)]",
        secondary:
          "bg-primary/5 text-foreground/70 hover:bg-primary/10 hover:text-foreground",
        ghost:
          "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:brightness-110",
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
