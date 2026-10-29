# AquaNode
## Explore freshwater by building a buoy
AquaNode is a project to develop an affordable educational buoy for freshwater monitoring. We want school students to build hardware, work with sensor readings, and learn to test their conclusions about the environment.

## Current stage: engineering development
We have prepared editable schematic and PCB files, a component list, bench firmware source, and a test plan. The current revision explores a budget conductivity estimate using the SEN0244 module alongside DS18B20 temperature sensing. The revised power and wiring design still requires bench validation.

## Progress documented
- Revised design files for the experimental EC channel and temperature sensor connections.
- Bench data acquisition source code for USB logging and a calibration model.
- Software checks using synthetic inputs. These do not demonstrate sensor accuracy or hardware operation.
- A test plan covering power, measurement performance, sensor interaction, and water exposure.

## What comes next
Compile the firmware, run native schematic and PCB checks, and test against independent reference standards. Then evaluate pH interaction, enclosure performance, radio communication, and energy use. We intend to publish results with the conditions and limits of each test.

## Current limitations
SEN0244 is a TDS module being investigated for an experimental EC estimate. AquaNode accuracy, long-term water operation, and battery life have not been established. This revision does not identify specific salts, assess drinking-water safety, or target seawater. A functioning radio network and field pilot are not demonstrated by this package.

## Open engineering
The project builds on open-source work with its authorship and licences preserved. Our next goal is reproducible test evidence to support further development, including a potential future MIT Solve application.
