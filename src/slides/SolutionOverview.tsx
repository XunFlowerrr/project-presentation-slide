import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect, useContext } from "react";
import { SlideContext } from "../context/SlideContext.tsx";
import {
  SlideHeader,
  SlideShell,
  AnimatedBeam,
  IconBadge,
} from "../components/index.ts";
import { DISTANCE, DURATION, fadeInUp, EASE } from "../lib/motion.ts";

const GLOWS = [
  { top: -200, right: -100, size: 640, color: "124,58,237", opacity: 0.08 },
  { bottom: -150, left: -80, size: 500, color: "16,185,129", opacity: 0.07 },
];

function SVGWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const FrontendIcon = () => (
  <SVGWrap>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </SVGWrap>
);
const WebhookIcon = () => (
  <SVGWrap>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </SVGWrap>
);
const StorageIcon = () => (
  <SVGWrap>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </SVGWrap>
);
const MqIcon = () => (
  <SVGWrap>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </SVGWrap>
);
const IngestIcon = () => (
  <SVGWrap>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </SVGWrap>
);
const EmbeddingIcon = () => (
  <SVGWrap>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </SVGWrap>
);
const AiIcon = () => (
  <SVGWrap>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </SVGWrap>
);
const SharepointIcon = () => (
  <SVGWrap>
    <path d="M4 4h16v16H4z" />
    <circle cx="12" cy="12" r="4" />
  </SVGWrap>
);
const S3Icon = () => (
  <SVGWrap>
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </SVGWrap>
);
const QdrantIcon = () => (
  <SVGWrap>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </SVGWrap>
);

const NS = {
  frontend: {
    color: "#D946EF",
    rgb: "217,70,239",
    grad: ["#C084FC", "#E879F9"] as [string, string],
    label: "Frontend | Backend",
    icon: FrontendIcon,
  },
  webhook: {
    color: "#F87171",
    rgb: "248,113,113",
    grad: ["#F87171", "#FCA5A5"] as [string, string],
    label: "SharePoint Webhook",
    icon: WebhookIcon,
  },
  storage: {
    color: "#818CF8",
    rgb: "129,140,248",
    grad: ["#818CF8", "#A5B4FC"] as [string, string],
    label: "File Storage Service",
    icon: StorageIcon,
  },
  mq: {
    color: "#FB7185",
    rgb: "251,113,133",
    grad: ["#FB7185", "#FDA4AF"] as [string, string],
    label: "Message Queues",
    icon: MqIcon,
  },
  ingestion: {
    color: "#34D399",
    rgb: "52,211,153",
    grad: ["#34D399", "#6EE7B7"] as [string, string],
    label: "Data Ingestion Service",
    icon: IngestIcon,
  },
  embedding: {
    color: "#FBBF24",
    rgb: "251,191,36",
    grad: ["#FBBF24", "#FCD34D"] as [string, string],
    label: "Embedding Service",
    icon: EmbeddingIcon,
  },
  ai: {
    color: "#38BDF8",
    rgb: "56,189,248",
    grad: ["#38BDF8", "#F472B6"] as [string, string],
    label: "Search Flow Service",
    icon: AiIcon,
  },
  sharepoint: {
    color: "#2DD4BF",
    rgb: "45,212,191",
    grad: ["#2DD4BF", "#5EEAD4"] as [string, string],
    label: "SharePoint",
    icon: SharepointIcon,
  },
  s3: {
    color: "#38BDF8",
    rgb: "56,189,248",
    grad: ["#38BDF8", "#7DD3FC"] as [string, string],
    label: "Internal S3 Storage",
    icon: S3Icon,
  },
  qdrant: {
    color: "#A3E635",
    rgb: "163,230,53",
    grad: ["#A3E635", "#BEF264"] as [string, string],
    label: "Vector Database",
    icon: QdrantIcon,
  },
};

// Populate after NS is in scope
const SERVICE_DETAILS: Record<
  keyof typeof NS,
  { subtitle?: string; bullets: string[] }
