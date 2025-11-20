import React from "react";

/**
 * LoaderOverlay
 * Displays a full-screen loader animation during network requests or content loading.
 * Use this component when react-query is fetching/mutating or when the UI needs a busy indicator.
 */
export function LoaderOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/60 backdrop-blur-sm">
      <div className="relative h-16 w-16">
        {/* Hungry pig-40 inspired blob loader */}
        <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
          <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
              boxShadow: "0 0 12px hsl(var(--primary) / 0.65)",
            }}
          />
          <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--secondary)), hsl(var(--secondary) / 0.6))",
              boxShadow: "0 0 10px hsl(var(--secondary) / 0.65)",
            }}
          />
          <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--accent)), hsl(var(--accent) / 0.6))",
              boxShadow: "0 0 10px hsl(var(--accent) / 0.65)",
            }}
          />
          <span className="absolute left-1/2 bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--warning)), hsl(var(--warning) / 0.6))",
              boxShadow: "0 0 8px hsl(var(--warning) / 0.65)",
            }}
          />
        </div>
        {/* Center core */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-6 w-6 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, hsl(var(--foreground)), hsl(var(--foreground) / 0.6))",
              boxShadow: "inset 0 2px 4px hsl(var(--foreground) / 0.35)",
            }}
          />
        </div>
      </div>
    </div>
  );
}