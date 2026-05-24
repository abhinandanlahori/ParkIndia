import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300",
  secondary:
    "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
  ghost: "text-zinc-600 hover:bg-zinc-100",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