> = {
  frontend: {
    subtitle: "Next.js 15 / React 19  ·  NestJS API Gateway",
    bullets: [
      "Frontend (apps/web): the web application built with Next.js 15 / React 19 that provides the user-facing chat interface.",
      "Manages authentication state and communicates directly with the Backend Gateway.",
      "Backend (apps/backend): the NestJS API Gateway that acts as the main orchestrator for requests coming from the Frontend.",
      "Manages session state and conversation history using SQLite.",
      "Forwards questions to the Search Flow Service and routes document uploads into the ingestion pipeline.",
    ],
  },
  webhook: {
    subtitle: "Microsoft SharePoint Integration",
    bullets: [
      "Receives webhook events from Microsoft SharePoint.",
      "Detects additions, edits, and deletions inside the configured folder.",
      "Pulls changed files from SharePoint and sends them into the ingestion pipeline automatically.",
      "Keeps enterprise data synchronized continuously from the source system.",
    ],
  },
  storage: {
    subtitle: "MinIO (S3-compatible)",
    bullets: [
      "Handles content lifecycle and workflow status tracking.",
      "Receives uploaded files and stores them in MinIO.",
      "Tracks file states as: PENDING → PROCESSING → COMPLETED → INDEXING.",
      "Publishes async events to RabbitMQ when file storage succeeds.",
      "Sends status updates back to the Backend via webhook so the UI can reflect progress.",
    ],
  },
  mq: {
    subtitle: "RabbitMQ",
    bullets: [
      "Acts as the core asynchronous communication layer inside the platform.",
      "The File Storage Service publishes the file_ready event here.",
      "The Data Ingestion Service consumes the event for downstream processing.",
      "Decouples file storage from document processing to reduce bottlenecks and improve resilience.",
    ],
  },
  ingestion: {
    subtitle: "ETL · OCR · Vision API · Text / Table Extractor",
    bullets: [
      "Transforms unstructured files into searchable vector embeddings.",
      "Reads files and detects content types on each page, including text, images, tables, and scanned PDFs.",
      "Routes work to the right processor, such as OCR, Vision API, or text/table extractors.",
      "Performs hierarchical chunking and summarization.",
      "Passes chunked data to the Embedding Service for vectorization.",
    ],
  },
  embedding: {
    subtitle: "Qdrant · Cosine Similarity · Reranking",
    bullets: [
      "Primary interface for vector-space data operations.",
      "Receives text and computes dense vector embeddings.",
      "Stores vectors and metadata in Qdrant.",
      "Exposes a semantic search API using cosine similarity for the Search Flow Service.",
      "Includes built-in reranking to improve retrieval precision.",
    ],
  },
  ai: {
    subtitle: "FastAPI · CrewAI · LangFuse · OpenTelemetry",
    bullets: [
      "A multi-agent reasoning system built with FastAPI and CrewAI.",
      "Receives the user question and conversation history to plan agent execution.",
      "Supports four retrieval modes: auto, search, lookup, and chat.",
      "Uses Hypothetical Document Embeddings (HyDE) to generate a hypothetical answer and improve retrieval.",
      "Streams real-time answers back to users via Server-Sent Events (SSE).",
      "Tracks LLM and agent activity with Langfuse and OpenTelemetry.",
    ],
  },
  sharepoint: {
    subtitle: "Microsoft SharePoint — primary enterprise knowledge source",
    bullets: [
      "The origin source for internal enterprise documents.",
      "Continuously monitored by the SharePoint Webhook Service.",
      "Triggers the ingestion pipeline when files are added, modified, or deleted.",
    ],
  },
  s3: {
    subtitle: "MinIO — S3-compatible object storage",
    bullets: [
      "Stores original files and intermediate processing artifacts.",
      "Accessed by the File Storage Service and Data Ingestion Service.",
      "Provides scalable object storage decoupled from application logic.",
    ],
  },
  qdrant: {
    subtitle: "High-performance vector database",
    bullets: [
      "Stores dense embeddings generated by the Embedding Service.",
      "Supports semantic similarity search using cosine distance.",
      "Allows the Search Flow Service to retrieve the most relevant content for a user query.",
    ],
  },
};

// ── Service mention chips ──────────────────────────────────────────────────
// Sorted longest-first so greedy scan picks the most specific match.
const SERVICE_MENTIONS: [string, keyof typeof NS][] = [
  ["SharePoint Webhook Service", "webhook"],
  ["File Storage Service", "storage"],
  ["Data Ingestion Service", "ingestion"],
  ["Internal S3 Storage", "s3"],
  ["Search Flow Service", "ai"],
  ["Embedding Service", "embedding"],
  ["SharePoint Webhook", "webhook"],
  ["Backend Gateway", "frontend"],
  ["Message Queues", "mq"],
  ["SharePoint", "sharepoint"],
  ["RabbitMQ", "mq"],
  ["Frontend", "frontend"],
  ["Backend", "frontend"],
  ["Qdrant", "qdrant"],
  ["MinIO", "s3"],
];

