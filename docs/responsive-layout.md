# Responsive layout

`src/styles/responsive.css` owns the shared viewport rules. It loads after the
component styles. `src/pages/technology/technology-hero.css` owns the technology
introduction, model frame, and reference specifications. `src/styles/desktop-scale.css`
owns the shared header geometry and the 4.5vw outer gutter. `adaptive-layout.css`
loads after all component styles and owns the final viewport composition rules.
The root is 16px through 1180px, then `clamp(14px, 100vw / 120, 18px)` on wider
windows. Prose has a 16px minimum and 20px maximum; introductory leads can use
their separately authored larger sizes. Width reductions never shrink the whole
site without a limit. Pointer type does not determine the responsive layout.

The five ocean scenes use a side-by-side composition when width is at least
600px and aspect ratio is at least 6:5. Decorative geometry follows the shared
reference unit `min(100vw / 1920, 100svh / 1080)`, while prose stays at least 16px,
labels at least 14px and primary controls at least 44px high. On narrower or
portrait viewports the buoy occupies the upper area and the reader sits below.
This includes narrow mouse-controlled windows and portrait tablets. The camera
and UI use the same width/aspect criteria. Surface framing uses its natural FOV;
wide detail shots retain the reference projection. Content reserves a separate
header/chapter band and a lower band for progress, audio and continuation cues.
The right-hand reader leaves at least 88px for the vertical chapter rail.

## Shared dimensions

- Reading layouts share `--site-gutter`, including the header and footer.
- Desktop reading layouts occupy 91vw; backgrounds and ocean scenes remain full width.
- Prose uses bounded 16–20px reading sizes, independently of the reference geometry.
- Metadata on the map has explicit minimum sizes; download cards reuse DownloadLink.
- Section spacing and model heights use bounded fluid values instead of fixed
  desktop dimensions.
- Headings retain the existing two-line fitting and word reveal.

## Breakpoints

| Available width | Layout |
| --- | --- |
| Above 1180 px | Full navigation and desktop columns |
| 761–1180 px | Menu navigation; reading and model layouts can stack |
| Up to 760 px | Mobile flow, touch targets, stacked sections, scrollable profile text |

The header is 64px tall above 760px and 56px in narrower windows, on every route.
Full navigation switches to a menu at 1180px. Colour changes with the background;
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

Additional cases include the 1430×983 DevTools window shape, 1024×1366 portrait
tablet and 844×390 landscape window. All seven routes, including `/map`, are checked
in both languages with a mouse. Actual touch contexts also cover phones.
Additional checks exercise live 3D controls, complete member profiles, all four
ocean readers, bounded text sizes and shared header geometry. Zoom navigation is
exercised from 100% through 250%, including the 98–99% scroll boundary regression.

The next mobile pass lives in `mobile-polish.css`: 48px menu/footer/pagination
targets, safe-area offsets, clearer ocean continuation labels and consistent
portrait cropping across gallery/profile/return-flight. Portrait shading is
limited to the bottom edge and upper-left corner; shade opacity still follows
the established open/close animation. The menu closes on Escape/outside press,
traps header focus while open and restores page scroll/inert state when closed.
`tests/ui/map-embeds-mobile.spec.ts` covers the inserted maps, deep links, touch
interaction modes, Ctrl-wheel, expansion/return and menu navigation.

The section redesign is in `mobile-sections.css` and `reading-flow.css`, after
the shared responsive rules. Learning is a continuous three-step exercise, with
all material available in reading order. Phones see both engineering drawings
and all four board explanations in sequence; no return to a distant selector is
needed. Assembly uses the accordion directly. After its height transition, an
opened step is scrolled up only if its beginning is above the header clearance;
steps below that line leave the reader's position alone.

Technology's third section is now `CircuitExplorer.tsx` / `circuit-explorer.css`.
It is an explicitly labelled functional diagram, not a component placement or
pin-level schematic. Four keyboard-accessible module buttons highlight their
connections and update the inspector; previous/next controls offer an alternative
to tapping the diagram. Positioning uses CSS `translate` independently of the
shared entrance animation's transform. Desktop retains the interactive diagram
and inspector; phones use a connected, linear list with the same engineering text.

The embedded atlas is a preview, with regional selection and a fullscreen control.
Dragging, zoom, reset and interaction hints are available in expanded view. The
home section contains one map, one link and one approximation/demo note. Learning
links to the atlas rather than embedding another interactive map.

The mobile menu uses an opening mask and staggered link entrance, with an animated
manual dismissal. Route navigation keeps it on the source page until the existing
page curtain has covered that page. Its inert/scroll lock is released before the
destination text reveal is prepared. Member profiles fit within the viewport
without internal scrolling. On phones, concise shared introductory copy leaves
the remaining height to the photo; short landscape screens use two columns.
The crop keeps faces and Timur's raised hand visible. Both portrait currents are
anchored to photo coordinates, including animated flight copies. Footer links
retain their underline and flexible arrows; credits remain expandable.

`tests/ui/mobile-sections.spec.ts` checks actual mobile viewport expansion and
horizontal overflow in both languages, module and download text bounds, learning
the continuous reading order, conditional step scrolling, menu retention under
the transition curtain, and uniform portrait geometry during opening and return.
`tests/ui/profile-fit.spec.ts` checks every member in both languages, viewport
containment, face/hand crop landmarks, restored footer arrows and the circuit's
connection endpoints during resize and selection. Interactive circuit buttons
are excluded from the global text translation so their centres stay fixed.

Editorial section captions use `SectionLabel` and `section-label.css`. A shared
set of thin, rounded SVG icons follows the original technology-hero mark. Each
caption explicitly chooses its theme; only its translated editorial ordinal is
removed. Navigation, quantities and ordered exercise/assembly steps retain their
numbers. The icon is decorative and hidden from assistive technology; the caption
remains ordinary readable text and can wrap on narrow screens.
Existing ocean zoom, map and team return tests remain relevant.
