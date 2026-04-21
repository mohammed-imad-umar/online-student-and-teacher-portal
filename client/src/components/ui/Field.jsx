import { cn } from "./cn";

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}

export function Helper({ className, ...props }) {
  return (
    <p className={cn("text-xs text-slate-500", className)} {...props} />
  );
}

export function ErrorText({ className, ...props }) {
  return (
    <p className={cn("text-xs text-rose-600", className)} {...props} />
  );
}

