# Evidence register
| Statement | Artifact | Evidence level | What it does NOT prove |
|---|---|---|---|
| Editable circuit/PCB project exists | ../cad/ and ../design.json | Source artifact | Electrical safety, successful fabrication |
| 5 V external harness is specified | ../EC_integration_ru.md; M1.2 in schematic | Design change | Rail stability or shutdown safety |
| DS18B20 moved to GPIO43 | ../design.json; firmware EC_PIN/DS_PIN | Source agreement | Actual sensor response |
| Acquisition and calibration logic exists | ../firmware/ec_bench; ../test_tools/ec_model.py | Software source | Successful ESP32 compile, ADC accuracy |
| Synthetic model checks executed | ../checks/python_tests.txt | Host software test | Physical EC performance |
| Cross-file/static checks executed | ../checks/static_review.json | Structural checks only | Native ERC/DRC |
| Baseline sources preserved | ../checks/source_preservation.json | SHA256 comparison | Provenance of unprovided photos or awards |
| Bench acceptance plan exists | ../bench/ | Planned tests | Completed experiments |

No current artifact establishes: working mesh, pH accuracy, seawater salinity, measured battery life, active users, partnerships, pilots, field outcomes, MIT Solve acceptance. Never borrow those claims from historical copy or an external reference project.
