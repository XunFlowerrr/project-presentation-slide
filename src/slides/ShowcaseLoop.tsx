/**
 * ShowcaseLoop.tsx — v2
 *
 * Complete rebuild with:
 * - Custom SVG/DOM beam connectors (no AnimatedBeam dependency)
 * - Per-service activity cards with micro-animations
 * - Corrected AINGO sidebar (light mode: AIQ/XHIVE branding, Sparkles icon)
 * - Fluid morph transitions: icon → chat → node → pipeline → node → chat
 */

import { useEffect, useState, type ReactNode } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconBadge } from "../components/primitives/IconBadge.tsx";
import { SlideShell } from "../components/layout/SlideShell.tsx";
import { EASE } from "../lib/motion.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Phase machine
// ─────────────────────────────────────────────────────────────────────────────

type Phase =
  | "icon"
  | "chat"
  | "typing"
  | "sent"
  | "collapse"
  | "pipeline"
  | "returning"
  | "expand"
  | "answer"
  | "idle";

// How long each phase lasts before advancing (ms)
const PHASE_DURATIONS: Record<Phase, number> = {
  icon: 1000,
  chat: 800,
  typing: 2300,
  sent: 700,
  collapse: 900,
  pipeline: 7600, // 4 hops × 1700ms + 800ms dwell
  returning: 1400,
  expand: 900,
  answer: 7500, // ~283 chars × 22 ms/char ≈ 6200 ms typing + ~1300 ms dwell
  idle: 1800,
};

const PHASE_ORDER: Phase[] = [
  "icon",
  "chat",
  "typing",
  "sent",
  "collapse",
  "pipeline",
  "returning",
  "expand",
  "answer",
  "idle",
];

// ─────────────────────────────────────────────────────────────────────────────
// Local service-node data (subset of NS from SolutionOverview)
// ─────────────────────────────────────────────────────────────────────────────

type ServiceId = "frontend" | "ai" | "embedding" | "qdrant";

interface ServiceNode {
  id: ServiceId;
  label: string;
  sublabel: string;
  color: string;
  rgb: string;
  grad: [string, string];
  icon: () => React.ReactElement;
}

const SVG_WRAP_SIZE = 22;
function SvgWrap({ children }: { children: ReactNode }) {
  return (
    <svg
      width={SVG_WRAP_SIZE}
      height={SVG_WRAP_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function FrontendSvg() {
  return (
    <SvgWrap>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </SvgWrap>
  );
}
function AiSvg() {
  return (
    <SvgWrap>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </SvgWrap>
  );
}
function EmbeddingSvg() {
  return (
    <SvgWrap>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </SvgWrap>
  );
}
function QdrantSvg() {
  return (
    <SvgWrap>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </SvgWrap>
  );
}

const PIPELINE_NODES: ServiceNode[] = [
  {
    id: "frontend",
    label: "Frontend",
    sublabel: "Next.js · NestJS",
    color: "#D946EF",
    rgb: "217,70,239",
    grad: ["#C084FC", "#E879F9"],
    icon: FrontendSvg,
  },
  {
    id: "ai",
    label: "Search Flow",
    sublabel: "CrewAI · ReAct",
    color: "#38BDF8",
    rgb: "56,189,248",
    grad: ["#38BDF8", "#F472B6"],
    icon: AiSvg,
  },
  {
    id: "embedding",
    label: "Embedding",
    sublabel: "BGE-M3 · Qdrant",
    color: "#FBBF24",
    rgb: "251,191,36",
    grad: ["#FBBF24", "#FCD34D"],
    icon: EmbeddingSvg,
  },
  {
    id: "qdrant",
    label: "Vector DB",
    sublabel: "Cosine · Rerank",
    color: "#A3E635",
    rgb: "163,230,53",
    grad: ["#A3E635", "#BEF264"],
    icon: QdrantSvg,
  },
];

const FRONTEND_NODE = PIPELINE_NODES[0];

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter hook
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, msPerChar = 40) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, msPerChar);
    return () => clearInterval(iv);
  }, [active, text, msPerChar]);

  return { displayed, done };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline layout constants
// ─────────────────────────────────────────────────────────────────────────────

