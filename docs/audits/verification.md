# Verification — 2026-10-21

## Body text motion — 2026-10-22

- Body copy, captions, labels, facts and text controls rise 13px with a brief three-pixel blur as they enter the viewport. Their 0.62-second motion is quieter than the word-by-word heading reveal, and follows after the page curtain has cleared. Hidden/inert chapter content is excluded until it becomes active. Reduced motion makes every text element available immediately. Browser coverage confirms the layered heading/body reveal, page text, chapter rail and 320px layout; the production build passes.
- Position-sensitive controls are excluded from the body-copy transform. In particular, the buoy annotation retains its 106px horizontal and −154px vertical anchor transform after loading. Resting flexible arrows now retain 42% of their wave height instead of 32%; active and hovered arrows remain full height.
- The opening project and Why Water sections use the shared five-percent desktop content rails. The project status grid fills its section's content box and the Why Water visual starts on the same left rail.
- Observation Cycle and Open Engineering now use the same rails as Project Today and Why Water; the regression checks all four sections at desktop width.

## Word reveals, loading crest and chapter rail — 2026-10-22

- H1–H3 headings reveal upward one word at a time through small masks. Original heading elements, explicit line breaks, emphasis and accessible text remain intact. Regular headings wait until visible; chapter headings wait for their camera and replay on returning to the chapter. Dynamic titles use the same React component, and reduced motion shows the words immediately. Removed the former whole-heading section animation.
- The loading crest now blends to the periodic contour at phase zero before travelling. This avoids crossfading two displaced crests during startup. The existing travelling-shape and lettering regression passes.
- SKIP and scene links share a 64px desktop column and 38px mobile targets. The curved arrow stays within its target. Width equality and page overflow were checked at 1440, 390 and 320px.
- Raised the detail camera from Y=2.2 to 3.15 on desktop and from 1.85 to 2.65 on mobile. Desktop and settled 320px mobile views were visually inspected. Heading/rail browser checks and the production build pass.

## Navigation, reading boundaries and loading logo — 2026-10-22

- Clicking a header link for the currently displayed/requested route returns to the top and closes the mobile menu without a route transition. The home logo and Overview link reset the ocean story directly to the surface; intermediate chapter anchors are ignored during that scroll.
- SKIP ends the chapter rail with its label beside the start of a short, gently curved arrow, whose smaller tip aligns below the chapter marks. The curve moves subtly without stretching or shifting on hover. Hover/focus brightens the drawing and sends a light pulse with a softer trailing stroke along synchronized paths; leaving fades and pauses both. Their moving offsets were checked across three frames, retaining the 13-unit separation between trail and core. Reduced motion keeps the drawing static. It exits to the award/project content below the sticky story, accounting for the compact header. The final story continuation uses the same controlled scroll. Desktop resting/hover states and views at 320, 390 and 760px were inspected. The mobile label and target are larger, with no overflow or runtime errors. Both skip regressions and the production build pass.
- Continued wheel input can advance after the reader actually reaches its end, without requiring a pause. Diminishing momentum is ignored, unfinished scroll tweens cannot advance, and reading progress stays below 100% until the boundary is reached. Continued touch movement uses the same boundary guard.
- Wheel input during a scene transition is discarded, never replayed into the incoming reader. Forward entry stays at 0%; reverse entry retains its end position. Once the camera and copy are ready, new ongoing input is accepted without requiring a pause. Input that takes the reader to its boundary cannot also change chapters, including input during its final tween. A fresh gesture at the visible boundary advances immediately; ongoing scrolling requires at least two additional non-diminishing pulses totalling 80px there. Regression coverage checks both boundaries with normal and reduced motion, fading momentum, and deliberate continuous input. The reader becomes available after 180ms rather than the former 700ms copy-only delay.
- The inside camera frames the buoy to the right of the desktop copy, adjusts distance on narrow tablets and puts the circuit board above mobile copy. Views at 1440, 1024, 768, 390 and 320 pixels were inspected without runtime errors.
- Header and loading logos reuse the SVG artwork inline. Each original asymmetric crest travels from left to right, with all three lines moving together at their original spacing. The endpoints can rise with the passing wave while keeping their horizontal positions; lettering remains unchanged. Loading waves stop outside the curtain and restore the source artwork for reduced motion.
- The logo regression measures more than 35 SVG units of crest movement, compares the moving profile against circular shifts of the source SVG (less than 2 SVG units RMS error and within 5% of its original height), verifies fixed horizontal bounds and lettering, and checks reduced-motion restoration. Seven logo, navigation and page-loading scenarios pass; the production build also passes.
- Logo shape refinement: removed the sinusoidal replacement and amplitude envelope that flattened the original crest. Periodic cubic interpolation retains its shape, with narrow smoothing concentrated at the loop join. The cycle remains 3.8 seconds with soft entry and exit. Three phases were visually reviewed; the profile regression also passes after an additional local seam-smoothing adjustment.
- Twenty distinct navigation, reading, loading and transition browser scenarios pass across targeted runs, including five new regression checks for the requested behaviour.

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

