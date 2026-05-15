import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import atomPhoto from "../assets/images/profile/atom.jpeg";
import bornPhoto from "../assets/images/profile/born.jpg";
import masPhoto from "../assets/images/profile/mas.jpeg";
import ponPhoto from "../assets/images/profile/pon.jpeg";
import prodPhoto from "../assets/images/profile/prod.jpeg";
import { EASE } from "../lib/motion.ts";
import { SystemArchitectureDiagram } from "./SolutionOverview.tsx";

const SANS = "'Helvetica Neue', 'Avenir Next', 'Segoe UI', sans-serif";
const SERIF = "'Iowan Old Style', 'Baskerville', 'Palatino Linotype', serif";

const CHAPTERS = [
  { index: "00", label: "Prelude" },
  { index: "01", label: "Knowledge Gap" },
  { index: "02", label: "Method" },
  { index: "03", label: "System" },
  { index: "04", label: "Impact" },
  { index: "05", label: "Team" },
];

const HERO_PILLS = [
  "SharePoint grounded",
  "CrewAI orchestrated",
  "Built for enterprise ops",
];

const FRICTION_CARDS = [
  {
    title: "Leave Policy v3",
    lines: [
      "PDF buried in nested folders",
      "No semantic ranking",
      "Staff still ask each other",
    ],
    accent: "#7C3AED",
  },
  {
    title: "Travel Approval SOP",
    lines: [
      "Versions drift by team",
      "Search depends on memory",
      "No synthesized answer",
    ],
    accent: "#EC4899",
  },
  {
    title: "Onboarding Checklist",
    lines: [
      "Scattered across sites",
      "Context lost between links",
      "Manual copy and paste",
    ],
    accent: "#14B8A6",
  },
  {
    title: "IT Access Memo",
    lines: [
      "Keyword search only",
      "No retrieval trace",
      "Slow operational handoff",
    ],
    accent: "#F59E0B",
  },
];

const METHOD_SECTIONS = [
  {
    index: "2.1",
    label: "Reasoning",
    lines: ["Multi-hop ReAct", "Tool orchestration", "CrewAI agents"],
    accent: "#7DD3FC",
  },
  {
    index: "2.2",
    label: "Retrieval",
    lines: ["HyDE expansion", "BGE-M3 embeddings", "Qdrant rerank"],
    accent: "#F9A8D4",
  },
  {
    index: "2.3",
    label: "Delivery",
    lines: ["Chat UI", "Source grounding", "Operational modes"],
    accent: "#86EFAC",
  },
];

const METRICS = [
  { value: "77%", label: "Faithfulness", accent: "#A78BFA" },
  { value: "78%", label: "Factual correctness", accent: "#F472B6" },
  { value: "97%", label: "Task completion", accent: "#34D399" },
  { value: "99%", label: "Tool correctness", accent: "#7DD3FC" },
];

const SYSTEM_CHIPS = [
  "SharePoint Webhook",
  "Message Queues",
  "Data Ingestion",
  "Embedding Service",
  "AI Engine",
  "Vector Database",
];

const TEAM = [
  { name: "Born", photo: bornPhoto, accent: "#A78BFA" },
  { name: "Atom", photo: atomPhoto, accent: "#60A5FA" },
  { name: "Mas", photo: masPhoto, accent: "#F59E0B" },
  { name: "Prod", photo: prodPhoto, accent: "#FB7185" },
  { name: "Pon", photo: ponPhoto, accent: "#34D399" },
];

const TEAM_ROTATION_MS = 2600;

const SECTION_BASE: CSSProperties = {
  position: "relative",
  minHeight: 1080,
  padding: "160px 88px 88px 176px",
  boxSizing: "border-box",
};