function ServiceChip({
  id,
  onNavigate,
}: {
  id: keyof typeof NS;
  onNavigate: (id: keyof typeof NS) => void;
}) {
  const s = NS[id];
  const Icon = s.icon;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onNavigate(id);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px 2px 5px",
        borderRadius: 6,
        background: `rgba(${s.rgb}, 0.12)`,
        border: `1px solid rgba(${s.rgb}, 0.3)`,
        color: s.color,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        verticalAlign: "middle",
        lineHeight: 1.4,
        margin: "0 2px",
      }}
    >
      <span
        style={{
          width: 13,
          height: 13,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            transform: "scale(0.59)",
            transformOrigin: "center",
            display: "flex",
          }}
        >
          <Icon />
        </span>
      </span>
      {s.label}
    </button>
  );
}

function renderBullet(
  text: string,
  selfId: keyof typeof NS,
  onNavigate: (id: keyof typeof NS) => void,
): React.ReactNode {
  type Seg = { start: number; end: number; key: keyof typeof NS };
  const segs: Seg[] = [];
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [phrase, key] of SERVICE_MENTIONS) {
      if (key === selfId) continue;
      if (text.substring(i, i + phrase.length) === phrase) {
        segs.push({ start: i, end: i + phrase.length, key });
        i += phrase.length;
        matched = true;
        break;
      }
    }
    if (!matched) i++;
  }
  if (segs.length === 0) return text;
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const seg of segs) {
    if (pos < seg.start) nodes.push(text.slice(pos, seg.start));
    nodes.push(
      <ServiceChip key={seg.start} id={seg.key} onNavigate={onNavigate} />,
    );
    pos = seg.end;
  }
  if (pos < text.length) nodes.push(text.slice(pos));
  return <>{nodes}</>;
}

type ActiveCard = {
  id: keyof typeof NS;
  left: number;
  top: number;
  width: number;
  height: number;
};

export interface SystemArchitectureDiagramProps {
  allowPopover?: boolean;
  nodeSize?: number;
  gap?: string;
  padding?: string;
  showHeader?: boolean;
  theme?: "light" | "dark";
  disableAnimations?: boolean;
  style?: CSSProperties;
}

function ServicePopover({
  active,
  onClose,
  onNavigate,
}: {
  active: ActiveCard;
  onClose: () => void;
  onNavigate: (id: keyof typeof NS) => void;
}) {
  const POPOVER_W = 520;
  const GAP = 18;
  const MARGIN = 16;
  const ESTIMATED_H = 400;

  const {
    id,
    left: cardLeft,
    top: cardTop,
    width: cardW,
    height: cardH,
  } = active;
  const s = NS[id];
  const d = SERVICE_DETAILS[id];
  const Icon = s.icon;

  const rightAvail = 1920 - (cardLeft + cardW) - GAP;
  const leftAvail = cardLeft - GAP;
  let popLeft: number;
  const openRight = rightAvail >= POPOVER_W;
  if (openRight) {
    popLeft = cardLeft + cardW + GAP;
  } else if (leftAvail >= POPOVER_W) {
    popLeft = cardLeft - GAP - POPOVER_W;
  } else {
    popLeft = Math.max(
      MARGIN,
      Math.min(1920 - POPOVER_W - MARGIN, 960 - POPOVER_W / 2),
    );
  }

  let popTop = cardTop + cardH / 2 - ESTIMATED_H / 2;
  popTop = Math.max(MARGIN, Math.min(1080 - ESTIMATED_H - MARGIN, popTop));

  return (
    <>
      {/* Dim overlay — active card wrapper has z-index 52 so it stays above */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.52)",
          backdropFilter: "blur(3px)",
          zIndex: 50,
        }}
      />
      {/* Popover card */}
      <motion.div
        key="card"
        initial={{ opacity: 0, scale: 0.93, x: openRight ? -12 : 12 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: popLeft,
          top: popTop,
          width: POPOVER_W,
          zIndex: 51,
          background: "#fff",
          borderRadius: 24,
          boxShadow: `0 28px 72px rgba(${s.rgb},0.22), 0 0 0 1.5px rgba(${s.rgb},0.18)`,
          padding: "28px 32px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <IconBadge
            gradient={s.grad}
            shadow={`rgba(${s.rgb},0.4)`}
            size={52}
            radius={14}
          >
            <Icon />
          </IconBadge>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: s.color,
                lineHeight: 1.2,
              }}
            >
              {s.label}
            </div>
            {d.subtitle && (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#64748b",
                  marginTop: 3,
                }}
              >
                {d.subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "rgba(0,0,0,0.04)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, rgba(${s.rgb},0.35), transparent)`,
          }}
        />
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {d.bullets.map((b, i) => (
            <li
              key={i}
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: s.color,
                  flexShrink: 0,
                  marginTop: 10,
                }}
              />
              <span
                style={{ fontSize: 17, color: "#334155", lineHeight: 1.65 }}
              >
                {renderBullet(b, id, onNavigate)}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}

