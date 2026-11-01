# Kitchen Workflow Design System

> Design specification for Google Stitch. Apply these tokens and component rules to every screen and responsive variant. Preserve this design language unless a documented change is made in this file.

---

## 1. Design intent

Design a premium, practical kitchen workspace for organizing and executing complex recipes.

The interface must be:

- Functional rather than decorative.
- Calm, clear, and easy to scan.
- High-contrast and readable at arm's length.
- Touch-first, especially on tablets.
- Consistent across recipe browsing, workflow editing, and cooking execution.

Avoid generic SaaS dashboard styling, food-blog layouts, social-feed patterns, gradients, glassmorphism, and decorative animation.

---

## 2. Brand and visual character

- **Personality:** Capable, calm, organized, precise, approachable.
- **Visual metaphor:** A well-organized kitchen work surface with distinct work areas, clear labels, practical tools, and visible progress.
- **Primary accent:** Deep forest green.
- **Neutrals:** Warm off-white surfaces, soft stone borders, charcoal text.
- **Secondary accents:** Restrained earth and ingredient-inspired tones. Use sparingly. Never as the only status indicator.

---

## 3. Color tokens

### 3.1 Light theme (the only theme in this version)

A dark theme is out of scope for this version. Revisit it after the light theme is validated in a dim kitchen.

| Token | Hex | Usage |
|---|---|---|
| `color.canvas` | `#F5F5F0` | App background |
| `color.surface` | `#FFFFFF` | Cards, panels, dialogs |
| `color.surface-subtle` | `#ECEDE7` | Secondary surfaces, input backgrounds, disabled fills |
| `color.text-primary` | `#20251F` | Main text and headings |
| `color.text-secondary` | `#5F675F` | Supporting text, metadata, muted labels |
| `color.border` | `#D9DDD4` | Dividers, card borders |
| `color.border-strong` | `#8E968E` | Input borders, focus-adjacent outlines (3:1 against surface) |
| `color.primary` | `#245C43` | Primary actions, selected navigation |
| `color.primary-hover` | `#194A35` | Hover and pressed primary |
| `color.primary-subtle` | `#E4EEE7` | Selected or highlighted surfaces |
| `color.on-primary` | `#FFFFFF` | Text and icons on primary |
| `color.success` | `#287A4B` | Completed states |
| `color.warning` | `#A86416` | Caution, attention |
| `color.danger` | `#B33B32` | Destructive actions, errors |
| `color.info` | `#356B8C` | Informational states |
| `color.focus` | `#245C43` | Focus ring (2px, 2px offset) |

**Text color rule:** Do not use `text-muted` for text. Use `text-secondary` for all metadata and supporting text. Disabled text may be lighter, but it must be paired with a reason or label.

### 3.2 Contrast check (WCAG 2.2 AA)

| Pair | Approx. ratio | Result |
|---|---:|---|
| `text-primary` on `canvas` | 14+:1 | Pass |
| `text-secondary` on `surface` | 5.8:1 | Pass (body and small text) |
| `text-secondary` on `surface-subtle` | 5.0:1 | Pass |
| `primary` on `surface` | 7.6:1 | Pass |
| `success` on `surface` | 5.3:1 | Pass |
| `warning` on `surface` | 4.7:1 | Pass (text) |
| `danger` on `surface` | 5.9:1 | Pass |
| `info` on `surface` | 5.9:1 | Pass |
| `phase.prep` on `surface` | 4.8:1 | Pass (text) |
| `phase.cooking` on `surface` | 5.0:1 | Pass (text) |
| `phase.serving` on `surface` | 4.4:1 | Fails for small text; use for markers and borders only |
| `phase.sauce` on `surface` | 3.7:1 | Fails for text; use for markers and borders only |
| `phase.sauce-text` on `surface` | 5.9:1 | Pass; use for sauce phase labels |

These ratios were calculated by hand. Verify them with a contrast checker before final approval.

### 3.3 Phase colors

Phase colors identify lanes. They are never status colors.