function Eyebrow({
  index,
  label,
  color = "rgba(255,244,229,0.78)",
}: {
  index: string;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 28,
        color,
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          fontStyle: "italic",
          lineHeight: 1,
        }}
      >
        {index}
      </span>
      <span
        style={{
          width: 54,
          height: 1,
          background: color,
          opacity: 0.7,
        }}
      />
      <span
        style={{
          fontFamily: SERIF,
          fontSize: 34,
          fontStyle: "italic",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function LandingPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const isAutoScrollingRef = useRef(false);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = scrollContentRef.current;

    if (!wrapper || !content) return;

    const easing = (t: number) => 1 - Math.pow(1 - t, 4);
    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: true,
      smoothWheel: true,
      syncTouch: true,
      duration: 1.1,
      lerp: 0.12,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
      easing,
    });

    lenisRef.current = lenis;

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ── Auto-scroll on inactivity (section-by-section) ───────────────────────
  useEffect(() => {
    const INACTIVITY_MS = 8_000; // idle before starting
    const DWELL_MS = 3_000; // time to stay on each section
    const SCROLL_DURATION = 1.4; // Lenis scrollTo duration (seconds)
    const LOOP_PAUSE_MS = 600; // pause after jump-to-top before restarting

    const wrapper = scrollRef.current;
    const content = scrollContentRef.current;
    if (!wrapper || !content) return;

    let inactivityTimer: ReturnType<typeof window.setTimeout> | null = null;
    let stepTimer: ReturnType<typeof window.setTimeout> | null = null;

    const getSections = () =>
      Array.from(content.querySelectorAll<HTMLElement>("[data-snap-section]"));

    const scrollToSection = (idx: number) => {
      if (!isAutoScrollingRef.current) return;
      const sections = getSections();
      if (!sections.length) return;
      const lenis = lenisRef.current;
      const target = sections[idx]?.offsetTop ?? 0;

      if (lenis) {
        lenis.scrollTo(target, {
          duration: SCROLL_DURATION,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else {
        wrapper.scrollTop = target;
      }

      // After the animation finishes + dwell time, advance to next section
      stepTimer = window.setTimeout(
        () => {
          if (!isAutoScrollingRef.current) return;
          const nextIdx = idx + 1;
          if (nextIdx >= sections.length) {
            // End of loop — jump instantly to top, then restart
            if (lenis) {
              lenis.scrollTo(0, { immediate: true });
            } else {
              wrapper.scrollTop = 0;
            }
            stepTimer = window.setTimeout(() => {
              if (isAutoScrollingRef.current) scrollToSection(0);
            }, LOOP_PAUSE_MS);
          } else {
            scrollToSection(nextIdx);
          }
        },
        SCROLL_DURATION * 1000 + DWELL_MS,
      );
    };

    const startAutoScroll = () => {
      isAutoScrollingRef.current = true;
      // Resume from the closest section ahead of current scroll position
      const sections = getSections();
      const currentTop = wrapper.scrollTop;
      let startIdx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= currentTop + 40) startIdx = i;
      }
      // Start from next section unless we're already at the very top
      const resumeIdx = currentTop < 40 ? 0 : (startIdx + 1) % sections.length;
      scrollToSection(resumeIdx);
    };

    const stopAutoScroll = () => {
      isAutoScrollingRef.current = false;
      if (stepTimer !== null) {
        clearTimeout(stepTimer);
        stepTimer = null;
      }
    };

    const onActivity = () => {
      if (isAutoScrollingRef.current) stopAutoScroll();
      if (inactivityTimer !== null) clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(startAutoScroll, INACTIVITY_MS);
    };

    const EVENTS = [
      "wheel",
      "touchstart",
      "mousedown",
      "keydown",
      "pointerdown",
    ] as const;
    EVENTS.forEach((ev) =>
      wrapper.addEventListener(ev, onActivity, { passive: true }),
    );

    inactivityTimer = window.setTimeout(startAutoScroll, INACTIVITY_MS);

    return () => {
      stopAutoScroll();
      if (inactivityTimer !== null) clearTimeout(inactivityTimer);
      EVENTS.forEach((ev) => wrapper.removeEventListener(ev, onActivity));
    };
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      const nextChapter = Math.min(
        CHAPTERS.length - 1,
        Math.round(value * (CHAPTERS.length - 1)),
      );

      setActiveChapter((current) =>
        current === nextChapter ? current : nextChapter,
      );
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveTeamIndex((current) => (current + 1) % TEAM.length);
    }, TEAM_ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroLift = useTransform(scrollYProgress, [0, 0.18], [0, -110]);
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.91]);
  const heroFade = useTransform(scrollYProgress, [0, 0.18], [1, 0.18]);
  const blueGlowOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.28],
    [0.98, 0.55, 0],
  );
  const coralGlowOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.36, 0.56],
    [0, 0.8, 0.16],
  );
  const mintGlowOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.82, 1],
    [0, 0.34, 0.76],
  );
  const systemScale = useTransform(
    scrollYProgress,
    [0.44, 0.64, 0.8],
    [0.9, 1, 0.96],
  );
  const systemRotate = useTransform(scrollYProgress, [0.42, 0.68], [-7, 0]);
  const closingPhotoY = useTransform(scrollYProgress, [0.75, 1], [120, -18]);
  const activeTeam = TEAM[activeTeamIndex];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#090914",
        color: "#FFF4E5",
        fontFamily: SANS,
      }}
    >
      <style>{`
        .landing-scroll {
          height: 100%;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: none;
          touch-action: pan-y;
        }

        .landing-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .landing-photo-strip img {
          display: block;
        }
      `}</style>

      <motion.div
        style={{
          position: "absolute",
          inset: -160,
          opacity: blueGlowOpacity,
          background:
            "radial-gradient(circle at 18% 26%, rgba(123,245,225,0.72), transparent 17%), radial-gradient(circle at 82% 26%, rgba(123,245,225,0.72), transparent 16%), radial-gradient(circle at 20% 78%, rgba(123,245,225,0.7), transparent 18%), radial-gradient(circle at 82% 80%, rgba(123,245,225,0.72), transparent 18%), radial-gradient(circle at 50% 55%, rgba(76,76,220,0.44), transparent 30%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: -140,
          opacity: coralGlowOpacity,
          background:
            "radial-gradient(circle at 26% 24%, rgba(255,232,243,0.72), transparent 15%), radial-gradient(circle at 74% 26%, rgba(255,232,243,0.72), transparent 15%), radial-gradient(circle at 48% 56%, rgba(255,209,227,0.56), transparent 24%), radial-gradient(circle at 18% 82%, rgba(255,215,226,0.44), transparent 17%), radial-gradient(circle at 84% 78%, rgba(255,215,226,0.44), transparent 17%)",
          filter: "blur(54px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: -140,
          opacity: mintGlowOpacity,
          background:
            "radial-gradient(circle at 18% 22%, rgba(196,181,253,0.38), transparent 18%), radial-gradient(circle at 78% 28%, rgba(52,211,153,0.34), transparent 20%), radial-gradient(circle at 50% 82%, rgba(125,211,252,0.28), transparent 23%)",
          filter: "blur(52px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "100% 220px, 220px 100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.045,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 28,
          left: 34,
          right: 34,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(8,10,20,0.42)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            AiQ
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,244,229,0.52)",
            }}
          >
            AiQ / Enterprise Knowledge Platform
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(255,244,229,0.5)",
            }}
          >
            SharePoint / RAG / CrewAI / 2026
          </span>
          <div style={{ display: "grid", gap: 6 }}>
            <span
              style={{
                width: 38,
                height: 2,
                background: "#FFF4E5",
                borderRadius: 999,
              }}
            />
            <span
              style={{
                width: 38,
                height: 2,
                background: "#FFF4E5",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 36,
          top: 148,
          bottom: 54,
          zIndex: 4,
          width: 116,
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CHAPTERS.map((chapter, index) => {
            const isActive = index === activeChapter;

            return (
              <div
                key={chapter.index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  opacity: isActive ? 1 : 0.32,
                  transform: `translateX(${isActive ? 0 : -4}px)`,
                  transition: "opacity 220ms ease, transform 220ms ease",
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 21,
                    fontStyle: "italic",
                    lineHeight: 1,
                  }}
                >
                  {chapter.index}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,244,229,0.7)",
                  }}
                >
                  {chapter.label}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "relative",
            width: 1,
            flex: 1,
            margin: "18px 0 18px 12px",
            background: "rgba(255,244,229,0.14)",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, #FFF4E5 0%, #7C3AED 55%, #34D399 100%)",
              transformOrigin: "top center",
              scaleY: progressScale,
            }}
          />
        </div>

        <div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1px solid rgba(255,244,229,0.42)",
              display: "grid",
              placeItems: "center",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#FFF4E5",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,244,229,0.46)",
            }}
          >
            Scroll to explore
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="landing-scroll"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div ref={scrollContentRef}>
          <section
            data-snap-section
            style={{
              ...SECTION_BASE,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.15fr) 430px",
              gap: 52,
              alignItems: "center",
            }}
          >
            <motion.div
              style={{ y: heroLift, scale: heroScale, opacity: heroFade }}
            >
              <Eyebrow index="00" label="Prelude" />

              <div
                style={{
                  fontSize: 138,
                  lineHeight: 0.86,
                  fontWeight: 700,
                  letterSpacing: "-0.065em",
                  maxWidth: 980,
                }}
              >
                <div>KNOWLEDGE</div>
                <div style={{ color: "rgba(255,244,229,0.62)" }}>THAT</div>
                <div>DRIVES</div>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                  <span>EXECUTION</span>
                  <motion.div
                    animate={{ y: [0, -18, 0], rotate: [-5, 0, -5] }}
                    transition={{
                      duration: 7.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: 186,
                      height: 142,
                      borderRadius: 34,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(14, 16, 29, 0.55)",
                      boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
                      backdropFilter: "blur(18px)",
                      flexShrink: 0,
                    }}
                  >
                    {/* App icon — mirrors ShowcaseLoop AppIconContent */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #5c4ad3, #8b5cf6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 8px 32px rgba(92,74,211,0.55)",
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            color: "#a18fff",
                            textTransform: "uppercase",
                          }}
                        >
                          AIQ
                        </span>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "rgba(255,255,255,0.92)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          AINGO
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <p
                style={{
                  width: 560,
                  margin: "34px 0 28px",
                  fontSize: 19,
                  lineHeight: 1.7,
                  color: "rgba(255,244,229,0.56)",
                }}
              >
                AiQ turns SharePoint into an answer layer - grounded by
                retrieval, driven by agents, and staged as an operational
                product instead of a static search bar.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {HERO_PILLS.map((pill) => (
                  <span
                    key={pill}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.045)",
                      fontSize: 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "rgba(255,244,229,0.78)",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.95, ease: EASE, delay: 0.15 }}
              style={{
                alignSelf: "stretch",
                display: "grid",
                gap: 18,
              }}
            >
              <div
                style={{
                  borderRadius: 36,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(12, 14, 24, 0.52)",
                  backdropFilter: "blur(18px)",
                  padding: 26,
                  boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,244,229,0.45)",
                    marginBottom: 16,
                  }}
                >
                  Deck pulse
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    {
                      label: "Problem",
                      value: "Knowledge trapped in SharePoint silos",
                    },
                    {
                      label: "Approach",
                      value: "ReAct + HyDE + BGE-M3 + Qdrant",
                    },
                    {
                      label: "System",
                      value: "5 services wired for retrieval and delivery",
                    },
                    {
                      label: "Validation",
                      value: "231 evaluations across key RAGAS metrics",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        paddingBottom: 14,
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,244,229,0.32)",
                          marginBottom: 6,
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: 18, lineHeight: 1.4 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { value: "5", label: "Services" },
                  { value: "2026", label: "Project year" },
                  { value: "Beta", label: "System status" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "18px 16px",
                      borderRadius: 28,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.045)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 34,
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: 9.5,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,244,229,0.45)",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 48,
                transform: "translateX(-50%)",
                display: "grid",
                justifyItems: "center",
                gap: 12,
                color: "rgba(255,244,229,0.62)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Scroll to explore
              </span>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,244,229,0.7)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#FFF4E5",
                  }}
                />
              </div>
              <div
                style={{
                  width: 1,
                  height: 78,
                  background: "rgba(255,244,229,0.55)",
                }}
              />
            </div>
          </section>

          <section
            data-snap-section
            style={{
              ...SECTION_BASE,
              background:
                "linear-gradient(180deg, rgba(255,130,126,0.76) 0%, rgba(227,98,100,0.82) 100%)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
                gap: 54,
                alignItems: "center",
              }}
            >
              <div style={{ color: "#FFF7EF" }}>
                <Eyebrow
                  index="01"
                  label="Knowledge Gap"
                  color="rgba(255,247,239,0.82)"
                />
                <div
                  style={{
                    fontSize: 116,
                    lineHeight: 0.88,
                    fontWeight: 700,
                    letterSpacing: "-0.06em",
                    maxWidth: 720,
                  }}
                >
                  <div>TOO MANY</div>
                  <div>FILES.</div>
                  <div style={{ color: "rgba(255,247,239,0.66)" }}>
                    NOT ENOUGH
                  </div>
                  <div>CONTEXT.</div>
                </div>
                <p
                  style={{
                    width: 490,
                    margin: "28px 0 36px",
                    fontSize: 18,
                    lineHeight: 1.75,
                    color: "rgba(255,247,239,0.72)",
                  }}
                >
                  Before AiQ, answers were buried across sites, folders,
                  policies, and ad-hoc docs. The work was not finding
                  information - it was reconstructing meaning from fragments.
                </p>

                <div style={{ display: "flex", gap: 28 }}>
                  {["Manual digging", "Version drift", "Broken handoffs"].map(
                    (item) => (
                      <div key={item}>
                        <div
                          style={{
                            fontSize: 9.5,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "rgba(255,247,239,0.52)",
                            marginBottom: 6,
                          }}
                        >
                          Friction
                        </div>
                        <div style={{ fontSize: 19 }}>{item}</div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div style={{ position: "relative", height: 710 }}>
                {FRICTION_CARDS.map((card, index) => (
                  <motion.div
                    key={card.title}
                    animate={{
                      y: [0, -18 + index * 3, 0],
                      rotate: [-7 + index * 3, -3 + index * 2, -7 + index * 3],
                    }}
                    transition={{
                      duration: 8 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      width: 300,
                      padding: 24,
                      borderRadius: 28,
                      background: "rgba(255,247,239,0.86)",
                      color: "#2C1B18",
                      boxShadow: "0 30px 90px rgba(88, 30, 34, 0.22)",
                      border: `1px solid ${card.accent}33`,
                      top: [20, 160, 336, 470][index],
                      left: [42, 288, 112, 352][index],
                      transform: `rotate(${[-6, 5, -3, 7][index]}deg)`,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: `${card.accent}16`,
                        color: card.accent,
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        marginBottom: 14,
                      }}
                    >
                      Source fragment
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: 14,
                      }}
                    >
                      {card.title}
                    </div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {card.lines.map((line) => (
                        <div
                          key={line}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: card.accent,
                              marginTop: 9,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 15 }}>{line}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section
            data-snap-section
            style={{
              ...SECTION_BASE,
              background:
                "linear-gradient(180deg, rgba(214,89,97,0.3) 0%, rgba(239,118,144,0.12) 44%, rgba(7,6,15,0.72) 100%)",
            }}
          >
            <Eyebrow index="02" label="Method" />

            <div
              style={{
                marginTop: 34,
                borderTop: "1px solid rgba(255,244,229,0.12)",
              }}
            >
              {METHOD_SECTIONS.map((section, index) => (
                <div
                  key={section.index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "130px 220px minmax(0, 1fr)",
                    gap: 26,
                    alignItems: "start",
                    padding: "34px 0",
                    borderBottom: "1px solid rgba(255,244,229,0.12)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 28,
                      fontStyle: "italic",
                      color: section.accent,
                      lineHeight: 1,
                    }}
                  >
                    {section.index}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 34,
                      fontStyle: "italic",
                      color: "rgba(255,244,229,0.76)",
                      lineHeight: 1,
                      marginTop: 2,
                    }}
                  >
                    {section.label}
                  </div>
                  <div>
                    {section.lines.map((line, lineIndex) => (
                      <motion.div
                        key={line}
                        initial={{ opacity: 0.55, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: 0.08 * (index + lineIndex),
                          ease: EASE,
                        }}
                        style={{
                          fontSize: 102,
                          lineHeight: 0.95,
                          fontWeight: 700,
                          letterSpacing: "-0.065em",
                          color:
                            lineIndex === section.lines.length - 1
                              ? "rgba(255,244,229,0.56)"
                              : "#FFF4E5",
                          marginBottom: 8,
                        }}
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section data-snap-section style={{ ...SECTION_BASE }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "430px minmax(0, 1fr)",
                gap: 48,
                alignItems: "center",
              }}
            >
              <div>
                <Eyebrow index="03" label="System" />
                <div
                  style={{
                    fontSize: 96,
                    lineHeight: 0.92,
                    fontWeight: 700,
                    letterSpacing: "-0.06em",
                    marginBottom: 24,
                  }}
                >
                  ORCHESTRATED AS A SERVICE STACK.
                </div>
                <p
                  style={{
                    margin: 0,
                    maxWidth: 380,
                    fontSize: 18,
                    lineHeight: 1.75,
                    color: "rgba(255,244,229,0.58)",
                  }}
                >
                  The platform is staged as a real system - webhook entry,
                  ingestion, queues, embeddings, vector search, and an answer
                  engine that can operate as a product layer instead of a demo.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 30,
                  }}
                >
                  {SYSTEM_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.045)",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,244,229,0.72)",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <motion.div
                style={{
                  position: "relative",
                  scale: systemScale,
                  rotate: systemRotate,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -18,
                    borderRadius: 44,
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(52,211,153,0.22))",
                    filter: "blur(24px)",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    borderRadius: 40,
                    padding: 24,
                    background: "rgba(12,14,24,0.78)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(18px)",
                    boxShadow: "0 34px 100px rgba(0,0,0,0.28)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      { label: "Live architecture", accent: "#A78BFA" },
                      { label: "5 services", accent: "#34D399" },
                    ].map((tag) => (
                      <span
                        key={tag.label}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          background: "rgba(7,6,15,0.78)",
                          border: `1px solid ${tag.accent}66`,
                          color: "#FFF4E5",
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                        }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      borderRadius: 28,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(124,58,237,0.06))",
                      overflow: "hidden",
                      padding: "14px 12px 10px",
                    }}
                  >
                    <SystemArchitectureDiagram
                      allowPopover={false}
                      showHeader={false}
                      theme="dark"
                      disableAnimations
                      nodeSize={136}
                      gap="12px 10px"
                      padding="8px 4px 0"
                      style={{ height: 540 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section
            data-snap-section
            style={{
              ...SECTION_BASE,
              background:
                "linear-gradient(180deg, rgba(14,16,28,0.56) 0%, rgba(9,9,20,0.9) 100%)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "520px minmax(0, 1fr)",
                gap: 40,
                alignItems: "start",
              }}
            >
              <div>
                <Eyebrow index="04" label="Impact" />
                <div
                  style={{
                    fontSize: 104,
                    lineHeight: 0.9,
                    fontWeight: 700,
                    letterSpacing: "-0.06em",
                    marginBottom: 24,
                  }}
                >
                  VALIDATED IN MOTION.
                </div>
                <p
                  style={{
                    margin: 0,
                    maxWidth: 420,
                    fontSize: 18,
                    lineHeight: 1.72,
                    color: "rgba(255,244,229,0.58)",
                  }}
                >
                  Performance was not framed as a single demo moment. The system
                  was measured across grounded answers, factual quality,
                  completion, and tool usage so the product could graduate from
                  concept to operation.
                </p>

                <div style={{ display: "grid", gap: 14, marginTop: 34 }}>
                  {[
                    "231 evaluation passes across the RAG stack",
                    "99% tool correctness under agent orchestration",
                    "97% task completion for operational requests",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 22,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.045)",
                        fontSize: 15,
                        lineHeight: 1.55,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                }}
              >
                {METRICS.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    animate={{ y: [0, index % 2 === 0 ? -10 : -16, 0] }}
                    transition={{
                      duration: 7 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      padding: "26px 24px 24px",
                      borderRadius: 28,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      minHeight: 188,
                    }}
                  >
                    <div
                      style={{
                        fontSize: metric.value.length > 3 ? 68 : 74,
                        lineHeight: 0.95,
                        fontWeight: 700,
                        letterSpacing: "-0.06em",
                        color: metric.accent,
                      }}
                    >
                      {metric.value}
                    </div>
                    <div
                      style={{
                        marginTop: 18,
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,244,229,0.46)",
                      }}
                    >
                      {metric.label}
                    </div>
                  </motion.div>
                ))}

                <div
                  style={{
                    gridColumn: "1 / span 2",
                    borderRadius: 32,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(52,211,153,0.1))",
                    padding: 26,
                    minHeight: 188,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 24,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,244,229,0.46)",
                          marginBottom: 12,
                        }}
                      >
                        Product reading
                      </div>
                      <div
                        style={{
                          maxWidth: 560,
                          fontSize: 34,
                          lineHeight: 1.15,
                          fontWeight: 600,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        People stop hunting through folders. They ask once, get
                        a grounded answer, and keep moving.
                      </div>
                    </div>

                    <div
                      style={{
                        width: 150,
                        padding: 14,
                        borderRadius: 22,
                        background: "rgba(7,6,15,0.38)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 52,
                          fontWeight: 700,
                          letterSpacing: "-0.06em",
                          color: "#34D399",
                        }}
                      >
                        A+
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(255,244,229,0.46)",
                        }}
                      >
                        Interaction confidence
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            data-snap-section
            style={{
              ...SECTION_BASE,
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.94fr) minmax(0, 1.06fr)",
              gap: 44,
              alignItems: "center",
            }}
          >
            <div>
              <Eyebrow index="05" label="Team" />
              <div
                style={{
                  fontSize: 112,
                  lineHeight: 0.88,
                  fontWeight: 700,
                  letterSpacing: "-0.065em",
                  marginBottom: 26,
                }}
              >
                BUILT BY FIVE ENGINEERS.
                <br />
                READY FOR THE NEXT RELEASE.
              </div>
              <p
                style={{
                  maxWidth: 470,
                  margin: "0 0 30px",
                  fontSize: 18,
                  lineHeight: 1.75,
                  color: "rgba(255,244,229,0.58)",
                }}
              >
                Five engineers built every layer from scratch — from SharePoint
                ingestion and message queues to vector search, embedding, and
                the agent orchestration layer.
              </p>

              <div
                className="landing-photo-strip"
                style={{ display: "grid", gap: 16 }}
              >
                {TEAM.map((member, index) => {
                  const isActive = index === activeTeamIndex;

                  return (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => setActiveTeamIndex(index)}
                      onMouseEnter={() => setActiveTeamIndex(index)}
                      onFocus={() => setActiveTeamIndex(index)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 24,
                        border: isActive
                          ? `1px solid ${member.accent}88`
                          : "1px solid rgba(255,255,255,0.1)",
                        background: isActive
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.045)",
                        boxShadow: isActive
                          ? `0 18px 44px ${member.accent}22`
                          : "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          padding: 2,
                          background: `linear-gradient(135deg, ${member.accent}, rgba(255,255,255,0.3))`,
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={member.photo}
                          alt={member.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 600,
                            lineHeight: 1.1,
                            color: "#FFF4E5",
                          }}
                        >
                          {member.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "rgba(255,244,229,0.42)",
                            marginTop: 4,
                          }}
                        >
                          AiQ core team
                        </div>
                      </div>
                      <div
                        style={{
                          marginLeft: "auto",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: isActive
                            ? member.accent
                            : "rgba(255,255,255,0.18)",
                          boxShadow: isActive
                            ? `0 0 18px ${member.accent}`
                            : "none",
                          flexShrink: 0,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div style={{ y: closingPhotoY }}>
              <div
                style={{
                  position: "relative",
                  height: 760,
                  borderRadius: 40,
                  overflow: "hidden",
                  border: `1px solid ${activeTeam.accent}55`,
                  boxShadow: `0 34px 100px ${activeTeam.accent}22`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeTeam.name}
                    src={activeTeam.photo}
                    alt={`${activeTeam.name} portrait`}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.72, ease: EASE }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </AnimatePresence>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7,6,15,0.58) 65%, rgba(7,6,15,0.92) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(7,6,15,0.42)",
                    border: `1px solid ${activeTeam.accent}66`,
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: activeTeam.accent,
                      boxShadow: `0 0 20px ${activeTeam.accent}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,244,229,0.72)",
                    }}
                  >
                    {String(activeTeamIndex + 1).padStart(2, "0")} /{" "}
                    {String(TEAM.length).padStart(2, "0")}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 28,
                    right: 28,
                    bottom: 28,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,244,229,0.46)",
                    }}
                  >
                    Closing frame
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: activeTeam.accent,
                    }}
                  >
                    {activeTeam.name} / AiQ core team
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      lineHeight: 1.08,
                      fontWeight: 600,
                      letterSpacing: "-0.04em",
                      maxWidth: 520,
                    }}
                  >
                    AiQ is a production-ready knowledge platform. From concept
                    to deployment, built end-to-end in two semester.
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
