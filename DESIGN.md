# Design System: Kitchen Workflow (Culinary Flow)

> Single source of truth for UI generation, component primitives, and responsive cooking layouts. Built on top of the Mealie recipe management API for 10–13 inch kitchen-mounted tablets, mobile phones, and desktop displays.

---

## 1. Visual Theme & Atmosphere

A calm, high-clarity cooking execution workspace designed for real countertop environments. It solves cooking confusion by eliminating multi-column kanban overload: instead of making the cook scan three parallel lanes simultaneously to decide what to do next, the interface **anchors the workspace around One Prominent Active Task** while keeping parallel lanes organized and glanceable.

- **Atmosphere:** Natural, grounded, functional, and uncluttered.
- **Density:** Daily App Balanced (5/10) — generous arm's-length touch targets ($\ge 48\text{px}$), clear breathing room.
- **Variance:** Offset Asymmetric (6/10) — Hero active step visually commands focus; background parallel tracks sit secondary.
- **Motion:** Static Restrained (2/10) — Zero continuous animation slop (`animate-pulse` and `animate-ping` strictly banned). Flashing/audible alerts strictly restricted to timer 00:00 completion.

---

## 2. Color Palette & Roles

Strict light theme palette calibrated for kitchen lighting, glare reduction, and 100% WCAG 2.2 AA contrast compliance.

| Token | Hex | Role & Functional Description |
|---|---|---|
| `color.canvas` | `#F5F5F0` | Warm stone canvas; prevents glare under overhead kitchen lights |
| `color.surface` | `#FFFFFF` | Primary surface for active task cards, recipe sheets, and modal drawers |
| `color.surface-subtle` | `#ECEDE7` | Secondary surface for ingredient tags, unselected lane tabs, and disabled fills |
| `color.border` | `#D9DDD4` | 1px hairline structural boundary across cards, dividers, and panel edges |
| `color.border-strong` | `#8E968E` | Input borders and high-contrast boundaries (3:1 contrast against surface) |
| `color.text-primary` | `#20251F` | Deep charcoal ink for recipe titles, active instruction text, and headings |
| `color.text-secondary` | `#5F675F` | Supporting metadata, prerequisite dependency text (4.6:1 contrast), elapsed time, phase subtitles, and ingredient quantities |
| `color.text-disabled` | `#8E968E` | Inactive step references paired with explicit prerequisite reasons |
| `color.primary` | `#245C43` | Deep forest green; canonical primary CTA, active countdown rings, selected tabs |
| `color.primary-hover` | `#194A35` | Hover and tactile pressed state for primary controls |
| `color.primary-subtle` | `#E4EEE7` | Background fill for `Ready` badges and selected navigation items |
| `color.on-primary` | `#FFFFFF` | High-contrast white text and icons on primary fills |

### Phase Accent Markers (Semantic Workstreams — Left Border Only)
Phase markers are parameterized into semantic workstream lanes to support diverse recipe genres (baking, grilling, multi-component dishes) without hardcoding sauce-specific constraints:
- `phase.prep`: Herb Green (`#537B60`) — 4px left-border accent for preparation / mise-en-place tasks
- `phase.active` / `phase.cooking`: Cast Iron Brick (`#A65B45`) — 4px left-border accent for active stovetop, searing, or baking tasks
- `phase.secondary` / `phase.sauce`: Amber Teriyaki (`#B17A3D` border, `#8A5A22` text) — 4px left-border accent for sauces, marinades, or parallel side elements
- `phase.finishing`: Brass Gold (`#9E7B34` border, `#7A5B18` text) — 4px left-border accent for plating, resting, garnishing, and assembly

### Countertop Glare Contrast Rule
Prerequisite notes and dependency hints MUST render in `color.text-secondary` (`#5F675F`, 4.6:1 against surface, 5.3:1 against canvas) or `status.blocked` (`#8A4E0B`, 6.1:1). Never use washed-out disabled text (`#8E968E`) for prerequisite copy, ensuring readability under harsh kitchen lights.

### Steady-State Status Tokens
- `status.pending`: Gray Neutral (`#5F675F` on `#ECEDE7`)
- `status.ready`: Brand Forest (`#245C43` on `#E4EEE7`)
- `status.in_progress`: Calm Steel Blue (`#356B8C` on `#EBF3F8`)
- `status.blocked`: High-Contrast Warm Amber (`#8A4E0B` on `#FDF4E7`)
- `status.completed`: Kitchen Sage (`#287A4B` on `#E6F3EC`)

---

## 3. Typographic Architecture

All typography is calibrated for 3–4 feet viewing distance on countertop stands.
- **Font Stack:** `Geist`, `Outfit`, or system sans-serif (`Inter` is banned for generic AI aesthetic).

| Style | Size Range | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Display | 32–40px | 700 | 1.2 | Recipe titles on overview screens |
| Hero Active Step | 24–30px | 650 | 1.25 | Active task headline on the board |
| Primary Instruction | 20–24px | 500 | 1.6 | Step-by-step cooking instruction in Focus Mode / Active Card |
| Section Header | 20–24px | 600 | 1.3 | Lane titles and drawer headers |
| Task Card Title | 18–22px | 600 | 1.35 | Waiting / queued task card titles |
| Body / Ingredients | 16–18px | 400–500 | 1.5 | General descriptions and ingredient chip text |
| Supporting Metadata | 14–16px | 400 | 1.4 | Stage indicators, duration minutes, and timestamps |
| Micro Badge | 13px | 600 | 1.3 | Steady-state status indicators (sentence case only) |

---