| Token | Hex | Usage |
|---|---|---|
| `phase.prep` | `#537B60` | Preparation lane marker, header accent, border |
| `phase.sauce` | `#B17A3D` | Sauce lane marker and border only |
| `phase.sauce-text` | `#8A5A22` | Sauce lane label text |
| `phase.cooking` | `#A65B45` | Cooking lane marker, header accent, border |
| `phase.serving` | `#657A9A` | Assembly or serving marker and border only |

**Phase rules:**

- Phase colors must never appear in status badges, buttons, checkmarks, or warnings.
- Phase names and labels are always visible. Users must never need to learn a color to understand a lane.
- Do not fill task cards with phase colors. Use a 4px left border or a small marker.

---

## 4. Typography

Use a legible sans-serif such as Inter, Geist, or a comparable system sans-serif. Use one family across the app.

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 32–40px | 650–700 | Recipe title on overview screens |
| Page heading | 26–32px | 650–700 | Screen title |
| Section heading | 20–24px | 600–650 | Phase names, panel headings |
| Task title | 18–22px | 600 | Task card title |
| Instruction | 20–24px | 400–500 | Primary cooking instruction in Focus Mode |
| Body | 16–18px | 400 | General content and task card previews |
| Supporting | 14–16px | 400–500 | Metadata, secondary content |
| Micro label | 12–13px | 600 | Compact status tags only; never for cooking-critical information |

**Rules:**

- Use a line height of at least 1.5 for instructions.
- Keep line length under about 70 characters for instruction text.
- Never reduce primary cooking instructions to dashboard-sized text.
- Use sentence case for labels. Use all caps only for micro labels, with letter spacing of 0.04em.

---

## 5. Spacing and layout

Use a 4px-based spacing scale.

| Token | Value | Typical usage |
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

- Use a consistent outer margin of 24px on tablet and desktop, and 16px on phone.
- Align task cards within their phase lanes.
- Give the Workflow Board most of the available width.
- Use collapsible panels when space is limited.
- Limit card nesting to two levels.
- Prefer whitespace and alignment over decorative dividers.

---

## 6. Shape, borders, and elevation

| Element | Radius | Notes |
|---|---:|---|
| Small controls (checkbox, chip, tag) | 8px | Chips may use pill shape only for status tags |
| Buttons | 10px | |
| Task cards | 12px | 1px `color.border`, 4px phase marker on the left edge |
| Panels | 14px | |
| Dialogs and drawers | 16px | |

- Standard border: 1px solid `color.border`.
- Shadows: very subtle, used only for overlays such as drawers and bottom sheets.
- Use borders and surface contrast before shadows.
- Reserve pill shapes for compact status tags and count badges.

---

## 7. Core components

### 7.1 Application header

Contains: app identity, current recipe or page title, back or primary navigation, contextual actions, and optional workflow progress on cooking screens.

- Keep the header under 72px tall on tablets.
- Navigation labels must never wrap mid-word. Use short labels or an overflow menu.
- Do not show a broken or placeholder logo. Use a text wordmark until a logo exists.

### 7.2 Recipe card

Contains: recipe image (4:3 aspect ratio), title, total time when available, servings when available, and a workflow status indicator.

### 7.3 Phase lane

Contains: phase name, optional one-line description, phase color marker, phase readiness label, completed/total task count, task list, and an optional add-task action in edit mode.

- Completed tasks collapse into a "Completed (n)" group at the bottom of the lane.
- Each lane scrolls independently.

### 7.4 Task card

Contains: task title, short instruction preview, task status (icon plus label), ingredient chips or ingredient count, optional duration (only when meaningful), and a dependency or blocked line when relevant.

- Minimum card height: 72px.
- The card body opens task details. The completion control is a separate target on the card and must never be confused with opening details.
- Cards in the Ready state show a primary "Start" action. Blocked cards show no start action.

### 7.5 Ingredient chip

- Compact label showing an ingredient name, or name plus quantity on Focus Mode.
- Show at most three chips on a task card. Beyond three, show "+ n more" as an expandable control.

### 7.6 Ingredient panel

