import { cn } from "./cn";

export default function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("border-b border-slate-100 p-4", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h2 className={cn("text-base font-semibold text-slate-900", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}

