import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-fuchsia-500 hover:bg-fuchsia-400 text-stone-950 disabled:bg-fuchsia-500/30 disabled:text-stone-300",
  secondary:
    "bg-stone-800 hover:bg-stone-700 text-stone-100 disabled:bg-stone-800/40 disabled:text-stone-500",
  ghost:
    "bg-transparent hover:bg-stone-800/70 text-stone-300 disabled:text-stone-600",
  danger:
    "bg-rose-500/90 hover:bg-rose-400 text-white disabled:bg-rose-500/30",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      icon,
      trailingIcon,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
      {trailingIcon}
    </button>
  ),
);
Button.displayName = "Button";