Contains: station or group headings, ingredient name and quantity, preparation status (icon plus label), a check control, and mapped task references.

- Tablet landscape: collapsible side panel, 320–360px wide. Must not replace the Workflow Board.
- Phone: bottom sheet opened from a labeled button, for example "Ingredients (4)."

### 7.7 Timer

Each task supports one or more timers. Each timer has these states:

| State | Visual | Behavior |
|---|---|---|
| Idle | Duration shown, "Start" action | Not running |
| Running | Large countdown, "Pause" action | Counts down |
| Paused | Countdown with "Paused" label, "Resume" action | Holds value |
| Expired | "Time's up" label, persistent highlight, audible cue | Does not complete the task |
| Stage complete | "Stage n done" label | Prompts the next action (such as Flip) |

- Timer expiry plays a visible and audible cue but never completes the task.
- Sequential timer stages appear as a numbered list, for example "1. First side, 2:00" and "2. Second side, 2:00." Show the current stage and queued stages.
- Expose the remaining time in text, not only on the progress ring.
- Provide a "+30 s" control for extensions.

### 7.8 Flip action (two-sided cooking)

- Appears between timer stages when a stage completes.
- Labeled with the action, for example "Flip tofu."
- Tapping it advances to the next stage. It does not complete the task.

### 7.9 Completion control

- Labeled with a clear verb: "Mark task complete."
- Minimum 56px tall in Focus Mode. Full width on phone.
- When disabled, show the reason directly beside or below the button, for example "Finish second side (1:42 left)."
- Completing a task shows a brief confirmation with the next task's name.

### 7.10 Blocked state

- Status label: "Blocked," with a lock icon.
- Explain the specific prerequisite and show a link: "Waiting for: Pan reaches 190°C. Jump to prerequisite."
- Use `color.warning` for the border and icon, with text in `text-primary`.

### 7.11 Progress indicator

- Show a text value and a bar: "5 of 14 tasks completed."
- Use one progress definition everywhere: completed tasks divided by total tasks in the workflow.
- Do not use color alone to show progress. The text is required.

### 7.12 Status badge

Each status uses an icon, a text label, and a restrained color. See Section 8.

### 7.13 Collapsible image

- Instructional images can be collapsed to a header bar, for example "Target: blistered golden edges."
- Default state in Focus Mode: expanded on tablet landscape, collapsed on phone.

### 7.14 Sync and connection status

- Show a persistent, compact status in the footer or header: "Synced," "Syncing," "Offline: changes saved on this device," or "Reconnecting."
- Show who last updated a task when the session has more than one member.

### 7.15 Screen-awake indicator

- Show a small, unobtrusive label in Focus Mode: "Screen awake."
- Do not use this indicator for anything else.

---

## 8. Status vocabulary

Use these labels exactly. Each status has an icon and a label. Color supports the status but never replaces it.

### 8.1 Task status

| Status | Label | Icon | Color | Meaning |
|---|---|---|---|---|
| `pending` | Pending | Empty circle | `text-secondary` | Waiting; prerequisites not yet met or not yet scheduled |
| `ready` | Ready | Arrow in circle | `primary` | Prerequisites met; can start |
| `in_progress` | In progress | Play | `info` | Started and not complete |
| `blocked` | Blocked | Lock | `warning` | Cannot start; prerequisite named |
| `completed` | Completed | Check | `success` | Done |

### 8.2 Ingredient status

| Status | Label | Icon | Meaning |
|---|---|---|---|
| `pending` | Pending | Empty circle | Not yet started |
| `preparing` | Preparing | Half-filled circle | Being prepared |
| `prepared` | Prepared | Check | Ready for use |
| `in_use` | In use | Flame | Currently in a cooking step |
| `consumed` | Consumed | Filled check | Used up in the recipe |

Ingredient status is independent of task status. Completing a preparation task does not mark downstream cooking tasks complete.

### 8.3 Phase states

| Concept | Labels | Definition |
|---|---|---|
| Phase readiness | Ready to start, Waiting on [phase name] | Whether the phase's required prerequisites are satisfied |
| Phase completion | In progress, Complete, "n of m tasks done" | Whether the phase's tasks are done |

