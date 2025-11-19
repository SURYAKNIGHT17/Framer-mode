# Trust Score for AI Output - Design Guidelines

## Design Approach

**Framework**: Framer Motion UI patterns with dual light/dark mode support
**Rationale**: Data-dense analysis tool requiring clarity, trust signals, and smooth micro-interactions for state changes
**Principles**: Information hierarchy, credibility, scannable data presentation, subtle motion feedback

---

## Typography

**Font Families**:
- Primary: Inter (Google Fonts) - all UI text, headings, body
- Monospace: JetBrains Mono - claim text, snippets, technical data

**Hierarchy**:
- Hero Score: 64px, weight 700, tight tracking
- Section Headers: 24px, weight 600
- Claim Text: 16px, weight 400, line-height 1.6
- Snippets/Evidence: 14px, weight 400, monospace
- Labels/Meta: 12px, weight 500, uppercase tracking

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24**
- Component padding: p-6 to p-8
- Section gaps: gap-8 to gap-12
- Card spacing: p-6
- Inline elements: space-x-4

**Grid Structure**:
- Main content: max-w-7xl mx-auto
- Two-column analysis view: 2/3 results + 1/3 history sidebar (lg:grid-cols-3)
- Claim grid: Single column stack with clear separation
- Responsive: Full-width mobile → sidebar appears on lg+

---

## Component Library

### 1. Text Input Area
- Large textarea: min-h-48, rounded-lg border
- Paste/upload toggle tabs above
- Character count footer (subtle, right-aligned)
- Analyze button: Large, prominent, primary action with loading spinner state
- Framer Motion: Scale and opacity fade-in on mount

### 2. Trust Score Display
**Hero Component**:
- Circular gauge visualization (0-100 scale)
- Large center number (64px) with "/100" suffix
- Animated arc fill using Framer Motion spring animation
- Status text below: "Mostly Supported" / "Mixed Results" / "Low Confidence"
- Gradient border based on score threshold:
  - ≥75: Success gradient
  - 50-74: Warning gradient  
  - <50: Error gradient

### 3. Claim Cards
**Structure** (Each claim in stacked list):
- Card container: p-6, rounded-lg, border, hover elevation
- Header row: Status badge (left) + Score pill (right)
- Claim text: 16px, weight 500, mb-4
- Evidence section: Collapsible with 2-3 snippet cards
- Footer: Timestamp + verification method tag

**Status Badges**:
- Supported: Pill with checkmark icon, success treatment
- Unclear: Pill with question icon, warning treatment
- Contradicted: Pill with X icon, error treatment
- Size: px-3 py-1, rounded-full, weight 600, 12px

### 4. Evidence Snippets
- Nested cards within claim: p-4, subtle background
- Source domain (14px, weight 600) + snippet preview
- "Read more" link with external icon
- Relevance indicator: Small percentage match display
- Framer Motion: Stagger animation when expanding

### 5. Analysis History Sidebar
**Structure**:
- Fixed height with scroll: max-h-screen overflow-y-auto
- Past analysis cards: p-4, rounded-md
- Each shows: Truncated input (2 lines) + Score + Date
- Active state: Border highlight
- Click loads analysis into main view
- Empty state: Illustration + "No analyses yet" message

### 6. Navigation Header
- Logo/Title (left) + Theme toggle (right)
- New Analysis button (secondary action)
- Export button (icon only, tooltip on hover)
- Sticky: sticky top-0, backdrop-blur

### 7. Export Modal
- Centered overlay with backdrop blur
- Modal content: p-8, max-w-lg
- PDF preview thumbnail
- Download button (primary) + Cancel (ghost)
- Framer Motion: Scale spring entrance from center

---

## Animations & Interactions

**Framer Motion Usage** (Minimal, purposeful):
- Score gauge: Spring-animated arc fill on reveal (duration: 1s, bounce)
- Claim cards: Stagger entrance (0.05s delay between cards)
- Evidence expand/collapse: Height animation with cubic-bezier easing
- Page transitions: Fade + slight y-offset (10px)
- Status changes: Pulse effect on score recalculation

**Hover States**:
- Cards: Subtle y-offset (-2px) + shadow increase
- Buttons: Scale 1.02 with backdrop brightness
- Links: Underline slide-in animation

---

## Light/Dark Mode Specifications

**Implementation**: CSS variables + system preference detection
**Toggle**: Sun/moon icon switch in header (Framer Motion rotate transition)

**Theme Tokens**:
- Background hierarchy: 3 levels (page, card, nested)
- Border hierarchy: 2 levels (subtle, emphasized)
- Text hierarchy: Primary, secondary, tertiary
- Status colors: Maintain consistent hue, adjust lightness
- Ensure 4.5:1 contrast ratio in both modes

**Dark Mode Adjustments**:
- Reduce gauge gradient intensity (50% opacity overlay)
- Card borders more subtle (reduce opacity by 30%)
- Snippet backgrounds darker than card background
- Shadows replaced with subtle glows for elevation

---

## Visual Treatments

**Borders**: All rounded corners use rounded-lg (8px)
**Shadows**: 
- Cards: shadow-sm default, shadow-md on hover
- Modals: shadow-2xl
- Score gauge: Subtle glow effect (box-shadow with theme color)

**Iconography**: Heroicons (outline style for general UI, solid for status badges)

**Loading States**:
- Skeleton screens for claim cards (pulse animation)
- Progress bar under header during analysis
- Spinner in Analyze button during processing

---

## Accessibility

- Semantic HTML: `<main>`, `<aside>`, `<article>` for claims
- ARIA labels on score gauge, status badges, collapse buttons
- Keyboard navigation: Tab order through claims → evidence → actions
- Focus visible: 2px ring on all interactive elements
- Screen reader: Announce score changes and claim status
- Reduced motion: `prefers-reduced-motion` disables Framer animations

---

## Key Pages/Views

### Main Analysis View
- Full-width input section (top)
- Two-column layout below: Results (left 2/3) + History (right 1/3)
- Results column: Score gauge → Claim list → Aggregate explanation
- Sticky header with theme toggle and export

### Empty State
- Centered illustration (abstract data/verification graphic)
- "Analyze AI Output" headline (32px)
- "Paste or upload text to get started" subheading
- Large CTA button

---

## Images

**Hero/Empty State Illustration**: Abstract geometric composition suggesting verification/analysis (interconnected nodes, checkmarks, document scanning). Placement: Centered in empty state, 400x300px, subtle opacity in background.

**No large hero image** - This is a utility application focused on immediate functionality rather than marketing impact.