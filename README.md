# AquaNode website

React + TypeScript + Vite, React Router, React Three Fiber / Three.js and GSAP ScrollTrigger. Russian, English and Traditional Chinese (Taiwan) public interfaces; seven routes. Russian is the default. An icon-triggered language menu in the header and footer saves the selection and updates the interface without a reload. No contact form is configured.

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

Tests use Playwright Chromium (`npx playwright install chromium` if needed). An installed browser can be selected without editing the config:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test
```

## Ocean styles

Open the browser developer console on the running site:

```js
oceanStyle(4)  // Select a style immediately, without reloading the scene.
oceanStyle(9)  // Return to the current ocean (default).
oceanStyle()   // List all styles with numbers, names and descriptions.
```

The choice is saved in this browser and survives reloads and navigation. The command is available on every page; the selected surface appears in the overview's 3D ocean. Static/reduced-motion illustrations remain static. Water, buoy motion and network links use the same selected wave profile. Invalid values throw a `RangeError` and leave the current choice unchanged.

| Number | Style | Version |
| --- | --- | --- |
| 1 | Original | Original fine sparkling ripples |
| 2 | Smooth | Softer surface before the depth refinements |
| 3 | Soft depth | Organic colour variation and soft highlights |
| 4 | Fine ripples | Previous lake-like directional ripples |
| 5 | Long swell | First long ocean swells |
| 6 | Broad foam | Long waves with wide foam patches |
| 7 | Crest ribbons | Narrow foam ribbons along crests |
| 8 | Textured crests | Four waves, deeper colour and broken foam |
| 9 | Ocean | Current six-wave ocean with large swells and sparse foam |

Preset definitions are in `src/features/ocean/scene/oceanStyles.ts`, the console command and saved choice in `src/features/ocean/scene/oceanStyle.ts`, shared CPU/GPU wave functions in `src/features/ocean/scene/ocean.ts`, and appearance variants in `src/features/ocean/scene/OceanSurface.tsx`. Historical variants reuse the current buoy model, rectangular float and underwater scene; the original style retains its historical circular waterline. Only the selected surface shader is compiled.

## Cursor styles

Switch immediately in the browser console; the selection is saved across pages and reloads:

```js
cursorStyle(0) // Native system cursor.
cursorStyle(1) // Water trail with animated arrows (default).
cursorStyle()  // Read the selected number.
```

The command is available on every page. Touch, reduced motion and forced colors retain native controls. The console store is in `src/features/cursor/cursorStyle.ts`; the pointer rendering is in `src/features/cursor/SiteCursor.tsx`.

## Future publication

Publish `dist/` as a static site after `npm run build`. Configure the host to serve `index.html` for application paths (`/about`, `/technology`, `/build`, `/journal`, `/team`); asset paths must serve the actual files. A Netlify-style `_redirects` file is included. No backend or secrets are required. Hosting and domain remain undecided; nothing has been published. Add the final absolute site URL and social preview image to the metadata when the domain is chosen.

## Editing

See the [project structure and editing map](docs/project-structure.md) for source folders, CSS order and test groups.

- `src/data/catalog.ts`: navigation, people and optional social links, resources, assembly steps, project updates, conceptual part descriptions.
- `src/main.tsx`: React startup; `src/app/App.tsx`: routes and page shell; `src/pages/`: page composition and English source phrases passed to `t()`.
- `src/data/content.ts`: localizes shared editorial records for the selected language.
- `src/features/i18n/i18n.ts` and `src/features/i18n/locales/ru*.ts` / `zh-TW.ts`: language selection, Russian copy and named placeholders. See [localization notes](docs/localization.md).
- `src/features/ocean/scene/Scene.tsx`: ocean rendering, lighting and camera transitions.
- `src/features/buoy/BuoyModel.tsx` and `src/features/buoy/BuoyDrawing.tsx`: lightweight 3D and static buoy illustrations, based on the supplied open-pisciculture reference.
- `src/features/ocean/story/BuoyAnnotation.tsx` and `src/features/buoy/buoyAnchors.ts`: the annotation's fixed attachment point, SVG arrow and damped bend. The 3D scene projects the lid point after applying the buoy's current wave transforms; only the bend has inertia, while the tip tracks exactly. The static illustration uses its corresponding SVG point.
- `src/features/ocean/story/SensorPanel.tsx`, `src/features/ocean/scene/Underwater.tsx` and `src/features/ocean/styles/sensors.css`: the underwater chapter, sensor explanations, projected probe controls, light and particles.
- `src/styles/base.css`: desktop and separately composed mobile layouts, reduced-motion rules.
- `public/resources/`: genuine supplied downloadable materials. Do not copy the entire engineering package into this public directory: it contains unapproved protocol details.
- `public/assets/`: supplied engineering images and licensed ocean recording.

New journal entries are objects in `updates`; leave dates undated when unknown. Team social links render only when a real `{ label, url }` item exists. Contacts and form work were explicitly deferred by the user; no email address or successful submission is fabricated.

## Design

The opening section is one full viewport of ocean viewed from above, with a cream and marine-blue buoy at its centre. A dark loading screen with a small spinner covers the scene until its first WebGL frame is rendered, then fades out over 900 ms to reveal the brighter ocean. The navigation sits over the water. One second after that reveal, “what is this?” fades in and a curved arrow draws toward the buoy. A moving line and downward arrow invite scrolling; both the annotation and cue link to the current project section. The rest of the overview remains available below while sections are refined individually.

The Three.js ocean uses an actual displaced mesh, analytic wave normals, reflected sky, sun glints and fine wind ripples. The buoy samples the same four directional swells as the water, so its height and tilt follow the surface. Wave parameters and the shared CPU/GPU equations are in `src/features/ocean/scene/ocean.ts`. Opening-section styles are in `src/features/ocean/styles/ocean.css`.

The opening has three chapters in one persistent canvas: the overhead surface, a close look at the buoy, and the probes below the water. Each distinct vertical wheel gesture, swipe or navigation key advances one adjacent chapter. Short anchors, 56–96 px apart, replace the empty viewport-length gaps. Further input is consumed until the camera and copy have settled and the current gesture has paused for 280 ms, preventing momentum from skipping a chapter. Leaving the last chapter returns to ordinary page scrolling; its remaining momentum is consumed until that gesture ends. Chapter links and the dive cue provide direct navigation. Pinch zoom, horizontal gestures and text/button input retain their normal controls. The underwater camera travels around and beneath the float; the background, underside of the water and light change with it. Text and its gradient appear together once the camera settles. The pH and temperature controls select a matching explanation, probe highlight and pulse colour. Moving labels attached to the probe array offer duplicate pointer controls; the stationary selector provides keyboard and screen-reader access. No live measurements are simulated. Reduced motion and unavailable WebGL retain all chapter navigation and sensor explanations with the static illustration.

No texture downloads or post-processing passes are used. The enclosure label is drawn locally on a small canvas. Animation runs only while the scene is visible and the browser tab is active. The secondary model renders on demand. Pending 3D uses a loading indicator rather than an SVG illustration. A static SVG is reserved for reduced motion, limited hardware, unavailable WebGL or a failed 3D download; those states leave loading immediately instead of waiting for a frame that cannot render. The buoy follows the open-pisciculture reference's rectangular float, central mast, upright enclosure and lower probe tube, with softened edges and an AquaNode finish. Its dimensions and details remain illustrative. Scrolling stays native.

## Evidence and unfinished content

Current engineering source: `AquaNode_R0.3_EC_revB/web_handoff/`, dated 29 October 2026. It supersedes the earlier current-status copy. This is a freshwater design investigating an experimental EC estimate with SEN0244 and temperature with DS18B20. Hardware validation, ESP32 compilation, native ERC/DRC and fabrication release remain pending. The 15 synthetic model tests and 155-contact structural comparison do not establish hardware operation or measured accuracy.

`src/data/revisions/ec-revb.json` preserves the supplied status, including unknown outcomes as null. `src/data/project.ts` exposes revision metadata. `RevisionNotice` identifies the current stage; `ru-revb.ts` contains its Russian editorial copy. Public downloads under `public/resources/ec-revb/` are limited to permitted web materials; the architecture illustration is CC BY 4.0 and is not a prototype photo or an electrical schematic. Engineering/firmware sources and protocol-bearing material are not published through these downloads.

The journal retains the 20 October R0.3 checks as historical baseline results, separately from revB. Original engineering directories remain unchanged. The map retains approximate geographic markers and the independent Taiwan station archive, with no simulated buoy readings presented as current measurements. The earlier presentation's school-participation figures remain future goals. The previously supplied GEEP certificate is separate recognition, not hardware validation. See `docs/audits/content-audit.md` for the source hierarchy and remaining limits.

## Accessibility and loading

Model code is lazy-loaded, the secondary model waits for proximity to the viewport, and DPR is capped at 1.5. The hero animates only while visible in an active tab; secondary rendering uses demand mode. Reduced motion, data saver, limited reported memory, missing WebGL2 and lost contexts use a lightweight SVG view. Descriptions remain accessible without 3D. No automatic audio playback or audio download; one persistent toggle starts/stops the recording. Large imagery uses lazy loading. Native navigation, focus outlines, skip link, descriptive image alternatives and keyboard controls are present.

The 3D chunk still contains the Three.js renderer and is significantly larger than the core page. Users who request reduced motion or cannot use WebGL do not load it. Google Fonts uses display=swap with system fallbacks; the site is usable if fonts cannot load.

## Sources and licences

- Supplied `AquaNode_R0.3/`: README, Engineering, Purchase_and_test, Verification, BOM, Assembly and PCB drawings. Original directory is preserved. Public attribution: `public/resources/ATTRIBUTION.md`. New package documentation is CC BY 4.0; hardware CERN-OHL-P-2.0, with upstream notices in the original package.
- Award and historical context: https://thegeep.org/programs/youth-innovation-challenge/aquanode-team (checked 2026-10-21). Current user facts take precedence over its earlier capability description.
- Ocean audio: **Oceanwavescrushing.ogg**, Luftrum, 2008. https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg . Download: https://upload.wikimedia.org/wikipedia/commons/f/f1/Oceanwavescrushing.ogg . **CC BY 3.0**: https://creativecommons.org/licenses/by/3.0/ . Attribution and licence link appear in every page footer. The original file is unchanged; AquaNode applies a quieter mix and real-time underwater filtering. Playback is opt-in and limited to the five ocean chapters on the overview. Leaving the scene, changing page or hiding the tab fades and pauses it; returning resumes only if sound was enabled.
- Type: DM Sans and Manrope from Google Fonts, SIL Open Font License; https://fonts.google.com/specimen/DM+Sans and https://fonts.google.com/specimen/Manrope . Loaded from Google Fonts, not bundled.
- Design references reviewed: https://www.hut8.com (clear hierarchy and scale); https://15th.plus-ex.com (object-led reference, text access limited). https://encoder.digital/en was unavailable to the research tool; no claim of a completed visual review. No reference site's code or imagery was copied.
- Model and SVG fallback: authored for this website using the [open-pisciculture mechanical assembly and photographs](https://github.com/open-pisciculture/open-source-fish-farming-prototypes/tree/1ff67e96c81d22075cd6b9517ece5539700fd0e9/data-buoy-node) as visual references. The STEP assembly was reviewed; upstream meshes and photographs are not bundled. Source credits and adaptation details are in `public/resources/ATTRIBUTION.md`.

## Remaining user inputs

1. Real photographs of the working prototype and any existing full buoy assembly instructions (absent from the workspace).
2. Clarification of which board is used by the working buoy versus R0.3, and evidence the team wants to publish.
3. Real team portraits and contact addresses. Portrait slots and multiple contacts per person are ready; see [docs/team-contacts.md](docs/team-contacts.md). Unfilled contacts remain disabled.
4. Hosting and domain only when publication is requested.
