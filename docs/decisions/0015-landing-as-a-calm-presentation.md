# 0015. The landing page as a calm presentation, one idea per screen

Status: Accepted. Supersedes [0010](0010-landing-as-colored-chapters.md) and [0011](0011-landing-polish.md) for everything below the hero.

## Context

After 0010 and 0011 the landing page had a wine screen, a royal purple screen, a periwinkle screen and a white one, one after another, with giant chapter words, a scroll arrow under each and rounded sheets overlapping. The team's review was that it looked loud and unprofessional: the saturated colors clashed, the whitespace around the huge titles was wasted, and the page spoke about the hackathon and the source code, which a product page should not.

## Decision

Keep the hero, the menu and the logo. Rebuild everything below as a presentation in the Cupertino spirit (calm surfaces, one clear statement per screen, a lot of air):

- **One idea per screen, one window tall.** Each screen holds a small label, a statement and a supporting sentence, centered, and then its content. On a laptop or larger, scrolling settles on each screen (`scroll-snap-type: y mandatory`); on other devices it is a soft pull. A zero-height snap point at the top lets the page rest on the hero.
- **Fits the window.** Sizes follow the window height, and on windows shorter than 800 px the supporting sentence and the densest extras are dropped. Checked at 1440x900, 1280x720 and 1366x650, including every state of the example. On a phone the screens grow with their content.
- **Colors with restraint.** Light screens carry the page: white to a faint rose for the problem, mist for the example, lilac for Stellar. The solution is the one deep screen, in royal purple only. Wine and coral appear in small accents (a label, an icon, a cross). The five colors are still all present, but never as neighbors at full strength.
- **No arrow, no giant ripple, no grain, no pointer glow.** The scroll cue under each title, the large rings behind it, the film grain and the light that follows the cursor were removed. The card spotlight stays: it works on white cards and on the deep screen.
- **A product voice.** No mention of the hackathon, no links to the code or the contract, no FAQ and no closing call to action for now. What stays is what sells (the problem, the solution in two screens, the clickable example and why Stellar in two screens) and one honest footer line. The example is labelled as a simulation. The limits are in the manual (`/hiw`) and in the docs.

## Consequences

- The landing page is seven screens: the hero, the problem, the solution (two), the example and Stellar (two).
- The contrast test now covers four tones (`rose`, `royal`, `mist`, `lilac`). The wine, periwinkle, canvas and finale tones, the `wine-deep` token and the frosted-white card surface were removed.
- `TitleSlide`, `Slide`, `CursorGlow`, `ScrollToTop`, the FAQ and the closing screen were deleted, with the pointer-follow math they used.
- The problem statements are still unvalidated hypotheses and the page no longer says so; they should be checked against real interviews before the demo is presented as research.
- When the project needs a call to action (open the app, contact) it should come back as one button on the last screen, not as a closing chapter.
