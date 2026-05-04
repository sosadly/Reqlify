import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string; className?: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, className = "", ...rest }, ref) => (
    <select
      ref={ref}
      className={`h-9 cursor-pointer rounded-md bg-stone-900/60 border border-stone-800 px-2 text-sm font-semibold text-stone-100 outline-none focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/30 ${className}`}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className={`bg-stone-900 ${o.className ?? ""}`}>
          {o.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = "Select";
