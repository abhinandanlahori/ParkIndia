import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input id={inputId} className={`${fieldClass} ${className}`} {...props} />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </label>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function TextArea({
  label,
  hint,
  className = "",
  id,
  ...props
}: TextAreaProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <textarea
        id={inputId}
        className={`${fieldClass} resize-none ${className}`}
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </label>
  );
}
