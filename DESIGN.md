<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: CDburner
description: A self-hosted CD burning tool. Intimate, calm, made for one person.
---

# Design System: CDburner

## 1. Overview

**Creative North Star: "The Gift Room"**

CDburner is not a music tool. It is a room where someone sits down, picks songs they love, and makes something real for someone they love. The visual system should feel like that room — warm, unhurried, and completely personal. No sense of a platform. No chrome that looks like it was built for a million users. The person who opens this should feel like it was made specifically for her.

The color strategy is **Committed**: warm olive and sage carry 30–60% of every surface. Not accent-on-white SaaS neutrality — the warmth is present and felt, the way afternoon light through a window is present. Neutrals tilt the same direction: creamy off-whites and soft warm darks, never pure `#fff` or `#000`.

Typography pairs a **serif display face** with a **humanist sans body**. The combination reads: considered, warm, editorial without being cold. Like a well-made book or a hand-labeled CD case. Display type carries emotional weight; body type earns clarity. Motion is **responsive** — transitions and state feedback are felt, not noticed. No entrances, no choreography. The interface moves when touched, otherwise it waits.

**Key Characteristics:**
- Warm olive/sage as the committed surface color, not an accent
- Serif + humanist sans pairing that conveys care and legibility simultaneously
- Responsive transitions: soft, directional, never decorative
- Zero elements that read as "product" (no metric cards, no sidebar nav, no streaming-app chrome)
- Every screen has one clear job and does it quietly

## 2. Colors

The palette is a warm still-life: olive earth, cream paper, and deep warm shadow.

### Primary
- **Warm Sage** (`[to be resolved during implementation]`): The committed surface color. Used on prominent surfaces, headers, and disc covers. Carries 30–60% of any given screen. Muted enough to feel quiet; present enough to feel warm. Hue anchor: olive green tilting toward gray, low chroma.

### Neutral
- **Cream Paper** (`[to be resolved during implementation]`): Page backgrounds and card surfaces. Tinted warm toward the sage hue — never pure white.
- **Deep Warm Shadow** (`[to be resolved during implementation]`): Body text and high-contrast surfaces. Near-black tinted toward warm brown, never `#000`.
- **Soft Warm Mid** (`[to be resolved during implementation]`): Secondary text, dividers, placeholder states. Low-chroma warm gray.

### Named Rules
**The Committed Warmth Rule.** Sage is not an accent. It lives on surfaces, not as a 10%-or-less highlight. If a screen looks white with a sage dot, the color strategy has collapsed to Restrained. Push sage onto backgrounds, navigation areas, and the disc editor surface.

**The Tinted Neutral Rule.** No neutral in this system is achromatic. Every white tilts toward cream. Every black tilts toward warm brown. The exact chroma is subtle (OKLCH 0.005–0.01), but it must be present. Pure white and pure black belong to a different product.

## 3. Typography

**Display Font:** Serif — `[font pairing to be chosen at implementation]` — something warm and considered, not cold or sharp. Lining figures, moderate contrast. Garaldes (Garamond-derived) or transitional serifs are the right direction; slab serifs and modern serifs are not.

**Body Font:** Humanist sans — `[font pairing to be chosen at implementation]` — legible at 14–16px, warm in its letterforms, slightly irregular (humanist, not geometric). Inter is acceptable; something with more personality is better.

**Character:** The pairing should feel like a vinyl record sleeve from a small label — someone made deliberate choices about type, not just grabbed a system font. The serif carries the title cards and disc names. The sans carries the functional text.

### Hierarchy
- **Display** (serif, light or regular weight, large/clamp): Disc names, page titles. The occasion-level type — used rarely, with space around it.
- **Headline** (serif, regular, medium): Section headings, track titles on the disc editor.
- **Title** (humanist sans, medium weight): Feature labels, button text, navigation items.
- **Body** (humanist sans, regular, 15–16px, line-height 1.6, max 65–70ch): Descriptions, metadata, any text meant to be read.
- **Label** (humanist sans, medium, 11–12px, slight letter-spacing, optional uppercase): Status badges, track numbers, capacity indicators.

### Named Rules
**The No Monospace Rule.** This is not a developer tool. Monospace fonts — in any element, at any scale — read as terminal, not personal. Prohibited. Use a proportional sans for codes, status strings, and any data element.

## 4. Elevation

This system is **flat by default, with soft tonal separation**. Shadows are not the primary tool for communicating depth; surface color contrast and spacing carry that job. When a surface needs to float (modal, tooltip, confirmation prompt), a single diffuse ambient shadow provides just enough lift without drama.

**Shadow Vocabulary (to be resolved at implementation):**
- **Ambient lift** (`to be defined`): For dialogs and confirmation overlays only. Diffuse, low opacity, warm-tinted. Not crisp. If it looks like a 2020 SaaS card, the spread is too large.

**The Flat-By-Default Rule.** Every surface rests flat unless it has been explicitly lifted by user action or requires modal precedence. Cards and list items: never shadow at rest. State (hover, focus, drag): a soft shadow is appropriate as feedback.

## 5. Components

*(Omitted in seed mode. Re-run `/impeccable document` once the frontend is built to extract and document actual component patterns.)*

## 6. Do's and Don'ts

### Do:
- **Do** use warm sage on surfaces, not just as a highlight. 30–60% coverage is the target.
- **Do** use the serif face for disc names and page titles — these are the emotional moments.
- **Do** give screens space. One job per screen, generous padding, deliberate white (cream) space.
- **Do** use the capacity bar as a design moment — it's the most expressive UI in the product.
- **Do** make the insert-disc confirmation prompt feel calm and unhurried — it should feel like setting a record on a turntable, not a system alert.
- **Do** reduce chroma in the olive/sage as you approach very light or very dark values — high-chroma extremes look garish and wrong in this palette.

### Don't:
- **Don't** use streaming-service chrome: no green sidebar, no purple gradient, no Spotify-shaped left nav, no album-grid-as-store layout. This is a making tool, not a discovery tool.
- **Don't** use monospace fonts anywhere. Not for status strings, not for track metadata, not for burn logs shown to the user. This is not a dev tool.
- **Don't** make it look like a dashboard. No metric cards, no data tables, no KPI widgets, no corporate sidebar navigation.
- **Don't** use skeuomorphic retro decoration: no fake CD player chrome, no brushed metal, no simulated plastic buttons. Nostalgia through warmth and craft, not through costume.
- **Don't** use pure white (`#fff`) or pure black (`#000`) anywhere. Every neutral is tinted.
- **Don't** use gradient text (`background-clip: text` with a gradient background). Single solid colors only.
- **Don't** use a `border-left` or `border-right` stripe greater than 1px as a colored accent on cards, list items, or status indicators. Rewrite with background tints or nothing.
- **Don't** use modal dialogs for routine actions. The insert-disc prompt is the one justified modal in this product; everything else resolves inline.
- **Don't** let the burn queue page feel like a job scheduler. It should feel like waiting for a photograph to develop.
