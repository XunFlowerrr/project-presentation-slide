# Presentation Deck Developer Guide

This document provides a comprehensive guide to the architecture, configuration, content creation, and styling guidelines for this presentation deck.

---

## 1. Project Philosophy

Unlike standard presentation editors (e.g., PowerPoint, Keynote, or Figma), this project is a **web application that acts as a presentation deck**. The design philosophy is centered around a developer-first, code-driven slide rendering engine built with React, Vite, TypeScript, and Framer Motion.

### Key Architectural Pillars:

1. **Rigid 16:9 Canvas (1920×1080) with Auto-Scaling**
   - The application does not use fluid, responsive CSS grids that reflow text unpredictably on different screen sizes. Instead, it operates on a fixed-size virtual canvas of `1920px` by `1080px`.
   - The [PresentationFrame](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/layout/PresentationFrame.tsx) component scales this canvas using a CSS `transform: scale(...)` calculation matching the smaller ratio of width/height resize. This ensures the deck looks pixel-perfect, with identical text wrapping and element alignment, on any display or projector.

2. **Code-First Interactive Slides**
   - Every slide is a native React component (`.tsx`). Writing slides in code allows for full integration of web capabilities, including custom vector layouts, interactive stepper states, interactive charts, HTML5 videos, real-time canvasses, and bespoke physics/canvas animations.

3. **State-Driven Multi-Step Animations (Step-by-Step Slide Reveals)**
   - Slide overlays and sequential step reveals are controlled via React state. The state-driven approach makes it simple to reveal individual bullet points, flow steps, or code panels incrementally when navigating forward.

4. **Flattened Printing & Puppeteer PDF Export**
   - For distribution, the deck includes a headless browser PDF exporter in [export_pdf.js](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/export_pdf.js).
   - In print mode (`?print` query parameter), [src/App.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/App.tsx) reads each slide's step count using `getSlideSteps()` and renders a distinct page for **every transition step** of each slide. This ensures the output PDF captures all structural animation phases as static sheets, without overlapping text or blank gaps.

5. **First-Class Bilingualism**
   - Slides support dynamic bilingual toggling between "mixed" (Thai/English side-by-side or Thai default) and "English" modes via a global [LanguageContext](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/context/LanguageContext.tsx).
   - The [ThaiText](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/primitives/ThaiText.tsx) component automatically handles applying appropriate fonts (`Noto Sans Thai`) and rendering English translation overrides (`en` prop) dynamically when the user toggles the language.

6. **Interactive Presentation Controls**
   - The presentation engine integrates keyboard listener bindings (`ArrowRight`, `ArrowLeft`, `Space`) for slide navigation.
   - It also features a virtual overlay laser pointer (toggled by pressing **L**) for presentations and a fullscreen mode toggle (toggled by pressing **F**).

---

## 2. Where to Configure

### Page Reordering & Sections
The presentation's structure, grouping, and order are entirely configured in [src/slides/index.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/slides/index.ts).

- **`deck` Array:** Group slide components into thematic sections.
- **To Reorder:** Rearrange the lines of slides within the array.
- **To Add a Slide:** Create your new `.tsx` slide file, import it, and insert it into the desired section.
- **Auto-Derived Metadata:** The sections, flat order, and progress indicator trackers are calculated dynamically from the `deck` constant.

```typescript
// Example from src/slides/index.ts
const deck = [
  {
    label: "Intro",
    slides: [Cover, TableOfContents],
  },
  {
    label: "ContentSection",
    slides: [SlideOne, SlideTwo],
  },
] as const;
```

---

### Page Content & Boilerplate
To create a slide, create a new file (e.g., `src/slides/MyCustomSlide.tsx`) and export a named functional component.

