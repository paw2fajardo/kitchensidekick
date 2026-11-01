# Kitchen Workflow Design System

> Design specification for Google Stitch (UI generation and prototyping platform). This document establishes visual and interaction design rules for the Kitchen Workflow application, a touch-first kitchen display interface built on top of the Mealie recipe management API.

---

## 1. Design Intent

Design a practical kitchen workspace interface for organizing and executing multi-step recipes.

The interface must be:

- Functional rather than decorative.
- Calm, clear, and easy to scan.
- High-contrast and readable at arm's length (minimum body size 16px).
- Touch-first, especially on kitchen-mounted tablets.
- Consistent across recipe browsing, workflow editing, and cooking execution.

Avoid SaaS dashboard styling, food-blog layouts, social-feed patterns, gradients, glassmorphism, and continuous decorative animation.

---

## 2. Brand and Visual Character

- **Visual metaphor:** A well-organized kitchen work surface with distinct work areas, clear labels, practical tools, and visible progress.
- **Primary accent:** Deep forest green (`#245C43`). Standardized strictly across all components; do not substitute off-brand greens.
- **Neutrals:** Warm off-white surfaces, soft stone borders, charcoal text.
- **Secondary accents:** Restrained earth and ingredient-inspired tones. Use sparingly. Never as the only status indicator.

---

## 3. Color Tokens

### 3.1 Light Theme (Only Theme in this Version)

A dark theme is out of scope for this version.

| Token | Hex | Usage |
|---|---|---|
| `color.canvas` | `#F5F5F0` | App background |
| `color.surface` | `#FFFFFF` | Cards, panels, dialogs |
| `color.surface-subtle` | `#ECEDE7` | Secondary surfaces, input backgrounds, disabled fills |
| `color.text-primary` | `#20251F` | Main text and headings |
| `color.text-secondary` | `#5F675F` | Supporting text, metadata, muted labels |
| `color.text-disabled` | `#8E968E` | Disabled labels and secondary hints (paired with a reason) |
| `color.border` | `#D9DDD4` | Dividers, card borders |
| `color.border-strong` | `#8E968E` | Input borders, focus-adjacent outlines (3:1 against surface) |
| `color.primary` | `#245C43` | Canonical primary actions, selected navigation, active rings |
| `color.primary-hover` | `#194A35` | Hover and pressed primary |
| `color.primary-subtle` | `#E4EEE7` | Selected or highlighted surfaces |
| `color.on-primary` | `#FFFFFF` | Text and icons on primary |
| `color.success` | `#287A4B` | Completed states |
| `color.warning` | `#A86416` | Caution, attention |
| `color.danger` | `#B33B32` | Destructive actions, errors |
| `color.info` | `#356B8C` | Informational states |
| `color.focus` | `#245C43` | Focus ring (2px, 2px offset) |

### 3.2 Contrast Validation (WCAG 2.2 AA)

| Pair | Approx. Ratio | Result |
|---|---:|---|
| `text-primary` on `canvas` | 14+:1 | Pass |
| `text-secondary` on `surface` | 5.8:1 | Pass (body and small text) |
| `text-secondary` on `surface-subtle` | 5.0:1 | Pass |
| `primary` on `surface` | 7.6:1 | Pass |
| `success` on `surface` | 5.3:1 | Pass |
| `warning` on `surface` | 4.7:1 | Pass (text) |
| `danger` on `surface` | 5.9:1 | Pass |
| `info` on `surface` | 5.9:1 | Pass |
| `phase.prep` on `surface` | 4.8:1 | Pass (text and borders) |
| `phase.sauce-text` on `surface` | 5.9:1 | Pass (label text) |
| `phase.cooking` on `surface` | 5.0:1 | Pass (text and borders) |

### 3.3 Phase Colors

Phase colors identify lanes and workstreams. They are never status colors.

| Token | Hex | Usage |
|---|---|---|
| `phase.prep` | `#537B60` | Preparation lane marker, header accent, card border |
| `phase.sauce` | `#B17A3D` | Sauce lane marker and card border |
| `phase.sauce-text` | `#8A5A22` | Sauce lane label text |
| `phase.cooking` | `#A65B45` | Cooking lane marker, header accent, card border |

**Phase rules:**
- Phase colors must never appear in status badges, buttons, checkmarks, or warnings.
- Phase names and labels are always visible in `text-primary` or dedicated high-contrast text tokens.
- Do not fill task cards with phase colors. Use a 4px left border marker.

---

## 4. Typography

Use a legible sans-serif such as Inter or Geist. Use one family across the app.

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 32–40px | 650–700 | Recipe title on overview screens |
| Page heading | 26–32px | 650–700 | Screen title |
| Section heading | 20–24px | 600–650 | Phase names, panel headings |
| Task title | 18–22px | 600 | Task card title |
| Instruction | 20–24px | 400–500 | Primary cooking instruction in Focus Mode |
| Body | 16–18px | 400 | General content and task card previews |
| Supporting | 14–16px | 400–500 | Metadata, secondary content |
| Micro label | 12–13px | 600 | Compact status tags only; never for cooking-critical data |