const NODE_W = 200;
const NODE_H = 200;
const BEAM_GAP = 100;
const PIPELINE_W = NODE_W * 4 + BEAM_GAP * 3; // 1100
// Expanded "focus card" dimensions
const FOCUS_W = 460;
const FOCUS_H = 360;
const NODE_OFFSET_Y = (FOCUS_H - NODE_H) / 2; // 80 — nodes centred vertically
const BEAM_Y = NODE_OFFSET_Y + NODE_H / 2; // 180 — beam centre-line
const FOCUS_CENTER_X = Math.round((PIPELINE_W - FOCUS_W) / 2); // 320

// Beam tracks: from right edge of node[i] to left edge of node[i+1]
const BEAM_TRACKS = [
  { x: NODE_W, length: BEAM_GAP, from: "#D946EF", to: "#38BDF8" },
  {
    x: NODE_W * 2 + BEAM_GAP,
    length: BEAM_GAP,
    from: "#38BDF8",
    to: "#FBBF24",
  },
  {
    x: NODE_W * 3 + BEAM_GAP * 2,
    length: BEAM_GAP,
    from: "#FBBF24",
    to: "#A3E635",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BeamTrack — custom connector replacing AnimatedBeam
// ─────────────────────────────────────────────────────────────────────────────

function BeamTrack({
  x,
  length,
  active,
  firing,
  fromColor,
  toColor,
}: {
  x: number;
  length: number;
  active: boolean;
  firing: boolean;
  fromColor: string;
  toColor: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: BEAM_Y - 10,
        width: length,
        height: 20,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Dim track */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 9,
          width: "100%",
          height: 2,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 1,
        }}
      />
      {/* Filled gradient beam */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            style={{
              position: "absolute",
              left: 0,
              top: 9,
              width: "100%",
              height: 2,
              background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
              transformOrigin: "left center",
              borderRadius: 1,
            }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.6, 1] }}
          />
        )}
      </AnimatePresence>
      {/* Traveling packet */}
      <AnimatePresence>
        {firing && (
          <motion.div
            key="packet"
            initial={{ x: 0 }}
            animate={{ x: length - 10 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: 0,
              top: 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: `radial-gradient(circle, white 0%, ${toColor} 70%)`,
              boxShadow: `0 0 14px ${toColor}, 0 0 4px white`,
            }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Activity Cards — per-hop micro-animations
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Full-card activity content — rendered inside each expanded pipeline node
// ─────────────────────────────────────────────────────────────────────────────

function ActivityFrontendFull({ node }: { node: ServiceNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBadge
          gradient={node.grad}
          shadow={`rgba(${node.rgb},0.45)`}
          size={44}
          radius={13}
        >
          {(() => {
            const Icon = node.icon;
            return <Icon />;
          })()}
        </IconBadge>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: node.color }}>
            {node.label}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
            HTTP POST /api/chat
          </div>
        </div>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 700,
            color: node.color,
            letterSpacing: "0.08em",
            padding: "3px 9px",
            background: `rgba(${node.rgb},0.1)`,
            borderRadius: 8,
          }}
        >
          LIVE
        </motion.div>
      </div>

      {/* Dispatch flow */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* User */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6B5AE0,#A18FFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
            }}
          >
            U
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
            User
          </div>
        </div>
        {/* Track */}
        <div
          style={{
            flex: 1,
            height: 4,
            background: `rgba(${node.rgb},0.15)`,
            borderRadius: 2,
            position: "relative",
            margin: "0 18px 14px",
          }}
        >
          <motion.div
            animate={{ left: ["4%", "88%"] }}
            transition={{
              duration: 1.0,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
            style={{
              position: "absolute",
              top: -5,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: `radial-gradient(circle, white 0%, ${node.color} 70%)`,
              boxShadow: `0 0 14px ${node.color}`,
            }}
          />
        </div>
        {/* Pipeline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${node.color}, rgba(${node.rgb},0.6))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>
            AI Pipeline
          </div>
        </div>
      </div>

      {/* Query bubble */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        style={{
          padding: "9px 14px",
          background: `rgba(${node.rgb},0.07)`,
          borderRadius: 12,
          border: `1px solid rgba(${node.rgb},0.22)`,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            color: "#94A3B8",
            marginBottom: 3,
            fontWeight: 600,
          }}
        >
          Query dispatched:
        </div>
        <div style={{ fontSize: 12.5, color: "#374151", fontStyle: "italic" }}>
          "Summarize the Q3 leave policy for employees"
        </div>
      </motion.div>
    </div>
  );
}

function ActivityAIFull({ node }: { node: ServiceNode }) {
  const [eyeH, setEyeH] = useState(14);
  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setEyeH(2);
      tid = setTimeout(() => {
        setEyeH(14);
        tid = setTimeout(cycle, 2100 + Math.random() * 1200);
      }, 110);
    };
    tid = setTimeout(cycle, 800);
    return () => clearTimeout(tid);
  }, []);
  const chips = ["HyDE Expansion", "Multi-hop ReAct", "Semantic Routing"];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBadge
          gradient={node.grad}
          shadow={`rgba(${node.rgb},0.45)`}
          size={44}
          radius={13}
        >
          {(() => {
            const Icon = node.icon;
            return <Icon />;
          })()}
        </IconBadge>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: node.color }}>
            {node.label}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
            Multi-hop reasoning
          </div>
        </div>
      </div>

      {/* Robot + thinking panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Robot face */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <motion.div
            animate={{ scale: [1, 1.28, 1], opacity: [0.28, 0, 0.28] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: -24,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${node.rgb},0.5) 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", width: 68, height: 74 }}>
            {/* Antenna stem */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0,
                width: 2.5,
                height: 13,
                background: node.color,
                borderRadius: 2,
              }}
            />
            {/* Antenna ball */}
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.3, repeat: Infinity }}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0,
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: node.color,
                boxShadow: `0 0 10px ${node.color}`,
              }}
            />
            {/* Head */}
            <div
              style={{
                position: "absolute",
                left: 4,
                top: 11,
                width: 60,
                height: 52,
                borderRadius: 13,
                background: "#1e293b",
                border: `2px solid ${node.color}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 50% 40%, rgba(${node.rgb},0.2) 0%, transparent 60%)`,
                }}
              />
              {/* Eyes */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <motion.div
                  animate={{ height: eyeH }}
                  transition={{ duration: 0.06 }}
                  style={{
                    width: 14,
                    borderRadius: 3,
                    background: node.color,
                    boxShadow: `0 0 6px ${node.color}`,
                  }}
                />
                <motion.div
                  animate={{ height: eyeH }}
                  transition={{ duration: 0.06 }}
                  style={{
                    width: 14,
                    borderRadius: 3,
                    background: node.color,
                    boxShadow: `0 0 6px ${node.color}`,
                  }}
                />
              </div>
              {/* Mouth */}
              <div
                style={{
                  position: "absolute",
                  bottom: 9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 26,
                  height: 5,
                  borderRadius: "0 0 13px 13px",
                  background: `rgba(${node.rgb},0.65)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Thinking panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {[0, 0.18, 0.36].map((d) => (
              <motion.div
                key={d}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.65,
                  repeat: Infinity,
                  delay: d,
                  ease: "easeInOut",
                }}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: node.color,
                }}
              />
            ))}
            <span
              style={{
                fontSize: 12,
                color: "#94A3B8",
                fontStyle: "italic",
                marginLeft: 3,
              }}
            >
              Thinking…
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {chips.map((chip, i) => (
              <motion.div
                key={chip}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.3 + i * 0.32,
                  duration: 0.3,
                  ease: EASE,
                }}
                style={{
                  padding: "5px 11px",
                  background: `rgba(${node.rgb},0.1)`,
                  borderRadius: 9,
                  border: `1px solid rgba(${node.rgb},0.28)`,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: node.color,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  width: "fit-content",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: node.color,
                    flexShrink: 0,
                  }}
                />
                {chip}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityEmbeddingFull({ node }: { node: ServiceNode }) {
  const bars = [
    0.45, 0.82, 0.34, 1.0, 0.61, 0.48, 0.91, 0.56, 0.73, 0.39, 0.95, 0.67, 0.52,
    0.86, 0.43, 0.77,
  ];
  const MAX_H = 74;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 13,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBadge
          gradient={node.grad}
          shadow={`rgba(${node.rgb},0.45)`}
          size={44}
          radius={13}
        >
          {(() => {
            const Icon = node.icon;
            return <Icon />;
          })()}
        </IconBadge>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: node.color }}>
            {node.label}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
            text → 768-dim dense vector
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "7px 12px",
          background: "rgba(0,0,0,0.04)",
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: 3,
          }}
        >
          Input text
        </div>
        <div style={{ fontSize: 12, color: "#374151" }}>
          "Summarize the Q3 leave policy for employees"
        </div>
      </div>
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
          }}
        >
          768-dimensional dense vector
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
            height: MAX_H,
          }}
        >
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.038, duration: 0.32, ease: "easeOut" }}
              style={{
                flex: 1,
                height: Math.round(h * MAX_H),
                background: `linear-gradient(180deg, rgba(${node.rgb},${0.45 + h * 0.55}) 0%, rgba(${node.rgb},0.18) 100%)`,
                borderRadius: "3px 3px 0 0",
                transformOrigin: "bottom",
                boxShadow: `0 0 5px rgba(${node.rgb},${h * 0.4})`,
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{ fontSize: 11.5, color: node.color, fontWeight: 600 }}
        >
          ✓ BGE-M3 encoding complete
        </motion.div>
      </div>
    </div>
  );
}

function ActivityQdrantFull({ node }: { node: ServiceNode }) {
  const results = [
    { name: "HR Policy Q3.pdf", score: 94, type: "PDF" },
    { name: "Leave Guidelines.docx", score: 91, type: "DOCX" },
    { name: "HR FAQ Guide.pdf", score: 88, type: "PDF" },
  ];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBadge
          gradient={node.grad}
          shadow={`rgba(${node.rgb},0.45)`}
          size={44}
          radius={13}
        >
          {(() => {
            const Icon = node.icon;
            return <Icon />;
          })()}
        </IconBadge>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: node.color }}>
            {node.label}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
            Semantic similarity search
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: node.color,
            padding: "3px 9px",
            background: `rgba(${node.rgb},0.1)`,
            borderRadius: 8,
          }}
        >
          3 matches
        </motion.div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 11,
          justifyContent: "center",
        }}
      >
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 + i * 0.22, duration: 0.32, ease: EASE }}
            style={{ display: "flex", flexDirection: "column", gap: 5 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: node.color,
                    padding: "1px 5px",
                    background: `rgba(${node.rgb},0.13)`,
                    borderRadius: 4,
                  }}
                >
                  {r.type}
                </div>
                <span
                  style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}
                >
                  {r.name}
                </span>
              </div>
              <span
                style={{ fontSize: 13, fontWeight: 800, color: node.color }}
              >
                {r.score}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: "rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${r.score}%` }}
                transition={{
                  delay: 0.38 + i * 0.22,
                  duration: 0.55,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, rgba(${node.rgb},0.45), ${node.color})`,
                  borderRadius: 3,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15 }}
        style={{
          fontSize: 11,
          color: "#94A3B8",
          textAlign: "center" as const,
          fontStyle: "italic",
        }}
      >
        Top 3 semantic matches retrieved
      </motion.div>
    </div>
  );
}

function renderActivity(idx: number, node: ServiceNode): React.ReactElement {
  switch (idx) {
    case 0:
      return <ActivityFrontendFull node={node} />;
    case 1:
      return <ActivityAIFull node={node} />;
    case 2:
      return <ActivityEmbeddingFull node={node} />;
    default:
      return <ActivityQdrantFull node={node} />;
  }
}

// ServiceActivityCard removed — nodes now expand in-place via PipelineView morph

// ─────────────────────────────────────────────────────────────────────────────
// App Icon View
// ─────────────────────────────────────────────────────────────────────────────

function AppIconContent() {
  return (
    <motion.div
      key="icon-content"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        position: "relative",
      }}
    >
      {/* Pulsing glow rings */}
      {[0, 0.5].map((delay) => (
        <motion.div
          key={delay}
          animate={{ opacity: [0.4, 0], scale: [1, 1.75] }}
          transition={{
            duration: 1.9,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,90,224,0.45) 0%, transparent 70%)",
          }}
        />
      ))}
      {/* Gradient badge with Sparkles icon */}
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #5c4ad3, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(92,74,211,0.55)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="white"
          stroke="none"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path
            d="M20 3v4M22 5h-4M4 17v2M5 18H3"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
      {/* AIQ / XHIVE brand */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#a18fff",
            textTransform: "uppercase" as const,
          }}
        >
          AIQ
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.05em",
          }}
        >
          XHIVE
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Window Mock (AINGO UI)
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_TEXT = "Summarize the Q3 leave policy for employees";
const ANSWER_TEXT =
  "Based on Q3 policy documents in SharePoint, employees are entitled to 10 days of paid annual leave. Additional leave types include sick leave (30 days), parental leave (90 days), and emergency leave (3 days). All requests must be submitted via the HR portal at least 3 days in advance.";

function ChatWindowContent({ phase }: { phase: Phase }) {
  const isTyping = phase === "typing";
  const isSent = phase === "sent";
  const isAnswer = phase === "answer";

  const { displayed: typedQuery } = useTypewriter(QUERY_TEXT, isTyping, 45);
  const { displayed: typedAnswer } = useTypewriter(ANSWER_TEXT, isAnswer, 22);

  // Blink cursor
  const [cursorOn, setCursorOn] = useState(true);
  useEffect(() => {
    if (!isTyping) return;
    const iv = setInterval(() => setCursorOn((v) => !v), 530);
    return () => clearInterval(iv);
  }, [isTyping]);

  return (
    <motion.div
      key="chat-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      {/* ── AINGO Sidebar (light mode: AIQ/XHIVE, Sparkles icon) ─────────── */}
      <div
        style={{
          width: 210,
          flexShrink: 0,
          height: "100%",
          background: "#fcfcfc",
          borderRight: "1px solid #e5e1fb",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 14px 12px",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg, #5c4ad3, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(92,74,211,0.35)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="white"
              stroke="none"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path
                d="M20 3v4M22 5h-4M4 17v2M5 18H3"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#8c7ee1",
                lineHeight: 1,
              }}
            >
              AIQ
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#4a45a0",
                letterSpacing: "0.03em",
              }}
            >
              XHIVE
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "3px 7px",
              borderRadius: 6,
              border: "1px solid #e0dbff",
              fontSize: 9,
              color: "#9a92d8",
              flexShrink: 0,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
            <span>K</span>
          </div>
        </div>

        {/* Nav items */}
        <div
          style={{
            padding: "0 8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {[
            {
              label: "New Chat",
              active: true,
              svgPath:
                "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
              fill: false,
            },
            {
              label: "Source",
              active: false,
              svgPath:
                "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
              fill: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 10px",
                borderRadius: 10,
                background: item.active ? "#efe9ff" : "transparent",
                border: item.active
                  ? "1px solid rgba(107,90,224,0.2)"
                  : "1px solid transparent",
                color: item.active ? "#4a45a0" : "#8f86c8",
                cursor: "default",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.svgPath} />
                {item.label === "Source" && (
                  <polyline points="14 2 14 8 20 8" />
                )}
              </svg>
              <span
                style={{ fontSize: 11, fontWeight: item.active ? 600 : 500 }}
              >
                {item.label}
              </span>
            </div>
          ))}
          {/* Prompt Library with Sparkles icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "7px 10px",
              borderRadius: 10,
              color: "#8f86c8",
              cursor: "default",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500 }}>
              Prompt Library
            </span>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, overflow: "hidden", padding: "0 8px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#9a92d8",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              marginBottom: 7,
              paddingLeft: 4,
            }}
          >
            Chat History
          </div>
          {[
            { title: "Leave Policy Q&A", time: "2h ago" },
            { title: "Employee Benefits", time: "Yesterday" },
            { title: "Q3 Report Summary", time: "3 days ago" },
          ].map((chat) => (
            <div
              key={chat.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 8px",
                borderRadius: 8,
                marginBottom: 2,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8175d4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: "#4a45a0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {chat.title}
                </div>
                <div style={{ fontSize: 9.5, color: "#a19ad9" }}>
                  {chat.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: "1px solid #f0edff",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6b5ae0, #a18fff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            U
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#6661b8" }}>
            User
          </span>
        </div>
      </div>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#F8F8FC",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient orbs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "15%",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(107,90,224,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: "10%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(78,204,163,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(248,248,252,0.95)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #A18FFF, #6B5AE0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(107,90,224,0.35)",
            }}
          >
            AI
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E1B4B" }}>
              Personal Knowledge Manager
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B5AE0",
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              AINGO · SharePoint · Xhive
            </div>
          </div>
        </div>

        {/* Message area */}
        <div
          style={{
            flex: 1,
            overflowY: "hidden",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: !isSent && !isAnswer ? "flex-end" : "flex-start",
          }}
        >
          {/* Welcome state (typing phase) */}
          {(phase === "chat" || isTyping) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1E1B4B",
                  letterSpacing: "-0.02em",
                }}
              >
                WHAT CAN I{" "}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #6B5AE0, #A18FFF, #4ECCA3)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  HELP WITH?
                </span>
              </div>
              <div
                style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}
              >
                Ask anything — your documents, sources, and knowledge, instantly
                reachable.
              </div>
            </motion.div>
          )}

          {/* Sent user bubble */}
          {(isSent || isAnswer) && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  maxWidth: "72%",
                  padding: "10px 16px",
                  borderRadius: "18px 18px 4px 18px",
                  background: "linear-gradient(135deg, #6B5AE0, #8B6BF5)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  boxShadow: "0 4px 16px rgba(107,90,224,0.3)",
                }}
              >
                {QUERY_TEXT}
              </div>
            </motion.div>
          )}

          {/* Thinking indicator */}
          {isSent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #A18FFF, #6B5AE0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                AI
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 0.18, 0.36].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay,
                    }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6B5AE0",
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Answer streaming */}
          {isAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #A18FFF, #6B5AE0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                  marginTop: 2,
                  boxShadow: "0 2px 8px rgba(107,90,224,0.35)",
                }}
              >
                AI
              </div>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: "4px 18px 18px 18px",
                  background: "white",
                  border: "1px solid rgba(107,90,224,0.12)",
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: "#374151",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {typedAnswer}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ marginLeft: 1 }}
                >
                  |
                </motion.span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div
          style={{
            padding: "10px 20px 16px",
            background: "rgba(248,248,252,0.95)",
          }}
        >
          <div
            style={{
              borderRadius: 32,
              border: "1.5px solid rgba(107,90,224,0.28)",
              background: "white",
              boxShadow: "0 8px 40px -12px rgba(102,88,204,0.55)",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minHeight: 44,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 12.5,
                color: isTyping ? "#1E1B4B" : "rgba(107,90,224,0.4)",
                fontWeight: isTyping ? 500 : 400,
                lineHeight: 1.5,
              }}
            >
              {isTyping ? (
                <>
                  {typedQuery}
                  <motion.span
                    animate={{ opacity: cursorOn ? 1 : 0 }}
                    transition={{ duration: 0 }}
                  >
                    |
                  </motion.span>
                </>
              ) : (
                "Ask anything..."
              )}
            </div>
            {/* Send button */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  isTyping || isSent
                    ? "linear-gradient(135deg, #6B5AE0, #A18FFF)"
                    : "rgba(107,90,224,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.3s",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isTyping || isSent ? "white" : "#6B5AE0"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Node Content (hero card during collapse/expand)
// ─────────────────────────────────────────────────────────────────────────────

function ServiceNodeContent({ node }: { node: ServiceNode }) {
  const Icon = node.icon;
  return (
    <motion.div
      key="node-content"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, rgba(${node.rgb},0.13) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <IconBadge
        gradient={node.grad}
        shadow={`rgba(${node.rgb},0.5)`}
        size={72}
        radius={20}
      >
        <Icon />
      </IconBadge>
      <div style={{ textAlign: "center", paddingLeft: 8, paddingRight: 8 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: node.color,
            lineHeight: 1.2,
          }}
        >
          {node.label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#94A3B8",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          {node.sublabel}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline View — custom beams + activity cards
// ─────────────────────────────────────────────────────────────────────────────

function PipelineView({
  pipelineHop,
  returning,
  firingBeam,
}: {
  pipelineHop: number;
  returning: boolean;
  firingBeam: number;
}) {
  const activeIdx = !returning && pipelineHop < 4 ? pipelineHop : -1;

  return (
    <div
      style={{
        position: "relative",
        width: PIPELINE_W,
        height: FOCUS_H,
        flexShrink: 0,
      }}
    >
      {/* ── Beam layer ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {BEAM_TRACKS.map((beam, i) => (
          <BeamTrack
            key={i}
            x={beam.x}
            length={beam.length}
            active={pipelineHop > i && !returning}
            firing={!returning && firingBeam === i}
            fromColor={beam.from}
            toColor={beam.to}
          />
        ))}
        <AnimatePresence>
          {returning && (
            <motion.div
              key="return-beam"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: NODE_W,
                top: BEAM_Y - 4,
                width: NODE_W * 3 + BEAM_GAP * 2,
                height: 8,
                background:
                  "linear-gradient(270deg,#A3E635 0%,#FBBF24 33%,#38BDF8 66%,#D946EF 100%)",
                transformOrigin: "right center",
                borderRadius: 4,
                boxShadow: "0 0 22px rgba(107,90,224,0.6)",
              }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Morph-expand node cards ── */}
      {PIPELINE_NODES.map((node, idx) => {
        const isExpanded = activeIdx === idx;
        const isLit = returning || pipelineHop > idx;
        const nodeLeft = idx * (NODE_W + BEAM_GAP);
        const Icon = node.icon;

        return (
          <motion.div
            key={node.id}
            animate={{
              left: isExpanded ? FOCUS_CENTER_X : nodeLeft,
              top: isExpanded ? 0 : NODE_OFFSET_Y,
              width: isExpanded ? FOCUS_W : NODE_W,
              height: isExpanded ? FOCUS_H : NODE_H,
              borderRadius: isExpanded ? 24 : 34,
              opacity: activeIdx >= 0 && !isExpanded ? 0.2 : 1,
            }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              position: "absolute",
              background: "white",
              border: `1.5px solid rgba(${node.rgb},${isExpanded ? 0.38 : 0.18})`,
              boxShadow: isExpanded
                ? `0 28px 64px rgba(${node.rgb},0.28), 0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(${node.rgb},0.12)`
                : `0 4px 14px rgba(${node.rgb},0.1)`,
              overflow: "hidden",
              zIndex: isExpanded ? 20 : 2,
            }}
          >
            {/* Node-coloured radial bg */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 50% 38%, rgba(${node.rgb},0.06) 0%, transparent 68%)`,
                pointerEvents: "none",
              }}
            />

            {/* Content — cross-fades between small icon and large activity */}
            <AnimatePresence mode="sync">
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, delay: 0.18 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {renderActivity(idx, node)}
                </motion.div>
              ) : (
                <motion.div
                  key="small"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <IconBadge
                    gradient={node.grad}
                    shadow={`rgba(${node.rgb},0.5)`}
                    size={62}
                    radius={18}
                  >
                    <Icon />
                  </IconBadge>
                  <div
                    style={{
                      textAlign: "center",
                      paddingLeft: 8,
                      paddingRight: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: isLit ? node.color : "#94A3B8",
                        lineHeight: 1.2,
                        transition: "color 0.35s",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94A3B8",
                        fontWeight: 500,
                        marginTop: 2,
                      }}
                    >
                      {node.sublabel}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero morph dimensions per phase
// ─────────────────────────────────────────────────────────────────────────────

function heroAnimate(phase: Phase) {
  switch (phase) {
    case "icon":
      return { width: 120, height: 120, borderRadius: 22, opacity: 1 };
    case "chat":
    case "typing":
    case "sent":
    case "answer":
    case "idle":
      return { width: 900, height: 620, borderRadius: 24, opacity: 1 };
    case "collapse":
      return { width: 220, height: 220, borderRadius: 34, opacity: 1 };
    case "pipeline":
    case "returning":
      return { width: 220, height: 220, borderRadius: 34, opacity: 0 };
    case "expand":
      return { width: 900, height: 620, borderRadius: 24, opacity: 1 };
    default:
      return { width: 120, height: 120, borderRadius: 22, opacity: 1 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type HeroContent = "icon" | "chat" | "node";

const PROGRESS_LABELS = ["App", "Chat", "Pipeline", "Answer"];
const PROGRESS_PHASES: Phase[][] = [
  ["icon"],
  ["chat", "typing", "sent", "collapse"],
  ["pipeline", "returning"],
  ["expand", "answer", "idle"],
];

export function ShowcaseLoop() {
  const [phase, setPhase] = useState<Phase>("icon");
  const [pipelineHop, setPipelineHop] = useState(0);
  const [firingBeam, setFiringBeam] = useState(-1);
  const [heroContent, setHeroContent] = useState<HeroContent>("icon");

  // Phase advancement
  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    const timer = setTimeout(() => {
      const idx = PHASE_ORDER.indexOf(phase);
      setPhase(PHASE_ORDER[(idx + 1) % PHASE_ORDER.length]);
    }, duration);
    return () => clearTimeout(timer);
  }, [phase]);

  // heroContent switching
  useEffect(() => {
    switch (phase) {
      case "icon":
        setHeroContent("icon");
        break;
      case "chat":
      case "typing":
      case "sent":
      case "answer":
      case "idle":
        setHeroContent("chat");
        break;
      case "collapse":
        setHeroContent("node");
        break;
      case "expand": {
        setHeroContent("node");
        const t = setTimeout(() => setHeroContent("chat"), 700);
        return () => clearTimeout(t);
      }
      // pipeline / returning: hero is invisible, no change needed
    }
  }, [phase]);

  // Pipeline hop timing — 4 hops × 1700ms
  useEffect(() => {
    if (phase !== "pipeline") {
      if (phase !== "returning") setPipelineHop(0);
      return;
    }
    setPipelineHop(0);
    const timeouts = [1700, 3400, 5100, 6800].map((delay, i) =>
      setTimeout(() => setPipelineHop(i + 1), delay),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  // Beam fire on each hop
  useEffect(() => {
    if (pipelineHop === 0 || pipelineHop > 3) return;
    const beamIdx = pipelineHop - 1;
    setFiringBeam(beamIdx);
    const t = setTimeout(() => setFiringBeam(-1), 700);
    return () => clearTimeout(t);
  }, [pipelineHop]);

  const showPipeline = phase === "pipeline" || phase === "returning";
  const anim = heroAnimate(phase);

  // Progress step
  const progressStep = PROGRESS_PHASES.findIndex((ps) => ps.includes(phase));

  return (
    <SlideShell>
      {/* ── Hero card wrapper (centered, morphing) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <motion.div
          animate={anim}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            overflow: "hidden",
            pointerEvents: "all",
            background:
              heroContent === "icon"
                ? "linear-gradient(135deg, #1a1340 0%, #231b54 100%)"
                : "white",
            boxShadow:
              heroContent === "icon"
                ? "0 0 0 1.5px rgba(107,90,224,0.3), 0 20px 60px rgba(107,90,224,0.4)"
                : "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(107,90,224,0.1)",
          }}
        >
          <AnimatePresence mode="sync">
            {heroContent === "icon" && (
              <motion.div
                key="icon"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppIconContent />
              </motion.div>
            )}
            {heroContent === "chat" && (
              <motion.div key="chat" style={{ position: "absolute", inset: 0 }}>
                <ChatWindowContent phase={phase} />
              </motion.div>
            )}
            {heroContent === "node" && (
              <motion.div key="node" style={{ position: "absolute", inset: 0 }}>
                <ServiceNodeContent node={FRONTEND_NODE} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Pipeline (centered, fades in/out) ── */}
      <AnimatePresence>
        {showPipeline && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <PipelineView
              pipelineHop={pipelineHop}
              returning={phase === "returning"}
              firingBeam={firingBeam}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress pills ── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        {PROGRESS_LABELS.map((label, i) => {
          const active = i === progressStep;
          const done = i < progressStep;
          return (
            <motion.div
              key={label}
              animate={{
                background: active
                  ? "rgba(107,90,224,0.9)"
                  : done
                    ? "rgba(107,90,224,0.35)"
                    : "rgba(0,0,0,0.08)",
                color: active
                  ? "white"
                  : done
                    ? "rgba(107,90,224,0.9)"
                    : "rgba(0,0,0,0.3)",
                scale: active ? 1.08 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                whiteSpace: "nowrap" as const,
              }}
            >
              {label}
            </motion.div>
          );
        })}
      </div>
    </SlideShell>
  );
}
