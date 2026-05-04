import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invisible?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", invisible = false, ...rest }, ref) => {
    const base = invisible
      ? "bg-transparent border-0 px-2 focus:bg-stone-900/60"
      : "bg-stone-900/60 border border-stone-800 px-3 focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/30";
    return (
      <input
        ref={ref}
        className={`h-9 w-full rounded-md text-sm text-stone-100 placeholder:text-stone-500 outline-none transition-colors ${base} ${className}`}
        {...rest}
      />
    );
  },
);
Input.displayName = "Input";