**Rules:**
- Use a line height of at least 1.5 for cooking instructions.
- Maximum line length: 70 characters for instruction text.
- Use sentence case for all labels and tags. Avoid all-caps micro labels.

---

## 5. Spacing and Layout

Use a 4px-based spacing scale.

| Token | Value | Typical Usage |
|---|---:|---|
| `space.1` | 4px | Icon and text spacing |
| `space.2` | 8px | Compact internal spacing, gap between touch targets |
| `space.3` | 12px | Small component gaps |
| `space.4` | 16px | Standard padding |
| `space.5` | 20px | Related section spacing |
| `space.6` | 24px | Card and panel padding |
| `space.8` | 32px | Major section spacing |
| `space.10` | 40px | Large layout separation |
| `space.12` | 48px | Major screen spacing |

**Layout rules:**
- Outer margins: 24px on tablet and desktop; 16px on phone.
- Structure layouts with whitespace (`space.4` to `space.6`) and 1px hairline dividers (`color.border`) rather than multi-layered containers.
- Maximum container nesting: one level. Do not nest secondary cards inside task cards.

---

## 6. Shape, Borders, and Elevation

| Element | Radius | Notes |
|---|---:|---|
| Small controls (checkbox, chip, tag) | 8px | 1px `color.border`, zero shadow |
| Buttons | 10px | Minimum 48px height, 1px border or solid fill, zero shadow |
| Task cards | 12px | 1px `color.border`, 4px phase marker on the left edge, zero shadow |
| Panels | 14px | 1px `color.border`, flat surface on canvas, zero shadow |
| Dialogs and drawers | 16px | `elevation.overlay: 0 4px 20px rgba(0, 0, 0, 0.08)` |

- Standard border: 1px solid `color.border`.
- Shadows: used strictly for floating overlays (drawers, dialogs). Main canvas surfaces and cards sit flat with 0px shadow.

---

## 7. Core Components

### 7.1 Application Header
Contains: app identity wordmark with culinary skillet glyph, current recipe title, back or primary navigation, contextual actions, and workflow progress.
- Keep header height under 72px on tablets.

### 7.2 Recipe Card
Contains: recipe image (4:3 aspect ratio), title, total time, servings, and workflow status indicator.

### 7.3 Phase Lane
Contains: phase name, phase color marker, phase readiness label, completed/total task count, and task list.
- Completed tasks collapse into a "Completed (n)" group at the bottom of the lane.
- Each lane scrolls independently.

### 7.4 Task Card
Contains: task title, short instruction preview, task status (icon plus label), ingredient summary chips, optional duration, and prerequisite dependency lines.
- Minimum card height: 72px.
- Use a 4px left-border accent corresponding to the phase color token (`phase.prep`, `phase.sauce`, `phase.cooking`).
- No secondary gray container boxes inside the card.
- Cards in Ready state show a primary "Start" action. Blocked cards show a prerequisite link.

### 7.5 Ingredient Summary Chip
- Compact label showing ingredient name and quantity.
- Show at most three chips on a card; beyond three, show "+ n more" as an accessible modal trigger.

### 7.6 Ingredient Panel
Contains: ingredient name, quantity, binary prep status checkbox (`Pending` / `Prepared`), and mapped task reference.
- Tablet landscape: collapsible side panel, 320–360px wide.
- Phone: bottom sheet.

### 7.7 Timer
Each task supports sequential timed cooking stages.

| State | Visual | Behavior |
|---|---|---|
| Idle | Duration shown, "Start" action | Not running |
| Running | Large countdown, "Pause" action | Counts down steadily; NO continuous pulsing |
| Paused | Countdown with "Paused" label, "Resume" action | Holds value |
| Expired | "Time's up" label, persistent highlight, audible cue | Flashing/pulsing alert ONLY upon expiry; does not auto-complete task |
| Stage complete | "Stage n done" label | Prompts next action (such as Flip) |

- Sequential timer stages appear as a numbered list (e.g. "1. First side, 2:00", "2. Second side, 2:00").
- Provide an isolated "+30 s" extension button spaced at least 12px from pause/resume.

### 7.8 Flip Action (Two-Sided Cooking)
- Appears between timer stages when a stage completes (e.g. "Flip tofu").
- Advances to the next timer stage; does not complete the task.

