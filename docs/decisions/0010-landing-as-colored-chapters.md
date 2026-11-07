# 0010. The landing page as full-screen chapters in all five colors

Status: Accepted. Amends [0009](0009-design-direction.md) for the landing page.

## Context

The first landing page after decision 0009 kept the first version's section layout: a small heading, a paragraph and a grid, on white or a pale band. Reviewing it, the team found two problems. It looked too much like the earlier project except for the hero, and the palette was barely used: lavender, periwinkle, wine and coral appeared only as small decoration, so the page read as white with one purple. The landing page is the first impression of the project, so it needs to be memorable.

## Decision

Keep the hero, the floating menu and the logo as they are. Rebuild everything below the hero as a stack of full-screen **chapters**, in the manner of a vertical slider:

- Each chapter opens with a **title screen**: the chapter name set very large (up to about 150 px) and centered, a one-sentence point under it, a chapter number, large faint ripple rings behind, and a scroll cue. Content screens follow, each at least one window tall with its content centered.
- Each chapter has its own **tone**, a gradient that uses the palette as real surfaces, with the meaning from 0009 kept: wine for the problem, royal purple for the solution, a pale mist for the example, periwinkle for Stellar, white for the questions, and royal to wine for the closing. Lavender and coral appear as glows, icons and number discs. Chapters overlap with rounded top corners, like sheets sliding over each other.
- Body text is larger (about 18 to 30 px) and the cards are roomier.
- Scrolling settles on screens with CSS scroll snapping (`proximity`, so tall content is never trapped), blocks rise in as they enter the window, and a pager of dots on the right edge shows the current chapter on large screens.

Implementation choices:

- A tone is a CSS class that sets a handful of variables (`--slide-title`, `--slide-text`, `--slide-muted`, `--slide-accent`, the two gradient ends and two glows). Components use `text-slide-title` and similar utilities, so they work on any tone. Cards reset the variables to the light values, so a white card is readable on any chapter.
- The contrast test reads every `.tone-*` block of `globals.css` and checks the text colors against both gradient ends (4.5:1 for body, muted and title text, 3:1 for the large accent line). A new tone cannot ship with unreadable text.
- Entrance effects use CSS scroll-driven animation and need no script. Browsers without support show the content immediately. Reduced motion turns off the animations and the snapping.

## Consequences

- 0009's "light only" now applies to the app screens. The landing page has dark and colored chapters, and coral is also used for number discs and icons on the dark ones. Bright colors are still never small text.
- Wine text on periwinkle is 4.2:1, so it is used only for large lines, and the test enforces the 3:1 large-text rule for the accent.
- The landing page is about 13 screens tall at 1440 by 900 instead of about 8, which is the cost of the slider style. The menu and the pager give shortcuts.
- Scroll snapping is a progressive enhancement and was only checked in Chromium.
- The design system document describes the chapters and the tones.
