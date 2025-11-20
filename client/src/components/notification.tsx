import React, { useEffect } from "react";

export type NotificationVariant = "success" | "error" | "info";

/**
 * Notification
 * Displays a top-right floating notification for execution results.
 * Auto-dismisses after 4 seconds; can be manually closed via onClose.
 */
export function Notification({
  visible,
  title,
  description,
  variant = "info",
  onClose,
}: {
  visible: boolean;
  title: string;
  description?: string;
  variant?: NotificationVariant;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onClose?.(), 4000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  const palette = {
    success: "bg-green-500/90 text-white",
    error: "bg-red-500/90 text-white",
    info: "bg-blue-500/90 text-white",
  }[variant];

  return (
    <div className="fixed top-4 right-4 z-[110]">
      <div className={`min-w-[280px] max-w-[360px] rounded-lg shadow-lg ${palette} p-4 backdrop-blur-sm`}
           style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          <button
            aria-label="Close notification"
            className="text-white/80 hover:text-white"
            onClick={() => onClose?.()}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}