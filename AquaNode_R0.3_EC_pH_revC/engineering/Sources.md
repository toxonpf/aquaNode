# Primary sources used for revC — 2026-11-02

- [SEN0169-V2 product](https://www.dfrobot.com/product-2069.html): industrial pH kit, continuous-monitoring application, current listed price.
- [SEN0169-V2 specifications](https://wiki.dfrobot.com/sen0169-v2/): supply/output ranges, probe range, interface labels.
- [SEN0161-V2](https://wiki.dfrobot.com/sen0161-v2): lab-grade alternative; same signal-interface class, different probe application.
- [DFR0504 product](https://www.dfrobot.com/product-1621.html): isolated power/signal, 5V input tolerance, 75mA no-load current, response/error, price.
- [DFR0504 hookup guide](https://wiki.dfrobot.com/dfr0504/docs/19034): MCU/SEN sides, 170mA secondary limit, prohibition on joining grounds. The wiki table has confusing pin labels: this project uses printed MCU/SEN and −/+/A names rather than adopting its physical numbering.
- [ADS1115 datasheet](https://www.ti.com/lit/ds/symlink/ads1115.pdf): AIN input limits, pin names, MUX/PGA/configuration; 16SPS single-shot 0xC323 derived from register fields.
- [XIAO ESP32S3](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/): board GPIO names.
- [XIAO/Wio kit](https://wiki.seeedstudio.com/wio_sx1262_with_xiao_esp32s3_kit/): kit identity and B2B connection.
- [SEN0244](https://wiki.dfrobot.com/sen0244/): inherited EC/TDS module remains experimental EC estimate.

No manufacturer photograph is represented as an assembled AquaNode. Full prior design provenance and licences are preserved in history/original_revB.zip. Published pH sensor accuracy is not adopted as the accuracy of the complete isolated ADC chain.
