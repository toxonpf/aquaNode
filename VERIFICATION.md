# Verification — 2026-10-21

## Selectable ocean history — 2026-10-22

- Collected nine numbered presets: original, smooth, depth, fine ripples, long swell, broad foam, crest ribbons, textured four-wave crests and the current six-wave ocean. The default remains 9.
- `oceanStyle(number)` switches the surface material and shared buoy/link wave profile in place. `oceanStyle()` returns the numbered catalogue. The command is registered before the lazy 3D module loads and the choice is saved in localStorage.
- Three new browser scenarios pass: all nine shaders render without WebGL errors while keeping the same canvas and chapter; surface, underwater, network and mobile switching work; reloads retain the choice; invalid arguments and unavailable or invalid storage are handled.
- Two existing audio scenarios and the desktop/mobile network scenario pass after the refactor. The production build and whitespace checks pass, with the existing large 3D bundle warning.
- Across 4,032 numerical samples of all nine profiles, selected and explicit buoy samples match and analytic slopes agree with numerical derivatives to within 8e-11. Original, fine-ripple and current-ocean captures were visually reviewed.

## Ocean swell scale — 2026-10-22

- Replaced the dominant fine capillary glitter with long rolling swells and a smaller layer of medium wind waves. The main wavelength is about 12.6 scene units, with slower travel, curved fronts, fuller crests and broad troughs.
- Added broken, textured crest foam, restrained reflections and a deeper blue-green palette. The surface and all buoys share the same six-wave height and analytic slope functions, including the crest profile and front curvature.
- Numerical differentiation checks the shared slope calculation; desktop opening, later wave phase, mobile, network and underwater views were inspected without shader errors.

## Ocean sound and overhead water — 2026-10-22

- Ocean playback remains opt-in. A shared audio engine fades and pauses outside the overview's five pinned ocean chapters, during page transitions and when the tab is hidden. Returning to the scene retains the visitor's on/off choice.
- The actual camera height drives a smooth low-pass filter and a small bass lift when crossing the water surface. Static/reduced-motion chapters select the same surface and underwater mixes.
- Two browser audio scenarios verify real media playback, filter frequencies, above/below-water transitions, leaving and returning to the ocean, route changes, explicit stop and the static fallback.
- All 18 targeted audio, site, loading and transition scenarios pass across the verification runs. The adaptive overview test now waits for the loading curtain to finish before interacting with the scroll cue.
- The procedural ocean now includes broad organic colour variation, stronger shared swells, aligned fine wind ripples with a pixel-footprint fade, smaller highlights and less overhead haze. No texture downloads or extra rendering passes were added.
- Desktop opening, high network view, mobile opening and underwater captures were reviewed. No shader or runtime errors occurred in those checks. The production build and whitespace checks pass; the existing large 3D chunk warning remains.

## Attached elastic annotation — 2026-10-21

- The arrow tip follows a projected point on the right edge of the float lid. Text stays fixed while a damped bend tightens and relaxes with the changing distance. The arrowhead follows the terminal tangent.
- Browser samples confirm a moving tip and changing bend with fixed label bounds, and matching curve/head endpoints. Desktop, mobile, return-to-surface and static-fallback captures were reviewed; no runtime errors occurred.
- The existing delayed-label/animated-scene, loading-screen and failed-download scenarios pass. The normalized SVG path preserves the initial drawing animation as the curve changes length.

## Chapter navigation refinement — 2026-10-21

- Short chapter anchors replace the viewport-length gaps. Each fresh wheel gesture, swipe or navigation key advances one adjacent chapter; camera movement, text appearance and the gesture's momentum block further advances.
- Five navigation scenarios cover large wheel deltas, repeated input during the camera transition, a momentum burst lasting more than a second, exit and re-entry, keyboard input, touch swipes and viewport resizing. Sensor buttons retain normal Space activation.
- Existing story interactions, reduced-motion controls and content bounds pass. Opening-screen loading, the delayed annotation, failed-download fallback and phone/tablet navigation also pass.

