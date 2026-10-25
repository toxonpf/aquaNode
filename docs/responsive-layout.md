# Responsive layout

`src/styles/responsive.css` owns the shared viewport rules. It loads after the
component styles. `src/pages/technology/technology-hero.css` owns the technology
introduction, model frame, and reference specifications. `src/styles/desktop-scale.css`
loads last and owns desktop typography, the shared header geometry and the 4.5vw
outer gutter on every route. CSS font sizes and tracking use rem, preserving their
original sizes with a 16px root; mouse/trackpad layouts use a root of `100vw / 120`
(16px at 1920px). Browser zoom therefore scales the CSS viewport and the type in
opposite directions, keeping the desktop composition proportional. Touch layouts
retain the browser's normal root size and readable mobile text.

The five ocean scenes have a desktop-only exception in
`src/features/ocean/styles/desktop-composition.css`, loaded last. Mouse/trackpad
viewports use one 1920×1080 reference composition, including when browser zoom
reduces the CSS viewport below the mobile breakpoint. Its shared
unit is `min(100vw / 1920, 100svh / 1080)`. Text, spacing, panels, SVG controls,
and the 3D projection all follow that unit, preserving proportions and line breaks
on different desktop resolutions. This intentional proportional typography can
be smaller than the reference reading sizes. Its UI uses the site's outer gutter,
without adding the camera frame's letterbox space on wide windows. The header
uses the same shared dimensions inside and outside the ocean. Phones and touch
tablets retain the independent responsive rules below.

## Shared dimensions

- Reading layouts share `--site-gutter`, including the header and footer.
- Desktop reading layouts occupy 91vw; backgrounds and ocean scenes remain full width.
- Prose uses 16–18 reference pixels and supporting labels use at least 14, scaled
  through rem on desktop. Touch layouts retain these as normal reading sizes.
- Section spacing and model heights use bounded fluid values instead of fixed
  desktop dimensions.
- Headings retain the existing two-line fitting and word reveal.

## Breakpoints

| Available width | Layout |
| --- | --- |
| Above 960 px | Full navigation and desktop columns |
| 761–960 px | Menu navigation; reading and model layouts can stack |
| Up to 760 px | Mobile flow, touch targets, stacked sections, scrollable profile text |

The header is 4rem tall on desktop everywhere (64px at 1920px), and 56px on phones.
Mouse/trackpad layouts retain the proportional navigation; touch layouts switch
to a menu based on the available viewport. Colour changes with the background;
logo size, navigation, controls and outer alignment remain consistent.

No inverse CSS `zoom`, transformed page root, forced viewport width or device-pixel
ratio detection is used. Only typography and the explicitly authored dimensions
follow the viewport. Layouts can still reflow and scrolling uses measured geometry.

## Interaction details

- Ocean readers reserve space for the fixed header and lower controls, including
  in low-height desktop windows. Progress and navigation share the same 2 CSS px
  end tolerance for fractional scroll limits; a swipe used to read text cannot
  also leave that chapter.
- Mobile audio uses a labelled icon button so it cannot overlap the scroll hint.
- Assembly navigation wraps into two columns instead of hiding steps offscreen.
- Member profile text scrolls within its own viewport when the complete content
  cannot fit; the close control remains outside it.
- The technology model precedes the longer introduction on phones. Rotation,
  expansion, reset, and part selectors remain available when WebGL is enabled.
- Static fallback views omit disabled 3D controls and retain the part descriptions.

## Verification

`tests/ui/responsive-layout.spec.ts` covers all six pages in Russian and English
at 2560×1440, 1920×1080, 1440×900, 1366×768, 1280×800, 1093×614,
1024×640, 911×512, 768×1024, 683×384, 430×932, 390×844, 360×740, and 320×568.

The 1093×614 and 911×512 cases approximate the available layout area of a
1366×768 display at 125% and 150% scaling; 683×384 covers 200% scaling.
These checks cover CSS layout;
device pixel ratio affects rendering density rather than the layout width.

Additional checks exercise live 3D controls on a phone, complete member profiles
on short screens, and all four ocean readers at laptop and mobile sizes.
`tests/ui/desktop-site-scale.spec.ts` compares physical font and header sizes on all
six routes at 100%, 130%, and 150%, and verifies the common grid in all ocean scenes.
