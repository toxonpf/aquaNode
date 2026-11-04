# AquaNode R0.3-EC-pH-revC

## Scope of this document

This document covers only the developing R0.3-EC-pH-revC bench revision, dated 2 November 2026. AquaNode also has existing devices, sensor measurements and buoys sent to partners, as reported by the team. Those device records are separate from the revC checks below.

Revision: 2 November 2026. Educational freshwater bench configuration; hardware validation pending.

## Current configuration

- XIAO ESP32S3 coordinates the bench source and USB records.
- SEN0244 is a TDS module under evaluation for an experimental EC estimate in freshwater. It is not a seawater salinity instrument or a detector for individual salts.
- DS18B20 supplies the temperature input.
- SEN0169-V2 adds a pH electrode and conversion board. DFR0504 isolates both its power and analog signal before ADS1115 acquisition.
- The pH isolator requires a separate regulated bench supply: 5.00 ±0.10 V, at least 0.5 A. Battery-powered pH needs a separate converter selection and a new energy budget; it is not complete.

## Calibration and joint operation

The pH electrode may remain in the same water as EC in this design. Isolation does not prove interference-free operation. Calibrate the complete electrode–conversion board–isolation–divider–ADC chain with real buffers, validate power, and compare the sensors separately and together.

The source reads the pH ADC voltage after the divider. Numerical pH defaults to null until real calibration and validation gates are accepted. No real pH or EC coefficients are supplied. Numerical pH is restricted to the measured calibration range and calibration temperature ±0.5 °C; automatic pH temperature compensation is not claimed. Manual acceptance flags are not live protections.

## Evidence and remaining work

The supplied report records 18 Python tests passed: 15 EC-model tests and 3 pH-exporter tests. Source comparisons cover 166 schematic pins and 139 numbered PCB pads; carrier copper and pad placement remain unchanged from revB. These checks do not validate physical wiring, sensor accuracy or KiCad design rules.

The ESP32 build attempt stopped during dependency download. Fifteen C++ pH assertions were prepared but not run. Native ERC/DRC, device execution, real calibration, shared-water tests, enclosure and battery validation remain pending. There is no new fabrication release, measured revC accuracy, verified radio/mesh operation or field deployment evidence.

The presentation profile is explicitly simulation with invented samples. It is separate from engineering results and is not loaded by the hardware firmware. Independent Taiwan station archive records on the website are not AquaNode measurements.

Public web materials are an overview, a derived status snapshot, evidence notes and an illustrative architecture. They do not replace the full engineering instructions or publish firmware/protocol implementation. Documentation and website-derived diagrams: CC BY 4.0, with original attribution retained.
