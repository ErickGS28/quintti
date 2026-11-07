# 0009. Design direction: light Cupertino in the new purple palette

Status: Accepted

## Context

The product changed from a disaster fund to a building treasury, and the visual identity was on hold. The first version of the project used a light, Cupertino-style interface with a floating pill menu, a minimal centered hero and a hummingbird logo. The team supplied a new palette: `#4525A2`, `#A677CA`, `#ABA7E3`, `#890C50` and `#EB5F7A`. A reference image with a dark, high-tech look was given only as a color sample, not as a style to copy.

## Decision

Keep the structure of the first version's landing page (the menu, the hero, the logo) and the Cupertino direction, and apply the new palette. The interface is light only.

Give the colors meaning: purple for titles, actions and "approved or paid"; wine and coral for the problem side and for what the rules block; lavender and periwinkle only as decoration. The palette has no green, so success is never shown by color alone.

Tell the landing page as an argument (problem, solution, a clickable example, why Stellar) and keep it honest about what is simulated.

Write the interface code fresh in this repository. Only the logo's vector paths were reused as an asset.

## Consequences

- Text uses `royal`, `wine` and `ink`. The bright colors fail contrast for small text, and a test enforces it.
- The example on the page is a simulation. It is labelled as one and is backed by a tested state machine that applies the same budget rule as the contract.
- The brand tokens live in one file, `frontend/src/app/globals.css`, so a later change of palette is a change in one place.
- The logo is still a traced vector and should be replaced by the designer's file.
- Details are in [07-design-system.md](../07-design-system.md).
