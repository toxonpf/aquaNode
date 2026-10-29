# Languages

The public interface defaults to Russian. The RU / EN / 繁 menus in the header and footer save the selection under `aquanode.locale` in local storage. Switching languages updates the mounted interface through a shared React external store. The route, scroll position, open controls and 3D scene stay in place. Shared editorial records rebuild from their English source; component-local catalogs are resolved during rendering.

`src/features/i18n/i18n.ts` sets the document language and resolves `t(english, values?)` before React renders. Translate complete phrases, including accessible names; use named placeholders such as `{name}` for variable text. Do not translate rendered DOM nodes: headings and body motion depend on the original React text.

English source phrases stay beside the components. Traditional Chinese (Taiwan, `zh-TW`) copy lives in `src/features/i18n/locales/zh-TW.ts`. Chinese headings use word segmentation so that animated spans retain natural wrapping and punctuation. The font stack prefers Noto Sans TC, PingFang TC and Microsoft JhengHei, with system fallbacks. Dates use the Taiwan locale. Russian copy lives in `src/features/i18n/locales/ru.ts`, `ru-story.ts`, `ru-learning.ts`, and `ru-build.ts`. The shared records in `src/data/catalog.ts` are localized by `src/data/content.ts`. Preserve URLs, filenames, revision numbers, component identifiers and source attribution. Engineering downloads and text embedded in original drawings/certificates retain their source language.

The existing Playwright suite explicitly selects English. `tests/ui/localization-footer.spec.ts` checks the default Russian version, saved language selection, document metadata, navigation and narrow layouts.

Russian reading copy and headings use the locally hosted variable Golos Text font. The official font file is from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/golostext); the authors' [repository](https://github.com/googlefonts/golos-text) documents its design. The SIL Open Font License is included at `public/fonts/golos-text/OFL.txt`. Latin interface typography and the SVG wordmark retain their existing designs.

The language popup supports arrow keys, Home/End, Escape, outside clicks and focus return. It opens upwards near the footer and stays within a 16px viewport gutter. `tests/helpers/language.ts` selects a language through the menu; `tests/ui/taiwan-language.spec.ts` checks persistence, live rendering, keyboard operation and narrow layouts.

The website architecture illustration is localized into all three languages. `ArchitectureImage` chooses a separate vertical SVG composition below 761px. Generate the six editable SVG files with `node scripts/design-architecture.mjs`; the supplied original remains unchanged. The overview download also has a Traditional Chinese version; machine-readable source records and attribution retain their original language.
