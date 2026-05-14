import { motion } from "framer-motion";
import {
  SlideShell,
  SlideHeader,
  BigGhostNumber,
  GradientText,
  Callout,
  ThaiText,
} from "../components/index.ts";
import { cardRise, fadeInUp, stagger, DURATION } from "../lib/motion.ts";

function AnimatedIcon({ type, color }: { type: string; color: string }) {
  const draw: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.6, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: 0.6, duration: 0.1 },
      },
    },
  };

  switch (type) {
    case "Faithfulness":
      return (
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M9 12l2 2 4-4"
          />
        </motion.svg>
      );
    case "Task Completion":
      return (
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.circle
            variants={draw}
            initial="hidden"
            animate="visible"
            cx="12"
            cy="12"
            r="10"
          />
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M8 12l2.5 2.5L16 9"
          />
        </motion.svg>
      );
    case "Tool Correctness":
      return (
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
          />
        </motion.svg>
      );
    case "Factual Correctness":
      return (
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M14 2v6h6"
          />
          <motion.path
            variants={draw}
            initial="hidden"
            animate="visible"
            d="M9 15l2 2 4-4"
          />
        </motion.svg>
      );
  }
  return null;
}

function LoopedAsset({
  type,
  color,
  rgb,
}: {
  type: string;
  color: string;
  rgb: string;
}) {
  switch (type) {
    case "Faithfulness":
      return (
        <div
          style={{
            display: "flex",
            gap: 6,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ height: ["30%", "100%", "30%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              style={{
                width: 6,
                borderRadius: 3,
                background: `linear-gradient(180deg, ${color} 0%, rgba(${rgb}, 0.2) 100%)`,
              }}
            />
          ))}
        </div>
      );
    case "Task Completion":
      return (
        <div
          style={{
            width: "80%",
            margin: "0 auto",
            height: 2,
            background: `repeating-linear-gradient(90deg, rgba(${rgb},0.2) 0, rgba(${rgb},0.2) 4px, transparent 4px, transparent 8px)`,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <motion.div
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 10px ${color}`,
              transform: "translateX(-50%)",
            }}
          />
        </div>
      );
    case "Tool Correctness":
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: 36,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `2px dashed rgba(${rgb}, 0.4)`,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ width: "100%", height: "100%", position: "absolute" }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: color,
                  borderRadius: "50%",
                  position: "absolute",
                  top: -5,
                  left: 12,
                  boxShadow: `0 0 8px ${color}`,
                }}
              />
            </motion.div>
            <div
              style={{
                width: 14,
                height: 14,
                background: `rgba(${rgb}, 0.2)`,
                borderRadius: "50%",
                position: "absolute",
                top: 9,
                left: 9,
                border: `2px solid ${color}`,
              }}
            />
          </div>
        </div>
      );
    case "Factual Correctness":
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: "calc(50% - 18px)",
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `2px solid rgba(${rgb}, 0.8)`,
              background: `rgba(${rgb}, 0.1)`,
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            style={{
              position: "absolute",
              right: "calc(50% - 18px)",
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `2px solid rgba(${rgb}, 0.8)`,
              background: `rgba(${rgb}, 0.1)`,
            }}
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
      );
  }
  return null;
}

const METRICS = [
  {
    label: "Faithfulness",
    score: "77%",
    evals: "231",
    desc: "วัดความสอดคล้องเชิงข้อเท็จจริงของคำตอบกับบริบทที่ดึงมาได้ โดยมีค่า 0%–100% ยิ่งสูงยิ่งสอดคล้องมาก",
    enDesc:
      "Measures factual alignment between the answer and the retrieved context on a 0%-100% scale; higher is better.",
    color: "#7C3AED",
    rgb: "124,58,237",
    grad: ["#7C3AED", "#A855F7"] as [string, string],
  },
  {
    label: "Factual Correctness",
    score: "78%",
    evals: "231",
    desc: "วัดความถูกต้องเชิงข้อเท็จจริงของคำตอบเทียบกับข้อมูลอ้างอิง โดยใช้ LLM แยกข้อเท็จจริงและ NLI เพื่อประเมินความสอดคล้อง",
    enDesc:
      "Measures factual correctness against reference data by extracting claims with an LLM and using NLI to evaluate consistency.",
    color: "#EC4899",
    rgb: "236,72,153",
    grad: ["#EC4899", "#F43F5E"] as [string, string],
  },
  {
    label: "Task Completion",
    score: "97%",
    evals: "231",
    desc: "Agent ทำงานสำเร็จตามความตั้งใจที่ผู้ใช้ระบุ",
    enDesc:
      "Measures whether the agent successfully completed what the user intended.",
    color: "#10B981",
    rgb: "16,185,129",
    grad: ["#10B981", "#34D399"] as [string, string],
  },
  {
    label: "Tool Correctness",
    score: "99%",
    evals: "231",
    desc: "Agent อิสระเรียกใช้เครื่องมือ MCP ได้อย่างถูกต้องแม่นยำ",
    enDesc:
      "Measures whether the autonomous agent invoked MCP tools correctly.",
    color: "#3B82F6",
    rgb: "59,130,246",
    grad: ["#3B82F6", "#06B6D4"] as [string, string],
  },
] as const;

export function EvalResults() {
  return (
    <SlideShell
      glows={[
        {
          top: -200,
          right: -100,
          size: 800,
          color: "124,58,237",
          opacity: 0.05,
        },
        {
          bottom: -150,
          left: -80,
          size: 600,
          color: "59,130,246",
          opacity: 0.05,
        },
      ]}
    >
      <SlideHeader
        label="Aingo"
        title="Evaluation"
        highlight="Results."
        tagline="231 test executions · Ragas & DeepEval · LLM-as-Judge"
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          flex: 1,
          marginTop: 20,
        }}
      >
        {/* ── Evaluation Context ── */}
        <motion.div {...fadeInUp(0.1, { distance: 10, duration: DURATION.med })}>
          <Callout
            eyebrow="Evaluation Methodology"
            color="#3B82F6"
            rgb="59,130,246"
            bgOpacity={0.04}
            padding="16px 22px"
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--slide-body)",
                color: "#374151",
                lineHeight: 1.6,
              }}
            >
              <ThaiText en="We evaluate our system by using a ground test question set with a set of questions and answers provided by SCBTechX, in both Thai and English versions.">
                เราประเมินระบบของเราโดยใช้ชุดคำถาม ground test ซึ่งประกอบด้วยชุดคำถามและคำตอบที่ให้มาโดย SCBTechX ทั้งในเวอร์ชันภาษาไทยและภาษาอังกฤษ
              </ThaiText>
            </p>
          </Callout>
        </motion.div>

        {/* ── Top row: 4 Metric Cards ── */}
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              {...cardRise(stagger(0.28, 0.1, i))}
              style={{
                flex: 1,
                borderRadius: 20,
                border: `1px solid rgba(${m.rgb}, 0.15)`,
                background: `linear-gradient(180deg, rgba(${m.rgb}, 0.02) 0%, rgba(${m.rgb}, 0.06) 100%)`,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                padding: "24px 20px",
                boxShadow: `0 8px 30px rgba(${m.rgb}, 0.05)`,
              }}
            >
              {/* Bottom accent bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${m.grad[0]}, ${m.grad[1]})`,
                }}
              />

              {/* Watermark Number */}
              <BigGhostNumber
                style={{
                  top: -10,
                  right: -10,
                  fontSize: 120,
                  opacity: 0.05,
                  color: m.color,
                }}
              >
                {m.score}
              </BigGhostNumber>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <GradientText
                    from={m.grad[0]}
                    to={m.grad[1]}
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      lineHeight: 1,
                      display: "block",
                    }}
                  >
                    {m.score}
                  </GradientText>

                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `rgba(${m.rgb}, 0.1)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid rgba(${m.rgb}, 0.2)`,
                    }}
                  >
                    <AnimatedIcon type={m.label} color={m.color} />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  {m.label}
                </div>

                <div
                  style={{
                    width: 32,
                    height: 2,
                    background: `rgba(${m.rgb}, 0.3)`,
                    marginBottom: 12,
                    borderRadius: 2,
                  }}
                />

                <p
                  style={{
                    fontSize: "var(--slide-body)",
                    color: "#4B5563",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  <ThaiText en={m.enDesc}>{m.desc}</ThaiText>
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: 48,
                  }}
                >
                  <LoopedAsset type={m.label} color={m.color} rgb={m.rgb} />
                </div>

                <div
                  style={{
                    paddingTop: 16,
                    fontSize: 10,
                    color: "#9CA3AF",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  n = {m.evals} evals
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom row: Analysis ── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flex: "0 0 auto",
            paddingBottom: 10,
          }}
        >
          <motion.div
            {...fadeInUp(0.78, { distance: 20, duration: DURATION.med })}
            style={{ flex: 1 }}
          >
            <Callout
              eyebrow="Key Strength"
              color="#10B981"
              rgb="16,185,129"
              bgOpacity={0.04}
              padding="18px 22px"
              style={{ height: "100%" }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--slide-body)",
                  color: "#374151",
                  lineHeight: 1.6,
                }}
              >
                <ThaiText en="Standout Tool Correctness (99%) and Task Completion (97%) scores validate the high reliability of CrewAI reasoning and the MCP tool integration.">
                  คะแนน Tool Correctness{" "}
                  <strong style={{ color: "#10B981" }}>(99%)</strong> และ Task
                  Completion <strong style={{ color: "#10B981" }}>(97%)</strong>{" "}
                  ช่วยยืนยันความน่าเชื่อถือระดับสูงของกระบวนการให้เหตุผลแบบ
                  CrewAI และการเชื่อมต่อผ่าน MCP
                </ThaiText>
              </p>
            </Callout>
          </motion.div>

          <motion.div
            {...fadeInUp(0.88, { distance: 20, duration: DURATION.med })}
            style={{ flex: 1 }}
          >
            <Callout
              eyebrow="Retrieval Challenge"
              color="#7C3AED"
              rgb="124,58,237"
              bgOpacity={0.04}
              padding="18px 22px"
              style={{ height: "100%" }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--slide-body)",
                  color: "#374151",
                  lineHeight: 1.6,
                }}
              >
                <ThaiText en="Faithfulness (77%) reveals occasional external knowledge intrusion when context is sparse. This highlights limits of static top-k retrieval: risking unrelated chunks or missing distributed context.">
                  คะแนน Faithfulness{" "}
                  <strong style={{ color: "#7C3AED" }}>(77%)</strong>{" "}
                  ชี้ให้เห็นถึงข้อจำกัดของการดึงข้อมูลแบบตายตัว (Fixed Top-K)
                  ที่อาจดึงข้อมูลไม่เกี่ยวข้องเมื่อความคล้ายคลึงต่ำ หรือพลาดข้อมูลสำคัญที่กระจายอยู่
                </ThaiText>
              </p>
            </Callout>
          </motion.div>
        </div>
      </div>
    </SlideShell>
  );
}
