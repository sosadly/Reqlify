import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

type Size = "sm" | "md";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  size?: Size;
  active?: boolean;
}

const SIZES: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, label, size = "sm", active = false, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-md transition-colors ${
        active
          ? "bg-stone-800 text-fuchsia-300"
          : "text-stone-400 hover:bg-stone-800/70 hover:text-stone-100"
      } ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = "IconButton";