Readiness and completion are separate. Do not display both as a single badge.

### 8.4 Task status vs. completion

- A task is "completed" only when the user confirms it.
- A timer expiring, a stage ending, or a flip does not change task status to completed.

---

## 9. Interaction rules

- Primary actions are visually obvious: one primary button per view.
- Minimum touch target: 48 × 48px. Primary cooking actions: 56px or larger. Keep at least 8px between adjacent targets.
- Provide visible pressed, focused, disabled, and loading states for every control.
- Focus indicator: 2px solid `color.focus` with 2px offset, visible on all backgrounds.
- Disabled controls must show a reason. Do not disable a control without explaining why.
- Task completion is a single, forgiving action. Do not require a confirmation dialog for normal completion, but provide an undo for 5 seconds.
- Avoid drag-and-drop as the only way to move tasks. Provide a "Move to phase" menu.
- Avoid hover-only controls. Every action must be reachable by touch and keyboard.
- Confirm destructive actions: deleting a phase, deleting a task, removing an ingredient mapping, or ending a cooking session.
- Preserve scroll position and board context when opening and closing task details.
- Use dialogs sparingly. Prefer inline editing and side panels for workflow editing.
- Minimal navigation during active cooking. Focus Mode should not show unrelated navigation.

---

## 10. Motion

- Duration: 150–200 ms for state transitions. No transition longer than 300 ms.
- Easing: ease-out for entering, ease-in for exiting.
- Allowed: task completion state change, ingredient drawer open and close, brief check feedback on ingredient rows.
- Not allowed: continuous or looping animation, celebratory effects during normal completion, layout shifts while the user is reading.
- Reduced motion: when the user prefers reduced motion, remove all transitions except opacity changes, which must not exceed 100 ms.

---

## 11. Responsive behavior

### 11.1 Breakpoints

| Name | Width | Layout |
|---|---|---|
| Phone | Below 768px | One task at a time, Focus Mode first |
| Tablet portrait | 768–1023px | One phase lane at a time, phase selector |
| Tablet landscape | 1024–1279px | Two phase lanes visible, third lane scrolls horizontally |
| Desktop | 1280px and above | Three phase lanes visible |

### 11.2 Lane widths

- Minimum lane width: 320px.
- Desktop: three equal lanes with 24px gutters.
- Tablet landscape: two lanes at 1/2 width each, with the third lane reachable by horizontal scroll and a visible scroll cue.
- Ingredient side panel (tablet landscape): 320–360px, collapsible. When open on 1024–1279px, reduce the lane count to two and keep the third lane reachable by scroll.

### 11.3 Per-device behavior

**Tablet landscape (primary layout)**

- Show multiple phase lanes simultaneously.
- Keep the header compact.
- Keep the ingredient panel open or openable without replacing the board.

**Tablet portrait**

- Show one lane at a time, selected by a labeled segmented control: Prep, Sauce, Cooking, with per-phase counts.
- Full-width task cards with 48px minimum touch areas.
- Blocked cards show a "Blocked by" line.

**Phone**

- One task at a time in Focus Mode.
- Completion control full width at the bottom of the screen, 56px tall.
- Previous and next in a row beneath it.
- Timer above the instruction.
- Ingredients open in a bottom sheet.

**Desktop**

- Wider multi-lane layout.
- Use available space for the board and the optional ingredient panel.
- Do not make the interface feel like a dense enterprise dashboard.

---

## 12. Accessibility

- Target: WCAG 2.2 AA.
- Text contrast: 4.5:1 minimum; 3:1 for large text (24px or larger, or 18.66px bold).
- Non-text contrast (icons, borders that convey state, focus indicators): 3:1 minimum.
- Every status has an icon and a text label.
- Respect keyboard navigation and visible focus indicators.
- Respect reduced-motion preferences.
- Screen readers: announce timer expiry, task completion, and blocked-state changes.

---

## 13. Screen inventory

Apply the same tokens and component rules to all screens:

