# Content audit — 21 October 2026

## Source hierarchy

User-confirmed current facts: one working buoy, pH and temperature, data once an hour using an own protocol, no public data or deployed network. Do not publish protocol implementation details. Team roles come directly from the brief; Latin spellings are transliterations and should be checked by the team.

## Differences

| Item | User brief / current site | Supplied or public source | Treatment |
|---|---|---|---|
| Working hardware | One working prototype | R0.3 README: not bought, not measured; physical prototype not confirmed for this package | Separate team-reported prototype from unvalidated R0.3; clarification pending |
| Parameters | pH, temperature | GEEP profile: temperature, turbidity | Current user facts win |
| Frequency | Once an hour | Internal engineering energy scenarios include other periods; GEEP says live | Use once an hour; calculations are not product specifications |
| Map / network / apps | Not implemented | GEEP describes global map, mobile guide and teacher dashboard | Treat as earlier vision, not implemented capabilities |
| Team | Five people and supplied roles | GEEP lists four | Use user's five-person list; do not copy unapproved profile links |
| Assembly | Available engineering notes and layout | No complete, proven physical buoy guide / firmware in package | Label English steps as orientation to unvalidated R0.3 |
| Photos | Required by brief | Only Assembly.png, PCB.png, PCB_F.png, PCB_B.png | Show genuine drawings with correct captions; no invented photos |

## Material inventory

- Root package documents: README, Engineering, Purchase_and_test, Verification, Analog_calculations, BOM, Netlist, Sources, MIT_requirements, ATTRIBUTION; CAD parameters in design.json and calculation JSON.
- Engineering figures: Schematic.pdf, Assembly.svg/png, PCB_F.svg/png, PCB_B.svg/png, PCB.png, Report.html.
- KiCad source and library files in cad; fabrication review files; machine-readable checks; source manifests and licences.
- Test log capture/report utilities are tools, not completed test results.
- No physical photographs, contact address, delivered measurements, hosting configuration or confirmed social links supplied.

Published downloads are Assembly.svg, BOM_ru.md and ATTRIBUTION.md. Original protocol-bearing source notes are not published. Only explicitly labelled R0.3 component specifications appear in the technology page. No accuracy, battery-life, range, installed-node count or water-cleanup claims are made.

## Follow-up requested

The user deferred contacts, form integration and hosting. The distinction between the reported prototype and unbuilt R0.3 was explained; no technical confirmation was received. Preserve cautious separation until clarified.

## Editorial pass — 22 October 2026

- Overview introduces the buoy and observation cycle. Key prototype facts remain here as orientation.
- About explains purpose and learning: Ask / Build / Reflect. Removed its buoy illustration, duplicate pH/temperature explainer and shared status grid. Recognition remains here with a link to current journal milestones.
- The buoy explains the R0.3 carrier, component placement and functional paths. Removed the repeated prototype-status table and the observation cycle copied from Overview.
- Build owns assembly sequence, calibration procedure and downloadable resources. The overview of the carrier on The buoy links here for practical checks.
- Journal owns release evidence and pending validation. Added digital verification results and revision changes, sourced from `Verification_ru.md` and `README_ru.md`; no physical performance is inferred from them.
- Team focuses on people; removed prototype-status copy from the gallery note.
- The probe chapter retains parameter meaning and interpretation. Calibration instructions remain in Build instead of being repeated here.

R0.3 sources used for The buoy: `Engineering_ru.md` (board dimensions, construction, ADC channel assignment and power path) and `README_ru.md` (module clearance and component placement changes). Source notes remain local; no protocol implementation details or unpublished files were added to downloads.

## Presentation alignment — 28 October 2026

Source: the team-supplied root `speech.md`, slides 1–11. This pass updates English and Russian mission copy, rather than treating a presentation as a new engineering specification.

- The main story connects missing local water observations with the gap between classroom theory and practical learning. AquaNode is presented as an open, accessible instrument students can build with guidance.
- Overview now explains **build → deploy → measure → understand → act**. About develops that approach as three continuous practical stages, retaining the mobile layout without tabs.
- The first supervised assembly by a teenager without prior experience is attributed to the team. It is an initial learning trial, not evidence of a completed multi-school programme or a measured educational outcome.
- **10 schools, 500+ students and 50+ km of coastline are future pilot goals.** About explicitly labels them as targets. The future network scene and map preview describe school participation as a next stage.
- The map still distinguishes team-supplied approximate locations, the original Taiwan station archive and simulated buoy readings. The page introduction now explicitly says it is not a live school-network feed. Marker counts and model deviations do not demonstrate pilot participation or field accuracy.
- Technology and Build retain their R0.3 facts and physical-validation limitations. Journal includes preparation of a repeatable classroom activity alongside mechanical, electrical and measurement checks.
- The user clarified on 28 October that **temperature and turbidity** are the current prototype's parameters. Overview, probe selection, model annotations and the journal's current status now use that pair. pH and salinity belong to earlier exploration; the separate R0.3 drawings still document their original pH/temperature interfaces. No turbidity sensor model, calibration unit, range or accuracy is inferred from that CAD package. The map's pH/temperature demo scenarios remain explicitly simulated and are not presented as the current instrument's capabilities.
- Time-sensitive UNEP statistics, UN-Water figures and the unnamed review of 100 studies were not imported: the supplied speech does not include their primary citations. The site communicates the qualitative motivation without presenting those figures as verified claims.

The original speech remains unchanged.

## Current revision — 29 October 2026: R0.3-EC-revB

