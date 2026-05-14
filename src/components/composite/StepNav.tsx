import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideContext } from "../../context/SlideContext.tsx";

// ── useStepNav ─────────────────────────────────────────────────────────────
// Manages activeStep (0 = overview, 1…total = steps).
// Binds , / . keyboard shortcuts.
export function useStepNav(total: number) {
  const { stepOverride } = useContext(SlideContext);
  const [stateStep, setStateStep] = useState(0);

  const activeStep = stepOverride !== undefined ? stepOverride : stateStep;

  useEffect(() => {
    if (stepOverride !== undefined) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === ",") setStateStep((s) => (s <= 0 ? total : s - 1));
      if (e.key === ".") setStateStep((s) => (s >= total ? 0 : s + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, stepOverride]);

  function advance() {
    if (stepOverride !== undefined) return;
    setStateStep((s) => (s >= total ? 0 : s + 1));
  }
  function retreat() {
    if (stepOverride !== undefined) return;
    setStateStep((s) => (s <= 0 ? total : s - 1));
  }

  return { activeStep, setActiveStep: setStateStep, advance, retreat };
}

// ── StepNavBar ─────────────────────────────────────────────────────────────
// Bottom navigation bar: ‹ dots › + step counter.
export function StepNavBar({
  activeStep,
  steps,
  onAdvance,
  onRetreat,
  onJump,
  compact = false,
}: {
  activeStep: number;
  steps: { id: number; color: string; rgb: string }[];
  onAdvance: () => void;
  onRetreat: () => void;
  onJump: (step: number) => void;
  /** compact=true → small pill anchored bottom-right; false (default) → large pill centered bottom */
  compact?: boolean;
}) {
  const current = activeStep > 0 ? steps[activeStep - 1] : null;

  const btnSize = compact ? 24 : 34;
  const btnFont = compact ? 13 : 16;
  const dotH = compact ? 7 : 10;
  const dotWActive = compact ? 20 : 28;
  const dotWIdle = compact ? 7 : 10;
  const dotGap = compact ? 4 : 6;
  const labelSize = compact ? 9 : 13;
  const labelMin = compact ? 42 : 52;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        ...(compact
          ? { bottom: 14, right: 14 }
          : { bottom: 24, left: "50%", transform: "translateX(-50%)" }),
        display: "flex",
        alignItems: "center",
        gap: compact ? 8 : 12,
        zIndex: 50,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 40,
        padding: compact ? "5px 12px" : "8px 20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <button
        onClick={onRetreat}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          border: "1.5px solid rgba(0,0,0,0.12)",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: btnFont,
          color: "#374151",
          flexShrink: 0,
        }}
      >
        ‹
      </button>

      <div style={{ display: "flex", gap: dotGap, alignItems: "center" }}>
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            style={{
              width: activeStep === s.id ? dotWActive : dotWIdle,
              height: dotH,
              borderRadius: 5,
              border: "none",
              background: activeStep === s.id ? s.color : "rgba(0,0,0,0.15)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              padding: 0,
              boxShadow:
                activeStep === s.id ? `0 0 8px rgba(${s.rgb},0.6)` : "none",
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: labelSize,
          fontWeight: 700,
          color: current ? current.color : "#9CA3AF",
          minWidth: labelMin,
          textAlign: "center",
          transition: "color 0.2s",
        }}
      >
        {activeStep === 0 ? "Overview" : `Step ${activeStep} / ${steps.length}`}
      </div>

      <button
        onClick={onAdvance}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
          border: "1.5px solid rgba(0,0,0,0.12)",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: btnFont,
          color: "#374151",
          flexShrink: 0,
        }}
      >
        ›
      </button>
    </div>
  );
}

// ── NodeRing ───────────────────────────────────────────────────────────────
// Animated glow ring around a node when it is part of the active step.
export function NodeRing({
  active,
  color,
  rgb,
}: {
  active: boolean;
  color: string;
  rgb: string;
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="ring"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: 38,
            border: `2.5px solid ${color}`,
            boxShadow: `0 0 0 4px ${color}22, 0 0 24px rgba(${rgb},0.5)`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}
    </AnimatePresence>
  );
}
