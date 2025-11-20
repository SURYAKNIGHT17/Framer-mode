import { motion } from "framer-motion";
import { useMemo } from "react";
import React from "react";

interface TrustScoreGaugeProps {
  score: number;
  statusText: string;
}


/**
 * TrustScoreGauge
 * Renders a circular progress gauge and the dynamic "score/100" label.
 * Accepts numeric `score` and a `statusText` string for the caption.
 */
export function TrustScoreGauge({ score, statusText }: TrustScoreGaugeProps) {
  const { color, gradient } = useMemo(() => {
    if (score >= 75) {
      return {
        color: "hsl(var(--success))",
        gradient: "from-success/20 to-success/5",
      };
    } else if (score >= 50) {
      return {
        color: "hsl(var(--warning))",
        gradient: "from-warning/20 to-warning/5",
      };
    } else {
      return {
        color: "hsl(var(--destructive))",
        gradient: "from-destructive/20 to-destructive/5",
      };
    }
  }, [score]);

  const safeScore = Number.isFinite(score) && score != null ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8"
      data-testid="trust-score-gauge"
    >
      <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${gradient} p-4`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="12"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut", type: "spring", bounce: 0.25 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-hero text-foreground" data-testid="text-trust-score">
              {Math.round(safeScore)}/100
            </div>
          </motion.div>
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-6 text-xl font-semibold text-foreground text-center"
        data-testid="text-status"
      >
        {statusText}
      </motion.p>
    </motion.div>
  );
}
