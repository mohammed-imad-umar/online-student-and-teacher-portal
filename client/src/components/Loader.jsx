export default function Loader() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
      <span>Loading...</span>
    </div>
  );
}