### 7.9 Completion Control & Bidirectional Navigation
- Labeled with a clear verb: "Mark Task Complete & Continue".
- Minimum 56px tall in Focus Mode. Full width on phone.
- **Manual Override requirement:** When a completion control is gated by an active timer or prerequisite, the Manual Override control must have a minimum 48px touch target.
- **Persistent Bidirectional Navigation:** Focus Mode must always provide an explicit, tap-safe (≥ 48px) "Previous Task" button. Do not rely solely on transient 5-second undo snackbars.

### 7.10 Blocked State
- Status label: "Blocked," with a lock icon.
- Explain the specific prerequisite with an anchor jump link: "Waiting for: Heat cast-iron pot (Step 3.1)".
- Use `color.warning` for border/icon and `text-primary` for copy.

### 7.11 Progress Indicator
- Show text value and bar: "3 of 14 tasks completed (21%)."
- Progress definition: completed tasks divided by total tasks (`completed / total`).

### 7.12 Status Badge
- Static icon + text label. Badges remain static during normal operation.

### 7.13 Collapsible Image
- Instructional images collapse to a header bar (e.g. "Target: blistered golden edges").

### 7.14 Sync and Connection Status
- Show persistent, compact network state in header or footer: "Synced", "Offline: changes saved locally", or "Reconnecting".

### 7.15 Screen-Awake Indicator
- Static status pill: "Screen awake".
- Degraded state fallback: If OS revokes WakeLock, display `color.warning` pill: "Screen Lock Active: Tap to keep awake".

---

## 8. Status Vocabulary

### 8.1 Task Status

| Status | Label | Icon | Color | Meaning |
|---|---|---|---|---|
| `pending` | Pending | Empty circle | `text-secondary` | Waiting; prerequisites not yet met |
| `ready` | Ready | Arrow in circle | `primary` | Prerequisites met; can start |
| `in_progress` | In progress | Play | `info` | Started and not complete |
| `blocked` | Blocked | Lock | `warning` | Cannot start; prior task incomplete |
| `completed` | Completed | Check | `success` | Confirmed done by cook |

### 8.2 Ingredient Preparation Status

Ingredients use a binary checklist model:

| Status | Label | Icon | Meaning |
|---|---|---|---|
| `pending` | Pending | Empty circle | Not yet prepared or measured |
| `prepared` | Prepared | Check | Ready for cooking |

*Note: Task dependency gates depend strictly on prior task completions (Task-to-Task prerequisites), not on granular ingredient states.*

### 8.3 Phase States

| Concept | Labels | Definition |
|---|---|---|
| Phase readiness | Ready to start, Waiting on [phase name] | Whether required prior phase tasks are satisfied |
| Phase completion | In progress, Complete, "n of m tasks done" | Progress count of tasks in phase |

### 8.4 Task Status vs Completion

- A task is marked "completed" only upon cook confirmation.
- Timer expiration or stage completion does not auto-advance task status.

---

## 9. Interaction and Affordance Rules

- Minimum touch target: 48 × 48px for all interactive elements. Primary cooking actions: 56px or larger.
- Maintain at least 8px between adjacent touch targets.
- Focus indicator: 2px solid `color.focus` (`#245C43`) with 2px offset.
- Disabled controls must state the reason directly adjacent to the control.
- Focus Mode must provide an accessible, permanent "Back to Board" escape header action (≥ 48px touch target).
- Confirm destructive actions: deleting a phase, deleting a task, or aborting a cooking session.

---

## 10. Motion and Animation Rules

- **Zero Continuous Animations:** Prohibit continuous looping animations (`animate-pulse`, `animate-ping`, continuous spinners) during normal cooking states.
- **Alarms and Expiry Only:** Pulsing visual alerts are permitted exclusively when an active timer reaches `00:00` or an emergency alert fires.
- **Steady State Indicators:** Running timers, active tasks, and screen-awake pills remain solid and static.
- **Duration:** 150–200 ms for discrete user transitions; maximum 300 ms.
- **Reduced Motion:** When user prefers reduced motion, remove transitions except opacity changes (≤ 100 ms).

---

## 11. Responsive Behavior

### 11.1 Breakpoints

| Name | Width | Layout |
|---|---|---|
| Phone | Below 768px | One task at a time, Focus Mode first |
| Tablet portrait | 768–1023px | One phase lane at a time with phase selector |
| Tablet landscape | 1024–1279px | Two phase lanes visible; third lane scrolls horizontally |
| Desktop | 1280px and above | Three phase lanes visible |

### 11.2 Lane Widths & 1024px Layout Collapse Rule

- Minimum lane width: 320px.
- Desktop: three equal lanes with 24px gutters.
- **1024px iPad Landscape Rule:** On 1024px displays, opening the 320px ingredient panel automatically collapses the board into 1 active lane with a sticky horizontal phase switcher to prevent horizontal viewport clipping.

### 11.3 Per-Device Behavior

#### 11.3.1 Tablet Landscape (Primary Cooking Layout)
- Displays two phase lanes simultaneously.
- Ingredient panel is collapsible without unmounting the board.