The newly supplied `AquaNode_R0.3_EC_revB/web_handoff/` is the current editorial source. Its status and evidence limits supersede earlier current-status wording about a working hourly temperature/turbidity buoy. Engineering directories were reviewed without modifying their source files.

- Current scope: an educational **freshwater** design, investigating an **experimental EC estimate using the SEN0244 TDS module**, with **DS18B20 temperature** and prepared USB/JSONL bench source. EC is not specific salt identification, seawater salinity or a drinking-water safety assessment.
- The root README, web handoff, verification report, static review, source-preservation record and synthetic test report were cross-checked. **15 synthetic host-model tests** and a **155-contact structural comparison** are documented. These are not ESP32 execution, physical measurements or native ERC/DRC.
- Hardware validation, ESP32 compilation, native ERC/DRC, a current full schematic export, fabrication release, power/ADC measurements, independent EC validation, pH interaction, enclosure, radio and mesh checks remain pending. Accuracy and battery life remain unknown/null.
- Home, About, Technology, Build, Journal, the five illustrative buoy scenes, model labels, probe selection and metadata now follow this scope. Technology and Build use the permitted architecture illustration instead of historical CAD images presented as current. The public build section is a validation-plan overview, not an electrical assembly instruction.
- Only permitted web handoff texts, status, evidence register, publishing rules and architecture are copied to the public site. Public attribution preserves AquaNode CC BY 4.0, the open-pisciculture reference, and hardware/software licence distinctions. Private engineering/firmware and protocol implementation are not added to downloads.
- Current downloads are overview (RU/EN), status JSON, evidence register, architecture SVG and attribution. Historical R0.3 source files remain preserved; the journal explicitly labels their dated results as historical and not applicable to revB.
- The map keeps its geographic grouping and real Taiwan station archive. Approximate markers no longer imply installed devices or institutional partnerships. Simulated buoy values are no longer rendered; current readings remain unpublished rather than being filled with plausible examples. Archive/model helper data remains separate from revB.
- The presentation's 10 schools / 500+ students / 50+ km figures are labelled future goals, not confirmed users or coverage. The previously supplied GEEP certificate remains separate evidence of recognition. No MIT affiliation, acceptance or partnership is implied.

Validation of this website update does not mean the engineering checks in the package were rerun or the hardware was tested. Source artifacts and their declared limits remain the basis of the public claims.

## Editorial and interface audit — 30 October 2026

Scope: all seven routes in Russian and English, including current-status notices, resource labels, source links, metadata, archive records and local navigation.

- Redesigned the status notice as an unboxed editorial strip with a circuit icon, distinct stage and next-step lines, revision, source date and freshwater scope. The date now derives from `status.json`; it is not the website edit date. Dark hero colours and the light build panel have separate readable treatments. Narrow containers reflow the metadata.
- Removed repeated release-warning prose immediately below the Build hero. That section now explains how to use the architecture, validation stages and public documents. Accessibility labels say “Validation stages”, matching the actual content rather than suggesting a complete assembly guide.
- Simplified repeated engineering caveats in Technology and Journal while keeping the current hardware limits visible. The interpretation of synthetic/static checks is separated from their metrics and the next hardware tests. Salt identification and drinking-water safety remain outside the EC design's capabilities; unknown accuracy and battery life remain unknown.
- About introduces its stage alongside the mission rather than placing another detached notice after the learning section. Classroom activities are described as a planned learning journey. Generic page metadata also describes development and planned learning rather than completed school use.
- The map now explicitly describes a **team-supplied CSV extract**, not the entire external dataset. Record/station counts and year range derive from the CSV. Local validation found 388 rows, four stations, no duplicate station/date pairs, and no malformed row lengths or calendar dates. This is a structural check of the supplied file, not independent verification of each measurement.
- Removed unrelated university-staff and GEEP/OCA links from map-location/comparison panels. The public source for the Taiwan archive remains linked; approximate locations do not imply institutional partnerships or current device deployments.
- A browser pass over all routes/locales found no duplicate IDs, missing local fragment targets, repeated visible long paragraphs, or English body-copy fallbacks in Russian. Responsive desktop/mobile variants are excluded from duplicate-copy findings when hidden. All eight distinct linked downloads returned the intended file types rather than a single-page fallback.
- Interface checks cover page content, source status/unknowns, downloads, guide navigation, heading limits, desktop/mobile widths and status contrast. They do not certify the hardware or validate field outcomes.

External source checks on 30 October 2026:

- [GEEP AquaNode profile](https://thegeep.org/programs/youth-innovation-challenge/aquanode-team): the page identifies the team as a 2026 Youth Innovation Challenge winner. Its temperature/turbidity, app and dashboard descriptions concern the earlier vision, not validated EC-revB capabilities. The supplied certificate remains separate recognition evidence.
- [Taiwan government dataset 155934](https://data.gov.tw/dataset/155934): the official catalogue describes marine water-quality records, parameter units and missing/below-detection notation. It is distinct from freshwater EC validation. The raw OCA download could not be fetched through the browsing tool; exact row-by-row equivalence of the supplied extract was not independently established.
- [open-pisciculture reference project](https://github.com/open-pisciculture/open-source-fish-farming-prototypes): the upstream source link remains available through attribution. Its implementation or performance is not presented as AquaNode test evidence.
- [Oceanwavescrushing on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg): the source credits Luftrum and CC BY 3.0, matching the footer's audio attribution and linked licence. The adapted underwater mix is identified separately.
