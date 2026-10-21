# Verification — 2026-10-21

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
