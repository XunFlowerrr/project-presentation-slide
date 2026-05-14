import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { slides, sections, trackerSlideCount } from "./slides/index.ts";
import { DemoVideo } from "./slides/DemoVideo.tsx";
import { SolutionOverview } from "./slides/SolutionOverview.tsx";
import { SharePointSync } from "./slides/SharePointSync.tsx";
import { ReActFlow } from "./slides/ReActFlow.tsx";
import { AttachmentFlow } from "./slides/AttachmentFlow.tsx";
import { WebCapabilities } from "./slides/WebCapabilities.tsx";
import { WebCapabilities2 } from "./slides/WebCapabilities2.tsx";
import { OperationalModes } from "./slides/OperationalModes.tsx";
import { usePresentation } from "./hooks/usePresentation.ts";
import { PresentationFrame, ProgressTracker } from "./components/index.ts";
import { SlideContext } from "./context/SlideContext.tsx";
import { slideSwipeTransition, slideSwipeVariants } from "./lib/motion.ts";

function useConfettiKey() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "c" || e.key === "C") {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.55 },
          colors: [
            "#7C3AED",
            "#A855F7",
            "#EC4899",
            "#3B82F6",
            "#10B981",
            "#F59E0B",
          ],
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function getSlideSteps(Slide: any): number[] {
  if (Slide === SolutionOverview) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (Slide === SharePointSync) return [0, 1, 2, 3, 4, 5];
  if (Slide === ReActFlow) return [0, 1, 2, 3, 4, 5, 6];
  if (Slide === AttachmentFlow) return [0, 1, 2, 3, 4, 5, 6];
  if (Slide === WebCapabilities) return [0, 1, 2];
  if (Slide === WebCapabilities2) return [0, 1, 2];
  if (Slide === OperationalModes) return [0, 1, 2, 3];
  return [0];
}

export default function App() {
  useConfettiKey();
  const state = usePresentation(slides.length);
  const { currentIndex, direction, goTo } = state;
  const CurrentSlide = slides[currentIndex];

  const isPrintMode = new URLSearchParams(window.location.search).has('print');

  if (isPrintMode) {
    const printPages: { Slide: any; slideNum: number; stepOverride: number }[] = [];
    slides.forEach((Slide, idx) => {
      const steps = getSlideSteps(Slide);
      steps.forEach((stepOverride) => {
        printPages.push({ Slide, slideNum: idx + 1, stepOverride });
      });
    });

    return (
      <MotionConfig transition={{ duration: 0 }}>
        <div style={{ background: '#000', width: '1920px', margin: 0, padding: 0 }}>
          {printPages.map(({ Slide, slideNum, stepOverride }, idx) => (
            <div
              key={idx}
              style={{
                width: '1920px',
                height: '1080px',
                position: 'relative',
                overflow: 'hidden',
                pageBreakAfter: 'always',
                breakAfter: 'page',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
              }}
            >
              <SlideContext.Provider value={{ slideNum, goTo: () => {}, stepOverride }}>
                <div
                  style={{
                    width: 1920,
                    height: 1080,
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <Slide />
                </div>
              </SlideContext.Provider>
            </div>
          ))}
        </div>
      </MotionConfig>
    );
  }

  const currentSlideNum = currentIndex + 1;
  const isCoverSlide = currentSlideNum === 1;
  const isVideoSlide = CurrentSlide === DemoVideo;

  if (isVideoSlide) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SlideContext.Provider value={{ slideNum: currentSlideNum, goTo }}>
          <CurrentSlide />
        </SlideContext.Provider>
      </div>
    );
  }

  return (
    <PresentationFrame>
      {!isCoverSlide && currentSlideNum <= trackerSlideCount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: 48,
            right: 64,
            zIndex: 100,
          }}
        >
          <ProgressTracker
            sections={sections}
            current={currentSlideNum}
            variant="dots"
            activeColor="#D946EF"
            baseColor="rgba(0,0,0,0.1)"
            thickness={6}
            gap={6}
            onDotClick={(slideNum) => goTo(slideNum - 1)}
          />
        </motion.div>
      )}

      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideSwipeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideSwipeTransition}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <SlideContext.Provider value={{ slideNum: currentSlideNum, goTo }}>
            <CurrentSlide />
          </SlideContext.Provider>
        </motion.div>
      </AnimatePresence>
    </PresentationFrame>
  );
}