function FlowNode({
  id,
  anchorRef,
  delay = 0,
  onClick,
  size = 188,
  theme = "light",
}: {
  id: keyof typeof NS;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  delay?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  size?: number;
  theme?: "light" | "dark";
}) {
  const s = NS[id];
  const Icon = s.icon;
  const isDark = theme === "dark";
  const borderRadius = Math.round(size * 0.18);
  const badgeSize = Math.round(size * 0.38);
  const badgeRadius = Math.round(size * 0.11);
  const labelFontSize = Math.max(13, Math.round(size * 0.08));
  const labelGap = Math.max(12, Math.round(size * 0.085));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{
        scale: 1.05,
        y: -4,
        boxShadow: isDark
          ? `0 20px 44px rgba(0,0,0,0.32), 0 0 0 1px rgba(${s.rgb},0.3)`
          : `0 16px 40px rgba(${s.rgb},0.4)`,
        zIndex: 20,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 },
      }}
      onClick={onClick}
      transition={{
        duration: 0.2,
        opacity: { delay, duration: DURATION.med, ease: EASE },
      }}
      style={{
        width: size,
        height: size,
        borderRadius,
        border: `1.5px solid rgba(${s.rgb},${isDark ? 0.38 : 0.25})`,
        background: isDark
          ? "linear-gradient(160deg, rgba(16,20,34,0.98), rgba(7,10,20,0.98))"
          : "linear-gradient(135deg, rgba(255,255,255,1), rgba(250,250,250,0.9))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: labelGap,
        boxShadow: isDark
          ? `0 20px 46px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 8px 24px rgba(${s.rgb},0.12)`,
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div ref={anchorRef}>
        <IconBadge
          gradient={s.grad}
          shadow={`rgba(${s.rgb},0.4)`}
          size={badgeSize}
          radius={badgeRadius}
        >
          <Icon />
        </IconBadge>
      </div>
      <div style={{ textAlign: "center", paddingLeft: 8, paddingRight: 8 }}>
        <div
          style={{
            fontSize: labelFontSize,
            fontWeight: 800,
            color: s.color,
            lineHeight: 1.2,
          }}
        >
          {s.label}
        </div>
      </div>
    </motion.div>
  );
}