## Three-chapter buoy story — 2026-10-21

- Production build and `git diff --check` pass.
- All nine existing site scenarios and three new story scenarios pass in installed Chrome, across targeted runs.
- The new chapter reuses the opening canvas. Adjacent chapters use short scroll anchors; one gesture selects the next shot, while reverse gestures and chapter links return to preceding views. A transition guard consumes wheel momentum and repeated input until the camera and copy have settled.
- The sensor copy and its gradient fade in together after the camera settles. Probe controls update the description, selected marker, material highlight and pulse colour.
- The moving 3D markers offer pointer controls; stationary controls remain keyboard and screen-reader accessible. The sticky stage uses `overflow: clip` so focus cannot scroll the scene internally.
- The new tests check sensor selection, projected marker selection, return navigation, reduced motion, rapid scroll reversals and content bounds at 320 × 740, 390 × 844, 768 × 1024, 844 × 390 and 1440 × 900.
- Desktop, small-phone, landscape and static screenshots were reviewed. Generated captures remain in ignored `test-results/`. No measurement values are simulated.

## Original site checks

- `npm run build`: passed, TypeScript and Vite production output generated in dist/.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npx playwright test`: 9/9 passed using installed Chromium.
- All six application routes render headings and page titles.
- Resource downloads return nonempty files; the Assembly.svg browser download completes.
- Audio starts only after clicking and stops from its persistent toggle.
- At 390 × 844 all six routes fit the viewport; the mobile menu navigates and closes.
- The ocean opening also fits 320, 768, 1024 and 1440 px widths. The scroll cue reaches the actual prototype status section. The opening scene also fits a short 844 × 390 landscape viewport.
- Reduced motion omits canvas on both the overview and technology pages and retains the static hero, working navigation and selectable part descriptions.
- WebGL-unavailable mode renders the SVG fallback; normal WebGL mode renders and responds to rotate / separate / reset controls. No Three.js, shader or WebGL errors were logged during the overview checks.
- Desktop and mobile full-page screenshots and overview viewport captures are generated in ignored test-results/. The engineering image is checked after its lazy load completes, using a nonzero intrinsic width.
- Final desktop, small-phone and tablet screenshots were inspected for composition. The ocean fills the first viewport with a centred buoy and a delayed annotation; the status, device and engineering sections keep readable spacing. Automated checks are not a substitute for real iOS/Safari device testing or a full accessibility audit.
- Once the scene is presented, the label stays hidden for 999 ms, then appears at 1000 ms (tested with the browser clock and reduced motion). The curved arrow and scroll cue are visible, and the cue stays inside the first viewport.
- Two canvas captures taken 600 ms apart differ, confirming that the ocean/buoy scene actually animates.
- With the scene module held by a browser route, the dark loading screen remains visible and no SVG buoy, annotation or scroll cue appears. Releasing the module reveals the real 3D scene and starts the annotation sequence. Loading and revealed screenshots are saved in test-results/.
- A failed scene-module download switches to the static view and releases the loading screen instead of hanging.
- `git diff --check`: passed.

The hero uses a displaced, texture-free procedural ocean surface, analytic normals, sun reflections and fine ripples. The buoy samples the same swells for its height and tilt. It animates while its scene is visible in an active tab. The secondary model renders on demand. Both use a DPR cap of 1.5. Pending 3D shows an accessible loading indicator. The dark opening screen fades out over 900 ms only after the first rendered WebGL frame. A static SVG is used only for reduced motion, data saver, limited devices or failed/unavailable WebGL.

Known limits: no physical prototype photographs or measurement logs have been supplied. Contact delivery and hosting remain unconfigured. The illustrative model is not a confirmed CAD reconstruction. The lazy 3D bundle is about 247 kB gzip; Vite reports its uncompressed chunk exceeds 500 kB. Core JavaScript is about 140 kB gzip. No live readings, deployed map or protocol implementation details are published.
