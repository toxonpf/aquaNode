# Verification — 2026-10-21

- `npm run build`: passed, TypeScript and Vite production output generated in dist/.
- `npx playwright test`: 5/5 passed in installed Google Chrome.
- All six application routes return rendered headings and page titles.
- Existing resource downloads return nonempty files; a real Assembly.svg browser download completes.
- Audio starts only after clicking and stops from its persistent toggle.
- At 390 × 844 all six routes fit the viewport; mobile menu navigates and closes.
- Reduced-motion mode omits canvas and retains selectable part descriptions.
- WebGL-unavailable mode renders the SVG fallback; normal WebGL mode renders and responds to rotate / separate / reset controls.
- Desktop 1440 × 1000 and mobile full-page screenshots generated in ignored test-results/. Supplied drawing loaded after scroll and has nonzero intrinsic width.
- Initial and revised desktop/mobile screenshots inspected for composition. Automated checks are not a substitute for real iOS/Safari device testing or a full accessibility audit.

Known limits: there are no prototype photos or physical measurement logs in the supplied workspace. No contact delivery or hosting is configured, per the user's follow-up. The dynamic 3D bundle is about 243 kB gzip; Vite reports its uncompressed chunk exceeds 500 kB. Core JavaScript is about 137 kB gzip. No live data, map or unsupported technical protocol details are published.
