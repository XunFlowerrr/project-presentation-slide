import type { ComponentType } from "react";

import { Cover } from "./Cover.tsx";
import { TableOfContents } from "./TableOfContents.tsx";

import { ProblemDivider } from "./ProblemDivider.tsx";
import { ProblemOverview } from "./ProblemOverview.tsx";
import { TheProblem } from "./TheProblem.tsx";
import { WhySystemFails } from "./WhySystemFails.tsx";
import { SystemEvolution } from "./SystemEvolution.tsx";

import { ApproachDivider } from "./ApproachDivider.tsx";
import { ObjectiveScope } from "./ObjectiveScope.tsx";
import { OurApproach } from "./OurApproach.tsx";
import { ExpectedResults } from "./ExpectedResults.tsx";

import { SystemDivider } from "./SystemDivider.tsx";
import { DemoVideo } from "./DemoVideo.tsx";
import { ShowcaseLoop } from "./ShowcaseLoop.tsx";
import { SolutionOverview } from "./SolutionOverview.tsx";
import { ServicesBreakdown } from "./ServicesBreakdown.tsx";
import { SharePointSync } from "./SharePointSync.tsx";
import { IngestionPipeline } from "./IngestionPipeline.tsx";
import { ReActFlow } from "./ReActFlow.tsx";
import { HydeDensityGap } from "./HydeDensityGap.tsx";
import { InteractiveRAG } from "./InteractiveRAG.tsx";
import { OperationalModes } from "./OperationalModes.tsx";
import { AttachmentFlow } from "./AttachmentFlow.tsx";
import { WebCapabilities } from "./WebCapabilities.tsx";
import { WebCapabilities2 } from "./WebCapabilities2.tsx";

import { EvalDivider } from "./EvalDivider.tsx";
import { EvalResults } from "./EvalResults.tsx";

import { TeamDivider } from "./TeamDivider.tsx";
import { MeetTheTeam } from "./MeetTheTeam.tsx";
import { ProjectTimeline } from "./ProjectTimeline.tsx";
import { FutureWork } from "./FutureWork.tsx";
import { LandingPage } from "./LandingPage.tsx";

export type SlideComponent = ComponentType;

// ── Deck ───────────────────────────────────────────────────────────────────
// To reorder: move a line within slides[].
// To add:     create file, export a named function, import above, insert here.
// Section counts for the progress tracker are derived automatically.
// ──────────────────────────────────────────────────────────────────────────
const deck = [
  {
    label: "Intro",
    slides: [Cover, TableOfContents],
  },
  {
    label: "Problem",
    slides: [
      ProblemDivider,
      ProblemOverview,
      TheProblem,
      WhySystemFails,
      SystemEvolution,
    ],
  },
  {
    label: "Approach",
    slides: [ApproachDivider, ObjectiveScope, OurApproach, ExpectedResults],
  },
  {
    label: "System",
    slides: [
      SystemDivider,
      DemoVideo,
      SolutionOverview,
      ServicesBreakdown,
      SharePointSync,
      IngestionPipeline,
      ReActFlow,
      HydeDensityGap,
      InteractiveRAG,
      OperationalModes,
      AttachmentFlow,
      WebCapabilities,
      WebCapabilities2,
    ],
  },
  {
    label: "Testing",
    slides: [EvalDivider, EvalResults],
  },
  {
    label: "Team",
    slides: [
      TeamDivider,
      MeetTheTeam,
      ProjectTimeline,
      FutureWork,
      ShowcaseLoop,
      LandingPage,
    ],
  },
] as const satisfies { label: string; slides: SlideComponent[] }[];

/** Flat ordered slide array used by the presentation engine. */
export const slides: SlideComponent[] = deck.flatMap((s) => s.slides);

/** Section metadata with auto-derived counts — consumed by ProgressTracker. */
export const sections: { label: string; count: number }[] = deck.map((s) => ({
  label: s.label,
  count: s.slides.length,
}));

/** Total slide count for the progress tracker visibility guard (excludes the closing LandingPage). */
export const trackerSlideCount: number = slides.length - 1;
