# Buoy map and observation sources

`/map` and the home `MapEmbed` share Leaflet, `data.ts` and controls. OpenStreetMap attribution, lazy tiles, tile-failure fallback, touch scrolling, clustering, keyboard selection and fullscreen focus handling are retained.

## Restored locations

At the owner's explicit request on 4 November 2026, the original **104 map markers** are restored with exactly their original deterministic positions and IDs: 97 `AKT-*` near Aktau, three `HPU-*` near Honolulu, and four `TWN-*` near Taiwan reference stations. These illustrative positions are not surveyed GPS fixes. The count is labelled map markers, not verified installed/transmitting devices. The previous editorial change that replaced them with three regional markers is superseded.

Four independent Taiwan reference stations retain their source positions and identifiers. They can be hidden without removing the buoy layer. Direct links such as `/map?buoy=AKT-049` focus and select the matching original marker. Every buoy has calculated readings, source provenance and a stable ID. All 104 records can be downloaded as `aquanode-buoy-examples.json`; each record explicitly says `calculation-example` and `illustrative` position.

## Calculation records

The owner authorized examples based on actual regional observations, with up to 5% deviation. `exampleFor` uses a deterministic ID-based offset and clamps the rounded result to the original value ±5%. This is a generation parameter, not measured accuracy. Missing, censored and nonnumeric source values never become numeric readings. No artificial sampling timestamp is assigned.

Sources are retained beside the generated readings:

- **Aktau:** Kostianoy et al. (2024), *Oil pollution near the ports of Aktau, Kuryk and Ersai*, Ecologica Montenegrina 76, Table 4: station K4 (Aktau), sample 13 September 2023, pH **8.12**. [Primary article / DOI](https://doi.org/10.37828/em.2024.76.4). Only pH is generated; no unsupported temperature baseline is added.
- **Hawaiʻi:** Hawaiʻi Department of Health, *Coastal Waters*, Table 1, **Pre-Fire North Reference Area** in West Maui: average temperature **26.3 °C**, pH **8.17**. [Official regional source](https://health.hawaii.gov/environmental-data/coastal-waters/). The site explicitly identifies this as a Maui regional average, not a measurement at the Honolulu marker positions. The source aggregate period, 1 August 2022–7 August 2023, is retained instead of inventing a single sampling date.
- **Taiwan:** the unchanged local `stations_data_en.csv` extract from [dataset 155934](https://data.gov.tw/dataset/155934). Each buoy uses its associated station and the selected actual quarter. The source date is preserved. A missing quarter remains missing.

Changing the Taiwan archive quarter does not change generated Aktau/Hawaiʻi values or manufacture new observation dates there. No Taiwan measurement is reused for another region.

## Original archive

The separate archive retains 388 source records from four Taiwan stations, 2002–2026. Quarter selection uses the latest actual sample in that quarter. Empty values and detection-limit strings such as `<3` remain unchanged. The CSV supplies dates, not times or time zones, and is independently downloadable. Station examples are opt-in; buoy calculation records are visible upon selection.

The generated records are not original measurements by AquaNode. Verified device measurement files, surveyed positions, calibration records and shipment dates remain outstanding.

## Archive layout

`StationArchive` gives the Taiwan station archive its own full-width section
below the map and comparison. Station/quarter controls and coordinates occupy
the left column, with the dated values on the right; phones stack controls
above a single list of values. Source attribution and CSV download share a
separate footer. Selecting a station focuses its buoy on the map. Both archive
and comparison period controls remain synchronized, including language changes.


## Deployment context and comparison

Deployment information is attributed to the AquaNode team: three Hawaiʻi buoys
were launched jointly with Hawaiʻi Pacific University (HPU), all four Taiwan
buoys with OCA support, and all 97 Aktau buoys were assembled by students of
coastal School No. 15. This updates the earlier school attribution. These are
team-supplied accounts, separate from the current revC hardware evidence.
The Technology page also attributes development of the second buoy version
with OCA specialists to the team, without equating that version with revC.

The panel below the map calculates the mean **absolute** relative difference
of the simulated Taiwan examples for the selected quarter. It pools available
pH and temperature pairs across the four buoys and displays separate metric
averages and coverage counts. Both period controls share the same state. The
formula is mean(|example − reference| / |reference| × 100%). Missing, censored
and zero-reference values are excluded, never treated as zero difference.
This number is explicitly simulated, not measured accuracy: the supplied file
contains no paired buoy/reference field results. A measured average requires
those results and cannot be inferred from the ±5% simulation constraint.
OCA means Taiwan Ocean Conservation Administration, a partner of GEEP on the
Youth Innovation Challenge; GEEP and OCA are separate organisations.

Official programme: https://thegeep.org/programs/youth-innovation-challenge/2026-youth-innovation-challenge
HPU faculty: https://www.hpu.edu/faculty/cncs/jennifer-lynch.html
