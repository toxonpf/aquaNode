# Languages

Language changes animate in place through `shared/motion/localeTransition.ts`.
Visible heading words leave downward in reverse order; body copy uses the
existing shorter blur/13px motion. The external-store update is committed only
after the old text leaves, then `Heading` plays its normal word entrance.
Repeated selections resolve to the latest requested language without remounting
routes, maps or profiles. Reduced-motion users switch immediately. The shared
`data-locale-phase` states are `leaving`, `swapping`, `resizing`, `measuring` and `entering`.

The transition discovers visible text owners (including captions, dates,
diagram labels, controls, portrait labels and audio text), rather than relying
on a fixed tag list. Photographs, SVG artwork and 3D canvases stay stationary.
New elements keyed by translated copy are prepared synchronously after the
React commit and before the next paint; do not insert a requestAnimationFrame
gap between committing the translation and hiding the incoming text.
`tests/ui/language-motion.spec.ts` samples consecutive frames of recreated
module labels to check their appearance is monotonic, with no full-opacity flash.

`localeLayout.ts` captures the visible layout before the language commit and
uses GSAP Flip to interpolate positions, widths and heights over 0.52 seconds.
It changes dimensions rather than scaling text or imagery. Boxes are matched by
DOM position when translated React keys recreate cards. The layout animation
owns geometry; the copy animation owns opacity. Temporary inline dimensions
and matching IDs are removed at the end, so subsequent resizing remains fluid.
Incoming text stays hidden until the destination font is ready, layout motion
has completed and temporary dimensions are removed. Headings refit at the final
width before their word entrance starts, keeping line breaks stable throughout
the reveal. Do not overlap text entrance with width interpolation.

The public interface defaults to Russian. The RU / EN / 繁 menus in the header and footer save the selection under `aquanode.locale` in local storage. Switching languages updates the mounted interface through a shared React external store. The route, scroll position, open controls and 3D scene stay in place. Shared editorial records rebuild from their English source; component-local catalogs are resolved during rendering.

`src/features/i18n/i18n.ts` sets the document language and resolves `t(english, values?)` before React renders. Translate complete phrases, including accessible names; use named placeholders such as `{name}` for variable text. Do not translate rendered DOM nodes: headings and body motion depend on the original React text.

English source phrases stay beside the components. Traditional Chinese (Taiwan, `zh-TW`) copy lives in `src/features/i18n/locales/zh-TW.ts`. Chinese headings use word segmentation so that animated spans retain natural wrapping and punctuation. The font stack prefers Noto Sans TC, PingFang TC and Microsoft JhengHei, with system fallbacks. Dates use the Taiwan locale. Russian copy lives in `src/features/i18n/locales/ru.ts`, `ru-story.ts`, `ru-learning.ts`, and `ru-build.ts`. The shared records in `src/data/catalog.ts` are localized by `src/data/content.ts`. Preserve URLs, filenames, revision numbers, component identifiers and source attribution. Engineering downloads and text embedded in original drawings/certificates retain their source language.

The existing Playwright suite explicitly selects English. `tests/ui/localization-footer.spec.ts` checks the default Russian version, saved language selection, document metadata, navigation and narrow layouts.

Russian reading copy and headings use the locally hosted variable Golos Text font. The official font file is from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/golostext); the authors' [repository](https://github.com/googlefonts/golos-text) documents its design. The SIL Open Font License is included at `public/fonts/golos-text/OFL.txt`. Latin interface typography and the SVG wordmark retain their existing designs.

The language popup supports arrow keys, Home/End, Escape, outside clicks and focus return. It opens upwards near the footer and stays within a 16px viewport gutter. `tests/helpers/language.ts` selects a language through the menu; `tests/ui/taiwan-language.spec.ts` checks persistence, live rendering, keyboard operation and narrow layouts.

The website architecture illustration is localized into all three languages. `ArchitectureImage` chooses a separate vertical SVG composition below 761px. Generate the six editable SVG files with `node scripts/design-architecture.mjs`; the supplied original remains unchanged. The overview download also has a Traditional Chinese version; machine-readable source records and attribution retain their original language.

Current revC engineering copy is layered through `ru-revc.ts` and `zh-revc.ts`; prior dictionaries retain historical keys. Overviews and diagrams have separate RU, EN and zh-TW assets under `ec-ph-revc` URLs. `tests/pages/revc-content.spec.ts` compares published status with source reports and verifies pH selection/live localization.
