# Primary sources checked 2026-10-29
Facts below are component specifications, not AquaNode test results. Links were read using web access; local command-line downloads failed DNS resolution.

| Source | Used for |
|---|---|
| https://wiki.dfrobot.com/sen0244 | SEN0244 3.3–5.5 V supply, 0–2.3 V output, 3–6 mA, 0–1000 ppm and ±10% FS at 25 C; not an EC accuracy guarantee |
| https://www.dfrobot.com/product-1662.html | $11.80 advertised price; AC excitation; probe/board distinctions |
| https://www.dfrobot.com/forum/topic/315495 | Manufacturer FAQ Q5 recommends ADS1115 with ESP32 |
| https://wiki.dfrobot.com/sen0244/docs/20304 | Calibration standard example 1413 uS/cm at 25 C, handling cautions; no universal TDS-to-EC conversion claim adopted |
| https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html | analogReadMilliVolts, attenuation, ESP32-S3 input range |
| https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-reference/peripherals/adc/adc_calibration.html | Calibration and noise reduction; capacitor near ADC and repeated sampling |
| https://www.ti.com/lit/ds/symlink/ads1115.pdf | ADS1115 channels, supply and input restrictions, PGA does not permit input beyond rails |
| https://www.ti.com/lit/ds/symlink/tps61040.pdf | Reference limits and boost behaviour; switch current is not output current |
| https://www.ti.com/lit/ds/symlink/tps7a20.pdf | 6 V recommended maximum input, output tolerance and startup requirements |
| https://www.analog.com/media/en/technical-documentation/data-sheets/DS18B20.pdf | External supply, 1-Wire and conversion behaviour |
| https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/ | XIAO board and pin documentation; physical revision still requires inspection |
| https://wiki.seeedstudio.com/wio_sx1262_with_xiao_esp32s3_kit/ | Correct ESP32S3 kit, not nRF kit |
| https://files.seeedstudio.com/products/SenseCAP/Wio_SX1262/Schematic_Diagram_Wio-SX1262_for_XIAO.pdf | Wio B2B schematic |

Unverified in revB: exact purchased pH AFE, protected battery MPN, complete component sourcing, all land patterns, environmental suitability and radio legal configuration. Previous source manifests are provenance only, not fresh validation. No vendor pictures redistributed as photographs of AquaNode.
