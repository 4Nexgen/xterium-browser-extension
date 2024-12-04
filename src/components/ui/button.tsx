import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-lg",
        roundedOutline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        violet:"relative w-full py-3 border-4 border-white bg-gradient-to-b from-[#9242AB] via-[#B375DC] to-[#805DC4] text-white font-inter tracking-[0.15em] font-bold text-xs rounded-full transition-all duration-300 hover:from-[#4247AB] hover:via-[#7C75DC] hover:to-[#805DC4]",
        red: "relative w-full py-3 border-4 border-white bg-gradient-to-b from-[#FF5050] via-[#E32525] to-[#E32525] text-white tracking-[0.15em] font-inter font-bold text-xs rounded-full transition-all duration-300 hover:from-[#4247AB] hover:via-[#7C75DC] hover:to-[#805DC4]",
        variant1: "bg-[#64629B] text-white hover:bg-[#64629B]",
        variant2: "py-2 bg-[#64629B] rounded text-white hover:bg-[#64629B]"

      },
      size: {
        default: "h-[50px] px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
