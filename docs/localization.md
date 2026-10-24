# Languages

The public interface defaults to Russian. The RU / EN controls in the header and footer save the selection under `aquanode.locale` in local storage. Switching languages updates the mounted interface through a shared React external store. The route, scroll position, open controls and 3D scene stay in place. Shared editorial records rebuild from their English source; component-local catalogs are resolved during rendering.

`src/features/i18n/i18n.ts` sets the document language and resolves `t(english, values?)` before React renders. Translate complete phrases, including accessible names; use named placeholders such as `{name}` for variable text. Do not translate rendered DOM nodes: headings and body motion depend on the original React text.

English source phrases stay beside the components. Russian copy lives in `src/features/i18n/locales/ru.ts`, `ru-story.ts`, `ru-learning.ts`, and `ru-build.ts`. The shared records in `src/data/catalog.ts` are localized by `src/data/content.ts`. Preserve URLs, filenames, revision numbers, component identifiers and source attribution. Engineering downloads and text embedded in original drawings/certificates retain their source language.

The existing Playwright suite explicitly selects English. `tests/ui/localization-footer.spec.ts` checks the default Russian version, saved language selection, document metadata, navigation and narrow layouts.

Russian reading copy and headings use the locally hosted variable Golos Text font. The official font file is from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/golostext); the authors' [repository](https://github.com/googlefonts/golos-text) documents its design. The SIL Open Font License is included at `public/fonts/golos-text/OFL.txt`. Latin interface typography and the SVG wordmark retain their existing designs.