function PulseRing({
  show,
  color,
  rgb,
  version,
  radius = 34,
}: {
  show: boolean;
  color: string;
  rgb: string;
  version: number;
  radius?: number;
}) {
  if (!show) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={version}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 53,
        }}
      >
        {[0, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut", delay }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radius,
              border: `2px solid ${color}`,
              boxShadow: `0 0 14px 2px rgba(${rgb},0.3)`,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function GridBeam({
  fromRef,
  toRef,
  delay,
  gradientStartColor = "#3B82F6",
  gradientStopColor = "#8B5CF6",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  containerRef,
}: {
  fromRef: React.RefObject<HTMLDivElement | null>;
  toRef: React.RefObject<HTMLDivElement | null>;
  delay: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <AnimatedBeam
      containerRef={containerRef}
      fromRef={fromRef}
      toRef={toRef}
      curvature={0}
      startXOffset={startXOffset}
      startYOffset={startYOffset}
      endXOffset={endXOffset}
      endYOffset={endYOffset}
      gradientStartColor={gradientStartColor}
      gradientStopColor={gradientStopColor}
      pathColor={gradientStartColor}
      pathOpacity={0.25}
      gradientOpacity={0.9}
      pathWidth={3}
      duration={2.8}
      delay={delay}
      repeatDelay={3}
      arrowColor={gradientStartColor}
      showArrow
    />
  );
}

export function SystemArchitectureDiagram({
  allowPopover = true,
  nodeSize = 188,
  gap = "24px 16px",
  padding = "10px 0 30px",
  showHeader = false,
  theme = "light",
  disableAnimations = false,
  style,
}: SystemArchitectureDiagramProps) {
  const [active, setActive] = useState<ActiveCard | null>(null);
  const [pulsingId, setPulsingId] = useState<keyof typeof NS | null>(null);
  const [pulseVersion, setPulseVersion] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";
  const nodeRadius = Math.round(nodeSize * 0.18);
  const serviceLayerBackground = isDark
    ? "linear-gradient(90deg, rgba(124,58,237,0.14), rgba(217,70,239,0.08))"
    : "linear-gradient(90deg, rgba(254,243,199,0.3), rgba(254,226,226,0.3))";
  const serviceLayerBorder = isDark
    ? "1px solid rgba(192,132,252,0.18)"
    : "1px solid rgba(245,158,11,0.2)";
  const serviceLayerLabelColor = isDark ? "#C4B5FD" : "#D97706";
  const storageLayerBackground = isDark
    ? "linear-gradient(90deg, rgba(45,212,191,0.12), rgba(163,230,53,0.08))"
    : "linear-gradient(90deg, rgba(204,251,241,0.4), rgba(220,252,231,0.4))";
  const storageLayerBorder = isDark
    ? "1px solid rgba(52,211,153,0.18)"
    : "1px solid rgba(16,185,129,0.2)";
  const storageLayerLabelColor = isDark ? "#86EFAC" : "#059669";
  const gridHeight = showHeader ? "calc(100% - 108px)" : "100%";
  // Single map of all card anchor refs — keyed by NS id.
  const cardRefs = useRef<
    Partial<Record<keyof typeof NS, HTMLDivElement | null>>
  >({
    frontend: null,
    webhook: null,
    storage: null,
    mq: null,
    ingestion: null,
    embedding: null,
    ai: null,
    sharepoint: null,
    s3: null,
    qdrant: null,
  });
  // Per-card beam anchor refs (kept separate so AnimatedBeam still works)
  const frontendRef = useRef<HTMLDivElement>(null);
  const webhookRef = useRef<HTMLDivElement>(null);
  const storageRef = useRef<HTMLDivElement>(null);
  const mqRef = useRef<HTMLDivElement>(null);
  const ingestRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const sharepointRef = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);
  const qdrantRef = useRef<HTMLDivElement>(null);

  const { stepOverride } = useContext(SlideContext);

  function getCardRect(el: HTMLElement): Omit<ActiveCard, "id"> {
    const measureEl = measureRef.current!;
    const slideRect = measureEl.getBoundingClientRect();
    const scale = slideRect.width / measureEl.offsetWidth;
    const cardBCR = el.getBoundingClientRect();
    return {
      left: (cardBCR.left - slideRect.left) / scale,
      top: (cardBCR.top - slideRect.top) / scale,
      width: cardBCR.width / scale,
      height: cardBCR.height / scale,
    };
  }

  // Called from service chips inside the popover — looks up the real card DOM node.
  function navigateTo(id: keyof typeof NS) {
    const el = cardRefs.current[id];
    if (el) {
      setActive({ id, ...getCardRect(el) });
      setPulsingId(id);
      setPulseVersion((v) => v + 1);
    }
  }

  useEffect(() => {
    if (stepOverride && stepOverride > 0) {
      const timer = setTimeout(() => {
        const order: (keyof typeof NS)[] = [
          "frontend",
          "webhook",
          "storage",
          "mq",
          "ingestion",
          "embedding",
          "ai",
          "sharepoint",
          "s3",
          "qdrant",
        ];
        const id = order[stepOverride - 1];
        if (id) {
          navigateTo(id);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stepOverride]);

  function makeOnClick(id: keyof typeof NS) {
    return (e: React.MouseEvent<HTMLDivElement>) => {
      if (active?.id === id) {
        setActive(null);
        return;
      }
      setActive({ id, ...getCardRect(e.currentTarget) });
    };
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        borderRadius: isDark ? 28 : undefined,
        background: isDark
          ? "radial-gradient(circle at 50% -10%, rgba(124,58,237,0.12), transparent 42%), linear-gradient(180deg, rgba(8,11,20,0.98), rgba(5,8,16,0.96))"
          : undefined,
        ...style,
      }}
    >
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {showHeader && (
        <SlideHeader
          label="Aingo"
          title="Solution"
          highlight="Overview."
          titleSize={64}
          paddingBottom={10}
        />
      )}

      <motion.div
        {...fadeInUp(0.2, { distance: DISTANCE.sm, duration: DURATION.med })}
        ref={containerRef}
        style={{
          width: "100%",
          height: gridHeight,
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap,
          padding,
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {/* Bounding Boxes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          style={{
            gridColumn: "1 / span 6",
            gridRow: 2,
            width: "100%",
            height: "100%",
            background: serviceLayerBackground,
            borderRadius: 24,
            border: serviceLayerBorder,
            position: "relative",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 10,
              fontWeight: 800,
              color: serviceLayerLabelColor,
            }}
          >
            Service Layer
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            gridColumn: "1 / span 5",
            gridRow: 3,
            width: "100%",
            height: "100%",
            background: storageLayerBackground,
            borderRadius: 24,
            border: storageLayerBorder,
            position: "relative",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -18,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 10,
              fontWeight: 800,
              color: storageLayerLabelColor,
            }}
          >
            Storage Layer
          </div>
        </motion.div>

        {/* Row 1 */}
        <div
          ref={(el) => {
            cardRefs.current.frontend = el;
          }}
          style={{
            gridColumn: 6,
            gridRow: 1,
            zIndex: active?.id === "frontend" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "frontend"}
            color={NS.frontend.color}
            rgb={NS.frontend.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="frontend"
            anchorRef={frontendRef}
            delay={0.3}
            onClick={allowPopover ? makeOnClick("frontend") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>

        {/* Row 2 */}
        <div
          ref={(el) => {
            cardRefs.current.webhook = el;
          }}
          style={{
            gridColumn: 1,
            gridRow: 2,
            zIndex: active?.id === "webhook" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "webhook"}
            color={NS.webhook.color}
            rgb={NS.webhook.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="webhook"
            anchorRef={webhookRef}
            delay={0.4}
            onClick={allowPopover ? makeOnClick("webhook") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.storage = el;
          }}
          style={{
            gridColumn: 2,
            gridRow: 2,
            zIndex: active?.id === "storage" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "storage"}
            color={NS.storage.color}
            rgb={NS.storage.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="storage"
            anchorRef={storageRef}
            delay={0.5}
            onClick={allowPopover ? makeOnClick("storage") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.mq = el;
          }}
          style={{
            gridColumn: 3,
            gridRow: 2,
            zIndex: active?.id === "mq" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "mq"}
            color={NS.mq.color}
            rgb={NS.mq.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="mq"
            anchorRef={mqRef}
            delay={0.6}
            onClick={allowPopover ? makeOnClick("mq") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.ingestion = el;
          }}
          style={{
            gridColumn: 4,
            gridRow: 2,
            zIndex: active?.id === "ingestion" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "ingestion"}
            color={NS.ingestion.color}
            rgb={NS.ingestion.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="ingestion"
            anchorRef={ingestRef}
            delay={0.7}
            onClick={allowPopover ? makeOnClick("ingestion") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.embedding = el;
          }}
          style={{
            gridColumn: 5,
            gridRow: 2,
            zIndex: active?.id === "embedding" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "embedding"}
            color={NS.embedding.color}
            rgb={NS.embedding.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="embedding"
            anchorRef={embedRef}
            delay={0.8}
            onClick={allowPopover ? makeOnClick("embedding") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.ai = el;
          }}
          style={{
            gridColumn: 6,
            gridRow: 2,
            zIndex: active?.id === "ai" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "ai"}
            color={NS.ai.color}
            rgb={NS.ai.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="ai"
            anchorRef={aiRef}
            delay={0.9}
            onClick={allowPopover ? makeOnClick("ai") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>

        {/* Row 3 */}
        <div
          ref={(el) => {
            cardRefs.current.sharepoint = el;
          }}
          style={{
            gridColumn: 1,
            gridRow: 3,
            zIndex: active?.id === "sharepoint" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "sharepoint"}
            color={NS.sharepoint.color}
            rgb={NS.sharepoint.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="sharepoint"
            anchorRef={sharepointRef}
            delay={0.45}
            onClick={allowPopover ? makeOnClick("sharepoint") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.s3 = el;
          }}
          style={{
            gridColumn: 3,
            gridRow: 3,
            zIndex: active?.id === "s3" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "s3"}
            color={NS.s3.color}
            rgb={NS.s3.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="s3"
            anchorRef={s3Ref}
            delay={0.65}
            onClick={allowPopover ? makeOnClick("s3") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>
        <div
          ref={(el) => {
            cardRefs.current.qdrant = el;
          }}
          style={{
            gridColumn: 5,
            gridRow: 3,
            zIndex: active?.id === "qdrant" ? 52 : 10,
            position: "relative",
          }}
        >
          <PulseRing
            show={pulsingId === "qdrant"}
            color={NS.qdrant.color}
            rgb={NS.qdrant.rgb}
            version={pulseVersion}
            radius={nodeRadius}
          />
          <FlowNode
            id="qdrant"
            anchorRef={qdrantRef}
            delay={0.85}
            onClick={allowPopover ? makeOnClick("qdrant") : undefined}
            size={nodeSize}
            theme={theme}
          />
        </div>

        {/* Beams */}
        {!disableAnimations && (
          <>
            <GridBeam
              containerRef={containerRef}
              fromRef={sharepointRef}
              toRef={webhookRef}
              gradientStartColor={NS.sharepoint.color}
              gradientStopColor={NS.webhook.color}
              delay={1.0}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={webhookRef}
              toRef={storageRef}
              gradientStartColor={NS.webhook.color}
              gradientStopColor={NS.storage.color}
              delay={1.2}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={storageRef}
              toRef={mqRef}
              gradientStartColor={NS.storage.color}
              gradientStopColor={NS.mq.color}
              delay={1.4}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={mqRef}
              toRef={ingestRef}
              gradientStartColor={NS.mq.color}
              gradientStopColor={NS.ingestion.color}
              delay={1.6}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={ingestRef}
              toRef={embedRef}
              gradientStartColor={NS.ingestion.color}
              gradientStopColor={NS.embedding.color}
              delay={1.8}
            />

            {/* Diagonals */}
            <GridBeam
              containerRef={containerRef}
              fromRef={storageRef}
              toRef={s3Ref}
              gradientStartColor={NS.storage.color}
              gradientStopColor={NS.s3.color}
              delay={2.0}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={s3Ref}
              toRef={ingestRef}
              gradientStartColor={NS.s3.color}
              gradientStopColor={NS.ingestion.color}
              delay={2.2}
            />

            {/* Bidirectional Beams */}
            <GridBeam
              containerRef={containerRef}
              fromRef={embedRef}
              toRef={aiRef}
              gradientStartColor={NS.embedding.color}
              gradientStopColor={NS.ai.color}
              delay={2.4}
              startYOffset={-16}
              endYOffset={-16}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={aiRef}
              toRef={embedRef}
              gradientStartColor={NS.ai.color}
              gradientStopColor={NS.embedding.color}
              delay={2.6}
              startYOffset={16}
              endYOffset={16}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={aiRef}
              toRef={frontendRef}
              gradientStartColor={NS.ai.color}
              gradientStopColor={NS.frontend.color}
              delay={2.8}
              startXOffset={-16}
              endXOffset={-16}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={frontendRef}
              toRef={aiRef}
              gradientStartColor={NS.frontend.color}
              gradientStopColor={NS.ai.color}
              delay={3.0}
              startXOffset={16}
              endXOffset={16}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={embedRef}
              toRef={qdrantRef}
              gradientStartColor={NS.embedding.color}
              gradientStopColor={NS.qdrant.color}
              delay={3.2}
              startXOffset={-16}
              endXOffset={-16}
            />
            <GridBeam
              containerRef={containerRef}
              fromRef={qdrantRef}
              toRef={embedRef}
              gradientStartColor={NS.qdrant.color}
              gradientStopColor={NS.embedding.color}
              delay={3.4}
              startXOffset={16}
              endXOffset={16}
            />
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {allowPopover && active && (
          <ServicePopover
            key={active.id}
            active={active}
            onClose={() => setActive(null)}
            onNavigate={navigateTo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function SolutionOverview() {
  return (
    <SlideShell glows={GLOWS}>
      <SlideHeader
        label="Aingo"
        title="Solution"
        highlight="Overview."
        titleSize={64}
        paddingBottom={10}
      />

      <SystemArchitectureDiagram style={{ flex: 1, height: "100%" }} />
    </SlideShell>
  );
}