#### Standard Static Slide Boilerplate:
```tsx
import { motion } from "framer-motion";
import { SlideShell, SlideHeader, ThaiText } from "../components/index.ts";
import { fadeInUp, fadeInLeft } from "../lib/motion.ts";

const GLOWS = [
  { top: -200, right: -100, size: 700, color: "124,58,237", opacity: 0.1 },
];

export function MyCustomSlide() {
  return (
    <SlideShell glows={GLOWS}>
      <SlideHeader
        label="Category Label"
        title="Main Slide"
        highlight="Heading."
        tagline="A tagline or description goes here"
      />
      <div style={{ flex: 1, display: "flex", gap: 20 }}>
        <motion.div {...fadeInLeft(0.2)}>
          <ThaiText en="English Content">เนื้อหาภาษาไทย</ThaiText>
        </motion.div>
      </div>
    </SlideShell>
  );
}
```

---

#### Multi-Step Interactive / Animating Slide Boilerplate:
If your slide has sequential steps (e.g., an animated diagram showing phases 1, 2, and 3):

1. **Register the steps in [src/App.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/App.tsx)**:
   Add a case inside the `getSlideSteps` function pointing to your component and returning an array representing its step indices.
   ```typescript
   function getSlideSteps(Slide: any): number[] {
     if (Slide === MyCustomSlide) return [0, 1, 2]; // 3 steps (0, 1, 2)
     // ...
     return [0];
   }
   ```

2. **Consume step state inside the slide**:
   Use `useContext(SlideContext)` to read the active step. The presentation handles step index updates automatically.
   ```tsx
   import { useContext } from "react";
   import { SlideContext } from "../context/SlideContext.tsx";
   import { SlideShell, SlideHeader } from "../components/index.ts";

   export function MyCustomSlide() {
     // stepOverride is provided during PDF print mode; stepNum matches current index in interactive mode
     const { stepOverride } = useContext(SlideContext);
     const [activeStep, setActiveStep] = useState(0);

     // Fall back to stepOverride if present (for Puppeteer printing)
     const currentStep = stepOverride !== undefined ? stepOverride : activeStep;

     // Implement your step render states using currentStep...
   }
   ```

---

## 3. How to Style

### Styling System Rules:
- **Inline Styling (`style` prop):** Layout styling is primarily written inline using React `style` objects. This keeps styling encapsulated inside components and avoids bloated global stylesheets.
- **Avoid Tailwind CSS:** To preserve control and flexibility, avoid Tailwind CSS utility classes; use React inline styles and custom CSS variables instead.

### Color and Spacing Tokens
Global visual metrics and layout baselines are defined in [src/index.css](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/index.css):
- `--slide-body`: Default body text size (`20px`) for standard paragraph grids.
- `--slide-card-heading`: Default heading size (`20px`) inside information cards.
- **Font Stack:** Defaults to `Inter` for English text and `Noto Sans Thai` for Thai translations.

### Layout Wrappers
- **`<SlideShell>`**: Every slide should have `<SlideShell>` as its outermost container. It supplies:
  - Default layout padding (`72px 108px`).
  - A subtle grid background.
  - Multi-colored ambient background glows config (`glows` prop).
- **`<SlideHeader>`**: Renders the slide title block with categories, two-toned gradient headers, and underline dividers.
- **`<VerticalDivider>` / `<HorizontalDivider>`**: Used to split layouts cleanly.

### Predefined Animations
Predefined animation variants are configured using Framer Motion in [src/lib/motion.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/lib/motion.ts). Spread these properties into a `<motion.div>` to animate elements.

- **`fadeIn(delay)`**: Simple opacity fade.
- **`fadeInUp(delay, options)`**: Rise and fade in.
- **`fadeInLeft(delay, options)`** / **`fadeInRight(delay, options)`**: Lateral slide-in.
- **`scaleIn(delay, options)`**: Zoom/pop-in.
- **`cardRise(delay)`**: Smooth upward transition ideal for card components.
- **`stagger(base, step, index)`**: Helper function to calculate staggered item delays.