## 4. Interaction Architecture: The "Culinary Flow" Model

To prevent cognitive overload while cooking, the workflow interface is divided into distinct zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Recipe Name, Progress Bar ("3 of 14 Done"), Mise-en-place CTA │
├────────────────────────────────────────────────────────────────────────┤
│ PERSISTENT TIMER STRIP (Visible when any timer is running)             │
│ [ ⏱️ Sear ribeye: 01:45 ] [+30s] [Pause]  [ ⏱️ Simmer dashi: 04:12 ]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [HERO ACTIVE TASK CARD]                                               │
│  - Phase Accent (4px left border)                                      │
│  - Big Glanceable Instruction (22px): "Sear ribeye 2 min per side"      │
│  - Step Ingredients (>=48px touch chips): [Beef Ribeye] [Beef Tallow]  │
│  - PRIMARY ACTION: [ Mark Complete & Advance ➔ ] (56px CTA)            │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ PARALLEL WORKSTREAMS (Glanceable Lanes Below)                          │
│ ┌──────────────────────┐┌──────────────────────┐┌────────────────────┐ │
│ │ PREPARATION LANE     ││ SECONDARY / SAUCE    ││ ACTIVE COOKING     │ │
│ │ - Cut tofu (ready)   ││ - Simmer warishita   ││ - Sear beef (hero) │ │
│ │ - Slice negi         ││                      ││                    │ │
│ └──────────────────────┘└──────────────────────┘└────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 The Decoupled Timer Architecture
1. **Global Utility Timer Strip**:
   - Active timers are decoupled from the Hero Card view.
   - When a cook starts a 5-minute sear, they can freely switch focus to inspect prep or sauce steps in the Hero Card without hiding or losing the countdown.
   - All active timers render in a persistent horizontal strip pinned right below the Top Bar.
   - Tapping an active timer in the strip immediately brings its associated task into the Hero focus card.

### 4.2 Post-00:00 Timer Overtime UX
- When a timer expires (reaches `00:00`):
  - A synthetic chime sounds via the Web Audio API (zero audio file dependencies).
  - The timer does **NOT** auto-advance or mark the task complete automatically.
  - The timer enters **Overtime Mode**: it counts upwards in amber (`color.warning`, `#8A4E0B`) displaying `+00:01`, `+00:30`, etc., indicating exactly how long the pan has been on heat past target.
  - Advancing requires explicit physical touch on `Mark Complete & Continue` or `Advance Stage`.

### 4.3 Step-Specific Ingredient Interaction
- Step-specific ingredient tags are not crowded with secondary sub-checkboxes.
- The **entire ingredient chip itself acts as the $\ge 48\text{px}$ tap-to-verify button**.
- Tapping the chip toggles between `pending` (subtle border, `#20251F` text) and `prepared` (sage background `#E4EEE7`, forest text `#245C43`, strikethrough decoration).

### 4.4 Prerequisite Anchor Links
- Blocked tasks show clear dependency copy in `#5F675F`: `Waiting for: [Step Name]`.
- The prerequisite anchor button has a minimum $48\text{px}$ touch target and scrolls/focuses directly to the blocking step.

---

## 5. Responsive Rules & 1024px Tablet Landscape

- **Desktop (>1080px):** Persistent Timer Strip + Hero Active Card on top; all parallel lanes display side-by-side below with optional 320px ingredient drawer.
- **Tablet Landscape (900px–1080px, including 1024px iPad Countertop View):**
  - **No Dynamic Column Shifts:** Opening the Mise-en-place drawer renders as an **overlay slide-out drawer** (width 340px) over the board with an accessible backdrop dismiss.
  - The underlying board retains its 2-column or 3-column layout without resizing or abruptly reflowing lanes under the cook's fingers.
- **Tablet Portrait (640px–899px):** Persistent Timer Strip + Hero Active Card + 1 active parallel lane with sticky segmented switcher (`Prep`, `Sauce`, `Cooking`).
- **Mobile Phone (<640px):**
  - Focus Mode first (one step at a time, sticky 56px bottom CTA).
  - Ingredients open in a fluid bottom sheet with drag-down dismissal.

---

## 6. Safety, Feedback & Anti-Patterns

### 6.1 Accidental Tap Protection & 5-Second Undo Toast
- Countertop screens often receive accidental double-taps or touches from wet/greasy fingers.
- When `Mark Complete & Continue` is tapped:
  - The task transitions immediately to completed, advancing the Hero step.
  - A non-blocking **5-second Undo Toast** appears floating at the bottom center:  
    `Task completed. [ Undo (5s) ]`
  - The `Undo` action has a dedicated $48\text{px}$ touch target and instantly restores task state if tapped.
  - Persistent bidirectional navigation ("Previous Task") is always available in the header.

### 6.2 Anti-Patterns (Strictly Banned)
- ❌ **No Multiple Competing Primary Buttons:** Exactly one primary green (`#245C43`) CTA on screen at a time.
- ❌ **No Continuous Motion Slop:** No `animate-pulse`, `animate-ping`, or infinite spinners on active timers or badges. Steady icon + label only.
- ❌ **No Nested Cards:** Maximum card depth is 1 level. Cards never contain sub-cards, inner gray boxes, or nested borders.
- ❌ **No Sub-48px Touch Targets:** Every interactive element (buttons, tabs, chips, checkboxes) has a minimum $48\text{px} \times 48\text{px}$ bounding box.
- ❌ **No Pure Black (`#000000`):** Use `#20251F` for text.
- ❌ **No Generic AI Typography:** `Inter`, `Times New Roman`, and neon glow borders are banned.
