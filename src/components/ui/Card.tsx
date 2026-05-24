import type { HTMLAttributes } from "react";

export default function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
