# Источники и границы подтверждения

Проверено 19.10.2026. Внешние цены и наличие меняются. Для платы использованы аппаратные MPN; поисковые ссылки магазина не являются обещанием наличия. Скачанные исходники идентифицированы хешами в `reference_sources/source_manifest.json`; поставляемые footprints — отдельным манифестом.

| Источник | Для чего использован |
|---|---|
| [Исходный проект, фиксированный commit](https://github.com/open-pisciculture/open-source-fish-farming-prototypes/tree/1ff67e96c81d22075cd6b9517ece5539700fd0e9/data-buoy-node) | Схема, PCB, библиотеки, BOM, лицензирование |
| [Статья авторов, PLOS ONE](https://doi.org/10.1371/journal.pone.0270202) | Авторство и назначение исходного проекта |
| [Seeed nRF kit](https://wiki.seeedstudio.com/xiao_nrf52840%26_wio_SX1262_kit_for_meshtastic/) | Конкретный комплект 102010710 |
| [Схема Wio nRF expansion](https://files.seeedstudio.com/products/113010003/Wio-SX1262%20for%20XIAO%20V1.0.pdf) | Кнопка, DIO1, BUSY, RESET, NSS, RF_SW, SPI |
| [nRF GPIO](https://wiki.seeedstudio.com/XIAO-BLE-Sense-Pin-Multiplexing/) | Физические P0/P1 |
| [Текущая схема XIAO nRF](https://files.seeedstudio.com/wiki/XIAO-BLE/Res/260828_XIAO_nRF52840.pdf) | Выбор источников, зарядка, LDO; аппаратную ревизию покупки сверить |
| [Ранее опубликованная XIAO Sense v1.1](https://files.seeedstudio.com/wiki/XIAO-BLE/Seeed-Studio-XIAO-nRF52840-Sense-v1.1.pdf) | Сопоставление ревизий, не смешивать BOM зарядников |
| [Seeed ESP kit](https://wiki.seeedstudio.com/wio_sx1262_with_xiao_esp32s3_kit/) | Конкретный комплект 102010611 |
| [Схема Wio ESP B2B](https://files.seeedstudio.com/products/SenseCAP/Wio_SX1262/Schematic_Diagram_Wio-SX1262_for_XIAO.pdf) | Отличие от nRF extension |
| [Официальный код Seeed SX1262 BSP](https://github.com/Seeed-Studio/one_channel_hub/blob/master/components/smtc_ral/bsp/sx126x/seeed_xiao_esp32s3_devkit_sx1262.c) | Фактические GPIO в инициализаторе ESP |
| [Elecrow CRT14016P](https://www.elecrow.com/crowtail-ph-sensor.html) | Цена, заявленные 5 В, габариты/отклик |
| [Elecrow wiki](https://media-cdn.elecrow.com/wiki/crowtail--ph-sensor.html) | Ссылка на архив схемы, который оказался v1.0 |
| [Архив Elecrow](https://media-cdn.elecrow.com/wiki/image/2/2f/Ph-sensor-schematic.zip) | Имена файлов `crowtail-PH Sensor v1.0.sch/.brd`; не доказательство v2 |
| [DFRobot Pro V2](https://wiki.dfrobot.com/sen0169-v2/) | Питание, выход, эксплуатация SEN0169-V2 |
| [DFRobot SEN0169-V2 магазин](https://www.dfrobot.com/product-2069.html/) | Цена комплекта |
| [DFR0952](https://www.dfrobot.com/product-2584.html) | Топология готового модуля/доступные характеристики; Iq не подтверждён |
| [ADS1115 datasheet](https://www.ti.com/lit/ds/symlink/ads1115.pdf) | DG(S) pin map, питание, PGA и преобразование |
| [DS2482-100 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/DS2482-100.pdf) | SOIC pin map, адрес, ток и 1-Wire |
| [PCA9536 datasheet](https://www.ti.com/lit/ds/symlink/pca9536.pdf) | Адрес, слабые подтяжки, startup, POR errata |
| [TPS61040 datasheet](https://www.ti.com/lit/ds/symlink/tps61040.pdf) | SOT23 pins, feedback, ток ключа, сквозной путь L+D |
| [TPS7A20 datasheet](https://www.ti.com/lit/ds/symlink/tps7a20.pdf) | 5V LDO, DBV pins, пределы/разряд выхода |
| [OPA333/OPA2333 datasheet](https://www.ti.com/lit/ds/symlink/opa333.pdf) | Буферы, диапазон питания/входов |
| [TMUX1511 datasheet](https://www.ti.com/lit/ds/symlink/tmux1511.pdf) | Защита при снятии питания, утечки, TSSOP pin map |
| [MCP100/MCP101](https://www.microchip.com/en-us/product/MCP100) | Supervisor 3.15 В, pin map SOT23 |
| [Bourns SRN4018](https://www.bourns.com/docs/Product-Datasheets/SRN4018.pdf) | Индуктивность, ток насыщения и рекомендуемые площадки 1,5×3,6 мм |
| [NCC LP0002](https://istkdb.ncc.gov.tw/kdb/KDB_200/1) | §5.8.1 для 920–925 МГц IoT; сайт иногда перенаправляет на Index |
| [Официальный PDF NCC](https://api.ncc.gov.tw/chncc/app/data/doc?aplistdn=undefined&detailNo=2&id=59&module=commonMessage11&preview=undefined&serno=49880_538_news&type=s) | Дополнительная официальная копия правил; сверять актуальность при выпуске |
| [TE/Linx ANT-916-CW-HWR-SMA](https://www.te.com/en/product-ANT-916-CW-HWR-SMA.html) | Диапазон антенны и SMA |
| [Taoglas CAB.011](https://www.taoglas.com/product/cab011-ipex-mhfiu-fl-to-95mm-1-13-cable-to-smafbkst/) | U.FL-compatible пигтейл с корпусным SMA |
| [Adafruit 328](https://www.adafruit.com/product/328) | Защищённый 2500 мА·ч аккумулятор |
| [Adafruit 381](https://www.adafruit.com/product/381) | DS18B20 и ограничения герметичности/коррозионной среды |
| [KiCad footprints](https://github.com/KiCad/kicad-footprints) | Локальные посадочные места; SHA256 в manifest |
| [KiCad library licence](https://www.kicad.org/libraries/license/) | CC BY-SA 4.0 с library exception |
| [Altium KiCad importer](https://www.altium.com/documentation/altium-designer/design-tools-interfacing/kicad-import) | Официальный путь импорта, не доказательство успешного переноса R0.1 |

## Измерением, а не источником подтверждаются

Выход и распиновка Elecrow v2.0, потребление обоих AFE, время прогрева при циклическом питании, ток готового узла, пульсации/наводки, ресурс батареи, герметичность, точность pH после сборки и соответствие конкретного радиоустройства требованиям NCC. Эти характеристики не подменены данными старой ревизии или рекламной точностью ADC.
