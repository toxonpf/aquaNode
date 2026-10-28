# Observation atlas

The standalone `/map` route is linked from the footer. It uses Leaflet 1.9.4
and OpenStreetMap raster tiles, without an API key. Zoom controls and keyboard
navigation are enabled. In-page wheel zoom uses Ctrl/Command to preserve page
scrolling; expanded maps use the ordinary wheel.
The basemap is loaded on demand, with visible OpenStreetMap attribution.
No tiles are prefetched or downloaded for offline use. The home-page network
section uses `MapEmbed`, which loads Leaflet/tiles only when approaching the
viewport. The About learning section links to the atlas. All instances reuse the
same location and clustering data. Embed links carry validated `region`/`buoy`
query parameters to the atlas; no separate location copies are maintained.

## Map interaction

- Ordinary wheel scrolling remains page scrolling. Ctrl/Command + wheel zooms
  an active map around the pointer. Zoom buttons have 44px targets and bounds.
- In expanded view, ordinary wheel scrolling zooms around the pointer without a
  modifier. The hint updates to this mode; exiting restores the preceding
  interaction mode, including a touch-friendly non-draggable embedded preview.
- Embedded maps and touch maps start in page-scroll mode. The explicit interaction
  toggle enables dragging/pinch; its second state restores page scrolling.
- The reset control fits the requested region or focused buoy. Resizing preserves
  the current map centre/zoom, including on expanding/collapsing the map.
- Expansion moves a stable React portal to the body, escaping animated/clipped
  containers without rebuilding Leaflet. Escape closes it, focus remains inside
  the expanded map, and the previous body scroll state is restored on exit.
- The selected-point card opens that buoy in the full atlas, or takes the reader
  to the existing details panel. On phones the zoom/view controls form a lower
  horizontal toolbar, clear of the region markers and selected-point card.
- Loading status also covers new tiles requested while panning or expanding.

## Locations

`src/pages/map/data.ts` defines 104 AquaNode markers: three near HPU in
Honolulu, 97 near the supplied Aktau waterfront area and one beside each of
the four supplied northern Taiwan stations. Buoy coordinates are approximate
illustrative positions, **not GPS fixes**. Aktau uses a deterministic coastal
layout to make all 97 markers individually selectable. Replace these with a
surveyed location file when one becomes available. Station coordinates retain
the supplied six-decimal values.

`shoreline.ts` records local OSM coastline excerpts for the marked Aktau and
Honolulu waterfronts (ways 22491858 and 456826902, retrieved 2026-10-27). Points
follow measured distance along the coast and are offset 9–21 metres to the
water side; Honolulu points are 14 metres offshore. This is cartographic
validation, not a claim about physical installations or current water levels.

`cluster.ts` uses Supercluster 9.1 to build geographic hierarchies per region,
independently of viewport bounds. Intermediate levels split the coastal chain
into local groups. Clicking uses the group's first expansion zoom, rather than
skipping directly to the most detailed level. Group anchors are actual member
coordinates, so curved bays cannot produce an inland centroid. At zoom 20 all
individual buoy markers are exposed; level 19 tiles are overzoomed, not requested
from an unsupported tile endpoint. Hover/focus traces the group's member points.
Station markers are separate diamonds shown from zoom level 8.

## Observations

The original root `stations_data_en.csv` is imported at build time, unchanged.
Vite also emits the CSV as a downloadable asset. There are 388 observations,
97 for each of four stations. The period picker lists quarters that actually
occur in the file. Within a quarter the latest record for the selected station
is displayed with its actual date; dates are never interpolated or reassigned.
Missing values remain empty and render as a dash. Detection-limit strings
such as `<3` remain intact. No measurement dates are assigned to Hawaii or
Aktau because their readings were not provided.

Source: https://data.gov.tw/dataset/155934

The AquaNode preview uses the geographically nearest supplied station for Taiwan.
Its pH and temperature receive deterministic offsets per buoy, period and metric.
Both the raw and rounded values stay within ±5% of the reference (rounding is
clamped to representable values inside that interval). Missing or censored values
remain unavailable. Hawaii and Aktau have independently labelled demo baselines
(26.0°C / pH 8.10 and 20.0°C / pH 8.20), not imported Taiwan observations. The local
scenarios have no invented sampling dates. All previews are labelled simulated.
They must not be used as recorded telemetry or as evidence for any accuracy claim.

Placement partnerships and the "up to 5%" comparison result are attributed to
the team. The supplied file contains no paired buoy/reference test results.
OCA means Taiwan Ocean Conservation Administration, a partner of GEEP on the
Youth Innovation Challenge; GEEP and OCA are separate organisations.

Official programme: https://thegeep.org/programs/youth-innovation-challenge/2026-youth-innovation-challenge
HPU faculty: https://www.hpu.edu/faculty/cncs/jennifer-lynch.html

## Checks

`tests/pages/map.spec.ts` covers global counts and cluster expansion, individual
selection, original dates and missing/censored values, CSV download, language
switching, desktop and touch layouts, and unavailable basemap tiles. Additional
checks verify shoreline clearance, preservation of all 104 members at every
zoom, water-side group anchors, nearest-station assignments and the 5% bound
across all archived periods.