```tsx
// Example of stagger inside a list/grid:
{ITEMS.map((item, index) => (
  <motion.div
    key={item.id}
    {...cardRise(stagger(0.2, 0.1, index))}
  >
    {item.title}
  </motion.div>
))}
```

### Reusable Style Primitives
A set of pre-designed visual assets and UI primitives are available in [src/components/index.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/index.ts):
- **`<GradientText>`**: Highlights specific headings using the primary magenta/purple theme.
- **`<Pill>`**: Rounded tag label container (useful for labels or category tags).
- **`<IconTile>` / `<IconBadge>`**: Visual container circles or boxes for wrapping icons.
- **`<BigGhostNumber>`**: Extremely large background digits (e.g. `01`, `02`) for sections or steps.
- **`<DotPoint>`**: Custom bullet items supporting colored badges or numbers.

---

## 4. Build Scripts & Deployment Options

Configure or run building tasks using the custom npm scripts defined in [package.json](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/package.json):

1. **Development Server:**
   ```bash
   npm run dev
   ```
   Starts a Vite local development server at `http://localhost:5173`.

2. **Standard Production Build:**
   ```bash
   npm run build
   ```
   Compiles code via TypeScript and builds optimized static assets into the `dist/` directory. Ideal for standard web hosting.

3. **Single-File Portable Build (All-In-One Bundling):**
   ```bash
   npm run build:single
   ```
   - Uses the specialized [vite.singlefile.config.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/vite.singlefile.config.ts) configuration and `vite-plugin-singlefile`.
   - Inlines **all assets** (CSS, JS code, images, web videos, GLB 3D models) directly into a **single, self-contained `index.html` file** inside `dist-single/`.
   - **Note:** Because it bundles video assets as base64 URLs, the resulting HTML file size will be large (~220MB+), but it can be opened offline in any browser without needing a server or network.

4. **PDF Slide Deck Exporting:**
   ```bash
   npm run export
   ```
   Runs the [export_pdf.js](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/export_pdf.js) script, which launches a headless Puppeteer browser to print the entire presentation to `presentation.pdf` in the workspace root.

---

## 5. Keyboard Navigation & Interaction Mappings

The presentation frame binds hotkeys for interactive controls. Note that these event listeners are globally bound unless a form input has active focus:

| Key | Action | Context / Location |
| :--- | :--- | :--- |
| **`Space`** / **`ArrowRight`** | Go to the next slide | [usePresentation.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/hooks/usePresentation.ts) |
| **`ArrowLeft`** | Go to the previous slide | [usePresentation.ts](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/hooks/usePresentation.ts) |
| **`L`** / **`l`** | Toggle virtual laser pointer drawing canvas | [PresentationFrame.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/layout/PresentationFrame.tsx) |
| **`F`** / **`f`** | Toggle browser Fullscreen mode | [PresentationFrame.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/layout/PresentationFrame.tsx) |
| **`C`** / **`c`** | Trigger canvas confetti burst explosion | [App.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/App.tsx) |
| **`.`** (period) | Move to the next internal step of a slide | [StepNav.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/composite/StepNav.tsx) |
| **`,`** (comma) | Move to the previous internal step of a slide | [StepNav.tsx](file:///Users/xunflowerrr/Main/Work/GithubRepository/project-presentation-slide/src/components/composite/StepNav.tsx) |

---

## 6. Advanced Technical Integrations

The workspace leverages several robust external libraries for high-fidelity interactive elements:

- **WebGL & 3D Physics Rendering:** Integrated with `three`, `@react-three/fiber` (R3F), and `@react-three/drei` for rendering interactive 3D models and lighting. The `@react-three/rapier` library handles real-time rigid body physics calculations inside slides.
- **Interactive Graphs and flows:** Uses `@xyflow/react` (React Flow) for creating custom node systems, draggable processes, and vector-mapped connection pathways between services.
- **Scroll Animations:** Integrated with `lenis` to support smooth scrolling animations on scrollable slides (such as the project showcase landing page).

