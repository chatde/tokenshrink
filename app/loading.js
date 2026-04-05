export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-savings/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-savings" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-savings/50" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <p className="text-xs tracking-[0.25em] uppercase text-text-muted font-mono">
          Compressing...
        </p>
      </div>
    </div>
  );
}
