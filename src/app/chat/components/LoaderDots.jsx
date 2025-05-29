export function LoaderDots() {
  return (
    <div className="flex items-center justify-start gap-2 h-6 px-3 py-2 bg-neutral-800 rounded-full shadow-inner animate-pulse">
      <span className="loader-dot animate-wave delay-[0ms]" />
      <span className="loader-dot animate-wave delay-[150ms]" />
      <span className="loader-dot animate-wave delay-[300ms]" />
    </div>
  );
}