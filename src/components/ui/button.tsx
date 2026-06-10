import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", children, ...props }: PropsWithChildren<ButtonProps>) {
  const styles = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    secondary: "bg-white text-foreground ring-1 ring-border hover:bg-muted",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