#### 11.3.2 Tablet Portrait
- Shows one lane at a time via segmented phase selector: Prep, Sauce, Cooking.
- Full-width task cards with minimum 48px touch areas.

#### 11.3.3 Phone
- Focus Mode first (one task at a time).
- Completion CTA is full-width at screen bottom (56px tall).
- Ingredients open in a bottom sheet.

#### 11.3.4 Desktop
- Three full lanes displayed with side ingredient panel.

---

## 12. Accessibility

- Target: WCAG 2.2 AA.
- Text contrast: 4.5:1 minimum; 3:1 for large text (24px or 18.66px bold).
- Non-text contrast (icons, borders conveying state, focus indicators): 3:1 minimum.
- Every status uses an icon paired with a text label.
- Respect reduced motion and system accessibility settings.

---

## 13. Screen Inventory

1. **Recipe Library:** Browse and search synced Mealie recipes.
2. **Recipe Overview:** Inspect ingredients and original instructions before workflow generation.
3. **Workflow Editor:** Edit phases, reorder tasks, and link dependencies.
4. **Workflow Board:** Parallel multi-lane cooking workspace.
5. **Focus Mode:** Dedicated arm's-length step execution view (launched from Workflow Board with permanent Back to Board navigation).
6. **Ingredient Checklist:** Mise-en-place tracking panel/sheet.

---

## 14. States and Copy

| State | Message | Next Action |
|---|---|---|
| No recipes found | "No recipes found. Check your Mealie connection or try a different search." | Clear search |
| Recipe loading | Skeleton cards with "Loading recipes" label | None |
| Mealie unavailable | "Can't reach Mealie right now. Your saved copy is still available." | Retry, Use saved copy |
| Recipe has no instructions | "This recipe has no instructions in Mealie." | Add instructions manually |
| Workflow not generated | "This recipe doesn't have a workflow yet." | Generate workflow |
| Instructions unassigned | "3 instructions aren't assigned to a phase." | Review unassigned |
| Ingredients unmapped | "2 ingredients aren't linked to a task." | Review ingredients |
| Save failed | "Your changes couldn't be saved. They're still on this screen." | Retry |
| Task blocked | "Waiting for: [prerequisite task name]." | Jump to prerequisite |
| Offline or reconnecting | "Changes saved locally. Syncing will resume when reconnected." | None (automatic) |

---

## 15. Canonical Sample Data (Sukiyaki)

All screens use these standardized values:

| Ingredient | Quantity | Preparation | Notes |
|---|---|---|---|
| Beef ribeye | 400 g | Shaved 2 mm | |
| Firm tofu (momen) | 350 g | Pressed 15 min, cut into 8 squares | |
| Napa cabbage (Hakusai) | 600 g (1/2 head) | Cut into 5 cm chunks | |
| Fresh shiitake mushrooms | 6 large caps | Stems pruned, caps carved | |
| Tokyo negi | 2 stalks | Cut diagonally into 4 cm pieces | |
| Shirataki noodles | 200 g (1 pouch) | Drained, parboiled 2 min, cut in half | |
| Pasteurized grade-A eggs | 4 | Cracked into bowls before serving | |
| Koikuchi shoyu | 100 ml | Measured into heat-safe beaker | |
| Hon-mirin | 100 ml | Measured | |
| Granulated sugar | 40 g (3 tbsp) | Measured | |
| Junmai sake | 50 ml | Measured | |
| Kombu dashi | 100 ml | Steeped, held in pitcher | |
| Beef tallow | 1 cube (15 g) | Melted in pot | |

**Fixed Parameters:**
- Servings: 4.
- Pan preheat target: 190°C.
- Sear time: 2:00 per side, two stages.
- Progress definition: completed tasks divided by total tasks (`completed / total`).
- Phases: Prep (5 tasks), Sauce (4 tasks), Cooking (5 tasks); Total 14 tasks.

---

## 16. Design Quality Checklist

Before finalizing any screen:
- Can the user identify the screen purpose immediately?
- Is the most important action visually prominent?
- Is the interface legible from arm's length (minimum body text 16px)?
- Are touch targets at least 48px, and 56px for primary cooking actions?
- Does manual override have at least a 48px touch target?
- Does Focus Mode provide an accessible Back to Board control and previous step navigation?
- Are continuous looping animations absent from normal cooking states?
- Are task cards flat and de-nested, using 4px left-border phase accents?
- Is the brand primary green standardized to `#245C43`?
- Does the layout handle 1024px tablet landscape without viewport overflow?
- Do all quantities match Section 15?

---

## 17. Stitch Implementation Note

Use this document as the visual and interaction specification for the entire Stitch project. When generating or refining screens, preserve these tokens, component rules, and responsive constraints.