1. Recipe Library
2. Recipe Overview
3. Workflow Editor
4. Workflow Board
5. Focus Mode
6. Ingredient Checklist

Each screen must answer these questions immediately:

- What is this screen for?
- What is the most important action?
- What can I do in parallel?
- Which task or ingredient is blocking me?

---

## 14. States and copy

Each state explains what happened and gives one clear next action. Avoid generic errors.

| State | Message | Next action |
|---|---|---|
| No recipes found | "No recipes found. Check your Mealie connection or try a different search." | Clear search |
| Recipe loading | Skeleton cards with a "Loading recipes" label | None |
| Mealie unavailable | "Can't reach Mealie right now. Your saved copy is still available." | Retry, Use saved copy |
| Recipe has no instructions | "This recipe has no instructions in Mealie." | Add instructions manually |
| Workflow not generated | "This recipe doesn't have a workflow yet." | Generate workflow |
| Instructions unassigned | "3 instructions aren't assigned to a phase." | Review unassigned |
| Ingredients unmapped | "2 ingredients aren't linked to a task." | Review ingredients |
| Save failed | "Your changes couldn't be saved. They're still on this screen." | Retry |
| Task blocked | "Waiting for: [prerequisite name]." | Jump to prerequisite |
| Offline or reconnecting | "Changes saved on this device. They'll sync when you're connected." | None (status updates automatically) |

---

## 15. Canonical sample data (Sukiyaki)

All screens must use these values. Do not invent quantities, temperatures, or durations that are not listed here.

**Verify every value against the Mealie recipe before final approval.** Values marked "Verify" conflict across the reviewed screens.

| Ingredient | Quantity | Preparation | Notes |
|---|---|---|---|
| Beef ribeye | 400 g | Shaved 2 mm | |
| Firm tofu (momen) | 350 g | Pressed 15 min, cut into 8 squares | Verify: one screen showed 300 g |
| Napa cabbage (Hakusai) | 600 g (1/2 head) | Cut into 5 cm chunks | |
| Fresh shiitake mushrooms | 6 large caps | Stems pruned, caps carved | |
| Tokyo negi | 2 stalks | Cut diagonally into 4 cm pieces | |
| Shirataki noodles | 200 g (1 pouch) | Drained, parboiled 2 min, cut in half | |
| Pasteurized grade-A eggs | 4 | Cracked into bowls before serving | |
| Koikuchi shoyu | 100 ml | Measured into heat-safe beaker | |
| Hon-mirin | 100 ml | Measured | |
| Granulated sugar | 40 g (3 tbsp) | Measured | Verify: one screen showed 45 g |
| Junmai sake | 50 ml | Measured | |
| Kombu dashi | 100 ml | Steeped, held in pitcher | |
| Beef tallow | 1 cube (about 15 g) | Melted in pot | Verify weight |

**Other fixed values:**

- Serves: 4.
- Pan preheat target: 190°C. Verify: one screen showed 185°C.
- Sear time: 2:00 per side, two stages.
- Progress definition: completed tasks divided by total tasks.
- Phases: Prep, Sauce, Cooking.

**Content conventions:**

- Use realistic recipe language. Avoid lorem ipsum.
- Use metric units consistently within a recipe.
- Use the phase names and step names from Section 15 only, unless the workflow editor changes them.

---

## 16. Design quality checklist

Before finalizing any screen, check:

- Can the user identify the screen's purpose immediately?
- Is the most important action visually obvious?
- Can the interface be read from a comfortable distance?
- Are touch targets at least 48px, and 56px for primary cooking actions?
- Is every status shown with an icon and label, not color alone?
- Are dependencies visually different from ordinary task order?
- Can users reach ingredients without losing their place?
- Does the layout work at tablet landscape, tablet portrait, and phone widths?
- Does the screen avoid decoration and unnecessary navigation?
- Do all quantities and progress counts match Section 15?

---

## 17. Stitch implementation note

Use this file as the visual and interaction specification for the entire Stitch project. When generating or refining individual screens, preserve the established design language. Make any deliberate change here first, then apply it to screens.
