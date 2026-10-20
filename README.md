# AquaNode website

React + TypeScript + Vite, React Router, React Three Fiber / Three.js and GSAP ScrollTrigger. English public interface; six routes. No deployment or contact form configured, as requested.

## Run

Node 22.12+ (verified with Node 26) and npm:

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
npx playwright test
```

Tests use installed Google Chrome. On a machine without Chrome, install Playwright Chromium and remove `channel: 'chrome'` from playwright.config.ts.

## Future publication

Publish `dist/` as a static site after `npm run build`. Configure the host to serve `index.html` for application paths (`/about`, `/technology`, `/build`, `/journal`, `/team`); asset paths must serve the actual files. A Netlify-style `_redirects` file is included. No backend or secrets are required. Hosting and domain remain undecided; nothing has been published. Add the final absolute site URL and social preview image to the metadata when the domain is chosen.

## Editing

- `src/locales/en.ts`: navigation, people and optional social links, resources, assembly steps, project updates, conceptual part descriptions.
- `src/main.tsx`: page composition and English editorial paragraphs.
- `src/content.ts`: active English catalog entrypoint. `ru` and `zh-TW` are registered as incomplete; no language selector is shown. Complete the editorial and UI translations before activating another locale.
- `src/Scene.tsx`: deliberately conceptual model, not a verified CAD reconstruction.
- `src/styles.css`: desktop and separately composed mobile layouts, reduced-motion rules.
- `public/resources/`: genuine supplied downloadable materials. Do not copy the entire engineering package into this public directory: it contains unapproved protocol details.
- `public/assets/`: supplied engineering images and licensed ocean recording.

New journal entries are objects in `updates`; leave dates undated when unknown. Team social links render only when a real `{ label, url }` item exists. Contacts and form work were explicitly deferred by the user; no email address or successful submission is fabricated.

## Design

Deep marine blue anchors the object-focused narrative; off-white sections make evidence and instructions readable. A restrained pale lime accent identifies status, selected parts and key actions. The story moves from one conceptual buoy to why observation matters, the device, the measurement cycle, a clearly labelled future network, and evidence. Scrolling is native: no pinned empty sections or scroll hijacking.

## Evidence and unfinished content

See CONTENT_AUDIT.md. Prototype photos were not supplied: the PNGs in the workspace are CAD drawings, not photos. Do not replace missing photos with synthetic documentary images. The original supplied notes are a board assembly/testing plan, not a complete, tested buoy build manual. Public English assembly text is a labelled summary of those notes. A download of the actual assembly drawing and BOM is provided; the private protocol-bearing notes remain private.

The current statement that a prototype works comes from the user's brief. The supplied R0.3 documents explicitly say that revision has not been physically built or validated. No equivalence between them is claimed.

## Accessibility and loading

Model code is lazy-loaded, the secondary model waits for proximity to the viewport, and rendering uses demand mode with DPR capped at 1.5. Reduced motion, data saver, limited reported memory, missing WebGL2 and lost contexts use a lightweight SVG view. Descriptions remain accessible without 3D. No automatic audio playback or audio download; one persistent toggle starts/stops the recording. Large imagery uses lazy loading. Native navigation, focus outlines, skip link, descriptive image alternatives and keyboard controls are present.

The 3D chunk still contains the Three.js renderer and is significantly larger than the core page. Users who request reduced motion or cannot use WebGL do not load it. Google Fonts uses display=swap with system fallbacks; the site is usable if fonts cannot load.

## Sources and licences

- Supplied `AquaNode_R0.3/`: README, Engineering, Purchase_and_test, Verification, BOM, Assembly and PCB drawings. Original directory is preserved. Public attribution: `public/resources/ATTRIBUTION.md`. New package documentation is CC BY 4.0; hardware CERN-OHL-P-2.0, with upstream notices in the original package.
- Award and historical context: https://thegeep.org/programs/youth-innovation-challenge/aquanode-team (checked 2026-10-21). Current user facts take precedence over its earlier capability description.
- Ocean audio: **Oceanwavescrushing.ogg**, Luftrum, 2008, unmodified. https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg . Download: https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg . **CC BY 3.0**: https://creativecommons.org/licenses/by/3.0/ . Attribution and licence link appear in every page footer. Playback volume is reduced, original file unchanged.
- Type: DM Sans and Manrope from Google Fonts, SIL Open Font License; https://fonts.google.com/specimen/DM+Sans and https://fonts.google.com/specimen/Manrope . Loaded from Google Fonts, not bundled.
- Design references reviewed: https://www.hut8.com (clear hierarchy and scale); https://15th.plus-ex.com (object-led reference, text access limited). https://encoder.digital/en was unavailable to the research tool; no claim of a completed visual review. No reference site's code or imagery was copied.
- Model and SVG fallback: authored for this website, purely illustrative. No third-party 3D assets.

## Remaining user inputs

1. Real photographs of the working prototype and any existing full buoy assembly instructions (absent from the workspace).
2. Clarification of which board is used by the working buoy versus R0.3, and evidence the team wants to publish.
3. Contact email / social links only when the team is ready; contacts and forms are currently deferred.
4. Hosting and domain only when publication is requested.
