# AquaNode revC — evidence register

As of 2 November 2026. Prepared for the website from the team-supplied AquaNode_R0.3_EC_pH_revC package. No engineering scripts, hardware tests or firmware build were run for this website update.

| Evidence | Reported result | Limit |
|---|---|---|
| Python tests | 18 passed: 15 EC-model + 3 pH-exporter | Host software with synthetic fixtures, not sensor measurements |
| Schematic vs design data | 166 pins agree | Source comparison, not KiCad native ERC |
| PCB vs design data | 139 numbered pads agree | Source comparison, not native DRC or fabrication approval |
| Carrier geometry | Copper and pad placement unchanged from revB | Does not validate revised external wiring |
| pH isolated nets | Separated in the source files | Physical assembly and bypasses are untested |
| C++ pH assertions | 15 prepared, not run | Not included in the 18 Python tests |
| ESP32 build | Attempt interrupted by dependency download | No successful compile or device execution |
| Native ERC/DRC and full export | Not run | Historical R0.3 reports are not revC results |
| Calibration and shared-water tests | Not performed | Real coefficients absent; numerical pH defaults to null |
| pH battery power, enclosure, radio and field use | Not validated | Accuracy, battery life and deployment outcomes remain unknown |

## Primary package records

- README_ru.md: selected SEN0169-V2, DFR0504, ADS1115 and separate pH bench supply.
- checks/Verification_ru.md: dated results and unperformed checks. SHA256: 2ca084dc8bf29c53bd2a1207c80367e4aab8c4c4f1aa6e5a49ecf4a282441d1c
- checks/connection_check.json: source comparisons. SHA256: c4793c2512e90ccedc2047c55db9ab762db71fd32eded379acf9cd1eb2e06dac
- checks/python_tests.txt: 18 Python tests. SHA256: d854d22c086900759cefc5dfb31549f9bfb071b0f963789fc8ccd97390ee1b0a
- engineering/Connection_review_ru.md and bench/Plan_ru.md: calibration of the whole pH chain, separate regulated supply and joint-water acceptance plan. Test targets and vendor specifications are not measured AquaNode results.
- demo/README_ru.md and presentation.config.json: simulation only, invented examples, not loaded by firmware. No simulated readings or operational flags are adopted as engineering evidence.

## Manufacturer references recorded by the package

- [SEN0169-V2](https://www.dfrobot.com/product-2069.html) and [specifications](https://wiki.dfrobot.com/sen0169-v2/).
- [DFR0504](https://www.dfrobot.com/product-1621.html) and [isolation guide](https://wiki.dfrobot.com/dfr0504/docs/19034).
- [ADS1115 datasheet](https://www.ti.com/lit/ds/symlink/ads1115.pdf).
- [SEN0244](https://wiki.dfrobot.com/sen0244/) and [XIAO ESP32S3](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/).

The separate Taiwan station archive retains its actual dates and values. Approximate map markers are geographic illustrations, not revC field measurements or partnership evidence.

Documentation CC BY 4.0. Full attribution is in ATTRIBUTION.md. Public web documents do not publish engineering, firmware or protocol implementation.