### Action links — downloads, external destinations and navigation

- File downloads use a dedicated card with file format, description and a downward tray icon. Build resource files and the Technology assembly download use the same component.
- Outbound links use a square external icon; prominent links also show the destination domain. Compact attribution links use the inline variant. New-tab behaviour is announced to assistive technology.
- Internal page links retain the flexible angled arrow; section links point downward. Header and footer navigation use the same directional language.
- Download events return the original Assembly.svg and leave the route unchanged. Resource requests return nonempty files. External link semantics, distinct icons and mobile widths down to 320 px were checked. Heading reveal, Technology interactions and minimum font-size checks pass; production build passes.

### Deliberate story return — 23 October 2026

- Upward input from the document stops at the same boundary used when exiting the story. Momentum and held keys cannot immediately cross into the ocean; a subsequent gesture re-enters the fifth scene at the end of its text.
- A contextual return hint appears only after scrolling down into the document and returning to its start. The slim strip is centred in the upper content gutter below the award, acts as a keyboard-accessible return button, and is hidden on the initial story exit and on story re-entry.
- Upward document input is bounded before scrolling. The scroll observer no longer rewinds an already-painted position. Frame sampling during animated upward input verifies that the ocean is not exposed before a deliberate return gesture.
- Wheel, keyboard, touch and animated-return scenarios are covered in `story-return.spec.ts`. Existing sequential-chapter tests pass.
- Outbound icons use a subtle travelling wave in the shaft; hover/focus smoothly strengthen it and send a highlight along the frame. Reduced motion keeps the icon static. Internal navigation keeps its original angled flexible arrow.
- Outbound arrows visibly leave their frame and return on hover or keyboard focus, including at the 12 px attribution size. Download arrows land in a flexible tray with a short ripple on hover or focus. At rest only the shafts gently wave; arrow movement, tray movement and ripples stop immediately on exit. Reduced motion disables all icon animation. Idle, hover, focus and reduced-motion states are checked, and original file downloads still succeed.

### Learning by doing — 23 October 2026

- Replaced the large decorative symbol with an interactive learning workbench: a field question, the original R0.3 assembly drawing and reflection prompts. Each step includes a practical task, an outcome and a relevant internal link.
- Selected steps have a visible number and state; changes are announced politely. The detail panel uses a brief upward fade and respects reduced motion.
- Production build and seven targeted browser checks pass. Step switching, drawing loading, download delivery, icon interactions and widths from 320 to 1920 px are covered. Desktop and phone captures of the workbench were reviewed.

### Technology and mobile readability — 22 October 2026

- Technology now presents the controllable model, carrier specifications, original Assembly / Copper drawing switch and four selectable functional paths. R0.3 source scope remains explicit.
- Replaced 168 authored CSS font sizes below 10 px. Computed-size checks pass on all six routes at 390 px and 1440 px; model/diagram SVG artwork is excluded from the interface text check.
- The ocean retains the original 80-unit near-field density and adds a stretched peripheral grid to 320 units, preventing the mobile aerial shot from exposing its edge. The 406 × 900 screenshot was visually reviewed.
- Technology, font-size and aerial-view tests pass; all nine ocean variants and heading/transition regressions pass. Model rotate / separate / reset and WebGL fallback checks pass. Production build passes.
- Updated Technology fits 320, 390, 768, 1024, 1440 and 1920 px without horizontal overflow. Drawing and path switches were tested.

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
