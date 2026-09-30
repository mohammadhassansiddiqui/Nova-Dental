export default function Loader() {
  return (
    <div className="fixed inset-0 z-[5] flex flex-col items-center justify-center bg-canvas pointer-events-none">
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-stone-500 mb-6">
        Calibrating suite geometry
      </div>
      <div className="relative h-px w-48 overflow-hidden bg-stone-800">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-clay animate-[pulse_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
