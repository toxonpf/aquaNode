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
