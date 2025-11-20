import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle
 * JellySlider-inspired control to switch between light and dark themes.
 * - Moves a blob-like thumb across a track with smooth transitions
 * - Updates theme via ThemeProvider and persists to localStorage
 * - Provides quick tap targets on Sun/Moon icons to jump ends
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [value, setValue] = useState(theme === "dark" ? 100 : 0);

  // Track and thumb sizes in px based on Tailwind classes: w-36 (144px), h-6 (24px), top/left-1 (4px each)
  const TRACK_WIDTH_PX = 144;
  const THUMB_WIDTH_PX = 24;
  const MARGINS_PX = 8; // left + right margins
  const maxTranslateX = TRACK_WIDTH_PX - THUMB_WIDTH_PX - MARGINS_PX; // 112px

  // Compute whether dark mode is active based on slider value.
  const isDark = useMemo(() => value >= 50, [value]);

  useEffect(() => {
    setTheme(isDark ? "dark" : "light");
  }, [isDark, setTheme]);

  return (
    <div className="relative inline-flex items-center gap-3 select-none">
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium"
        aria-label="Switch to light theme"
        onClick={() => setValue(0)}
      >
        <Sun className="size-4" />
        <span className="sr-only">Light</span>
      </button>

      {/* Slider track with jelly effect */}
      <div
        className="group relative h-8 w-36 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))",
          boxShadow:
            "inset 0 1px 2px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
          backdropFilter: "blur(6px)",
        }}
      >
        <input
          aria-label="Theme toggle"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {/* Jelly thumb */}
        <div
          className="absolute top-1 left-1 h-6 w-6 rounded-full transition-all duration-300 ease-out"
          style={{
            transform: `translateX(${(value / 100) * maxTranslateX}px) scale(${1 +
              Math.sin((value / 100) * Math.PI) * 0.06})`,
            background:
              "radial-gradient(60% 60% at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
            boxShadow:
              "0 6px 14px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.6)",
          }}
        />

        {/* Progress jelly fill */}
        <div
          className="absolute top-1 left-1 h-6 rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${(value / 100) * (TRACK_WIDTH_PX - 8)}px`,
            background: isDark
              ? "linear-gradient(90deg, rgba(72,85,99,0.6), rgba(17,24,39,0.7))"
              : "linear-gradient(90deg, rgba(255,255,255,0.65), rgba(255,255,255,0.35))",
            filter: "blur(0.5px)",
          }}
        />

        {/* Track border */}
        <div className="absolute inset-0 rounded-full ring-1 ring-black/10 dark:ring-white/10" />
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium"
        aria-label="Switch to dark theme"
        onClick={() => setValue(100)}
      >
        <Moon className="size-4" />
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}
