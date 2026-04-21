import { cn } from "./cn";

export default function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-400",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-400",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 focus-visible:ring-slate-200",
    ghost: "hover:bg-slate-100 focus-visible:ring-slate-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base"
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

