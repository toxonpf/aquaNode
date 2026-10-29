# Attribution, licences and change notice

## Original work

Reference project: **open-pisciculture/open-source-fish-farming-prototypes**, data-buoy-node.
Source: https://github.com/open-pisciculture/open-source-fish-farming-prototypes
Reviewed commit: `1ff67e96c81d22075cd6b9517ece5539700fd0e9`.

Original authors credited in the repository publication: Juan D. Medina, Alejandro Arias, Juan M. Triana, Luis F. Giraldo, Fredy Segura-Quijano, Andres Gonzalez-Mancera, Andres F. Zambrano, Julián Quimbayo and Eduardo Castillo.

Citation: Medina JD et al. (2022), “Open-source low-cost design of a buoy for remote water quality monitoring in fish farming”, PLOS ONE 17(6): e0270202. https://doi.org/10.1371/journal.pone.0270202

The original project declares CERN-OHL-P version 2 for hardware, MIT for software and CC BY 4.0 for documentation. Original CERN-OHL-P and MIT licence files are reproduced unchanged in `licenses/`. The original MIT notice contains `[fullname]`; this package preserves that text rather than inventing a replacement copyright holder.

The original project also credits SnapEDA for PCB symbols/footprints/3D models and Atlas Scientific for mechanical models. Those binary libraries/models have not been incorporated into the AquaNode CAD. Their original attribution is retained here for the audit context.

## AquaNode R0.3 changes, 2026-10-20

Carrier revised for XIAO ESP32S3 + Wio SX1262. DS18B20 and enable controls now connect directly; DS2482, PCA9536, OPA2333, TMUX1511 and MCP100 are removed. A single verified pH adapter replaces the resistor matrix. SPST disconnects the battery; ordinary USB is a service supply. Battery sensing is switched with discrete MOSFETs. The two-layer PCB is routed and passed native KiCad 8.0.9 ERC/DRC. Firmware, mesh, physical assembly and bench validation are not completed. No endorsement by the original authors or manufacturers is implied.

New hardware source in this package is offered under **CERN-OHL-P-2.0**, matching the reference hardware licence. New documentation is offered under **CC BY 4.0** with attribution to this AquaNode package and preservation of original attribution for referenced material: https://creativecommons.org/licenses/by/4.0/

The new test tools are offered under MIT; see `licenses/MIT-AquaNode.txt`. These declarations apply only to newly supplied material and do not relicense third-party works.

## KiCad libraries and other third-party material

Footprints except `L_Bourns_SRN4018_Custom` were obtained from the official KiCad footprint repository. Local footprint files have been normalized by KiCad 8.0.9, including through-hole attributes; geometry derives from the cited upstream files. The PCB embeds normalized instances with assigned references/pad nets and removed external 3D model paths. See `reference_sources/footprints_manifest.json` for source URLs and hashes.

KiCad libraries are **CC BY-SA 4.0 with the KiCad library exception**, allowing use in electronic designs under the designer's chosen licence. Standalone footprint redistribution remains subject to the upstream library terms. See https://www.kicad.org/libraries/license/ and the included upstream `licenses/KiCad-LICENSE.md`.

The SRN4018 land pattern was drawn anew from Bourns recommended dimensions; package data remains attributable to Bourns. Component names, trademarks, specifications and linked vendor documentation belong to their respective owners. Vendor datasheets are linked rather than republished in this delivery.

No warranty of fabrication readiness: successful native CAD checks do not verify module mechanics, analog performance, power transients, radio compliance or operation in water. Physical validation remains necessary.

## R0.3 additional changes

Relocated module-area components; compact power routing and local ground return; 71 ground stitching vias; EN follows BOOST_IN; explicit pH assembly variants; connector silkscreen; standard KiCad Device symbols embedded with per-instance identifiers in five functional groups. Standard R/C/L/D_Schottky/Q_PMOS_GSD/Q_NMOS_GSD symbols originate from the official KiCad 8.0.9 bundled Device library under the KiCad library licence and exception.


## R0.3-EC experimental assembly, 2026-10-29

Derived directly from R0.3. Added SEN0244 frontend, removed the GPIO1 pull-up from assembly, moved DS18B20 to GPIO43, and added external filtering/protection. Copper geometry remains unchanged; net labels and assembly state are revised. DFRobot polynomial coefficients are attributed to its SEN0244 documentation; new calibration/validation code is original and does not copy the vendor example implementation. Existing licences remain in force. This assembly has not passed new native ERC/DRC or hardware validation.

## R0.3-EC-revB, 2026-10-29
Changes: external 5V supply harness, ADC capacitor placement, PCB legend corrections, firmware validation gates, bench and web handoff. Existing attribution and licences preserved. New diagram is an engineering illustration, not a prototype photograph. Native KiCad checks and hardware testing NOT performed for revB.
