// AquaNode R0.3-EC-pH-revC. Experimental freshwater EC estimate. MIT licence.
// R3 MUST BE REMOVED. SEN0244 analog signal -> J7.3 -> GPIO1.
// DS18B20 GPIO43; active isolated pH via ADS1115 AIN0; USB CDC only; no radio.
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <esp_system.h>
#include <Wire.h>
#include "ph_calibration.h"
#include "ph_model.h"
#include "calibration.h"
#if !defined(CONFIG_IDF_TARGET_ESP32S3)
#error "ESP32-S3 target required"
#endif
#if !defined(ARDUINO_USB_CDC_ON_BOOT) || !ARDUINO_USB_CDC_ON_BOOT
#error "Enable USB CDC on boot; UART0 TX conflicts with DS18B20"
#endif

constexpr uint8_t EC_PIN=1, DS_PIN=43, SENSOR_POWER_PIN=2;
OneWire oneWire(DS_PIN);
DallasTemperature temperatureBus(&oneWire);
DeviceAddress thermometer;
bool haveThermometer=false;
char bootId[17];
uint32_t seq=0;

float curve(float v) { return 133.42f*v*v*v-255.86f*v*v+857.39f*v; }

bool calibrationValid() {
  if (!CALIBRATED || !isfinite(EC_GAIN) || !isfinite(EC_OFFSET) ||
      !isfinite(CAL_LOW_V) || !isfinite(CAL_HIGH_V) ||
      !isfinite(CAL_LOW_EC) || !isfinite(CAL_HIGH_EC) || !isfinite(EC_ALPHA)) return false;
  if (CAL_LOW_V<.15f || CAL_HIGH_V>2.3f || CAL_HIGH_V-CAL_LOW_V<.1f ||
      CAL_LOW_EC<=0 || CAL_HIGH_EC<=CAL_LOW_EC || CAL_HIGH_EC>2000 || EC_ALPHA<0 || EC_ALPHA>.04f) return false;
  if (EC_GAIN<=0) return false;
  return fabsf(EC_GAIN*curve(CAL_LOW_V)+EC_OFFSET-CAL_LOW_EC)<.1f &&
         fabsf(EC_GAIN*curve(CAL_HIGH_V)+EC_OFFSET-CAL_HIGH_EC)<.1f;
}

const char* calculateEC(float v, float t, uint32_t spread, float &ec) {
  ec=NAN;
  if (!SUPPLY_VALIDATED) return "supply_unvalidated";
  if (!PH_COEXISTENCE_VALIDATED) return "coexistence_unvalidated";
  if (!isfinite(t) || t<10 || t>35) return "temperature_out_of_scope";
  if (!isfinite(v) || v<.15f || v>2.3f) return "adc_out_of_scope";
  if (spread>40) return "unstable_adc";
  if (!CALIBRATED) return "uncalibrated";
  if (!TEMPERATURE_VALIDATED && fabsf(t-25.f)>.5f) return "temperature_compensation_unvalidated";
  if (!calibrationValid()) return "invalid_calibration";
  if (v<CAL_LOW_V || v>CAL_HIGH_V) return "outside_calibration_voltage";
  const float value=(EC_GAIN*curve(v)+EC_OFFSET)/(1+EC_ALPHA*(t-25));
  if (!isfinite(value) || value<CAL_LOW_EC-.01f || value>CAL_HIGH_EC+.01f) return "outside_calibration_ec";
  ec=value;
  return "estimated";
}

constexpr uint8_t ADS_ADDR=0x48;
bool adsWrite(uint8_t reg, uint16_t value) {
  Wire.beginTransmission(ADS_ADDR); Wire.write(reg);
  Wire.write(uint8_t(value>>8)); Wire.write(uint8_t(value));
  return Wire.endTransmission()==0;
}
bool adsRead(uint8_t reg, uint16_t &value) {
  Wire.beginTransmission(ADS_ADDR); Wire.write(reg);
  if (Wire.endTransmission(false)!=0) return false;
  if (Wire.requestFrom(ADS_ADDR,uint8_t(2))!=2) return false;
  value=(uint16_t(Wire.read())<<8)|uint16_t(Wire.read());
  return true;
}
bool readPHMillivolts(float &mv) {
  mv=NAN;
  // OS=start, MUX=AIN0/GND, PGA=+/-4.096V, single-shot, DR=16SPS, comparator off.
  constexpr uint16_t config=0x8000|(4<<12)|(1<<9)|(1<<8)|(1<<5)|3; // 0xC323
  if (!adsWrite(1,config)) return false;
  const uint32_t start=millis();
  bool done=false;
  while (millis()-start<150) {
    delay(5); uint16_t state=0;
    if (!adsRead(1,state)) return false;
    // Fail if the configuration does not match; do not silently read another channel.
    if ((state&0x7FFF)!=(config&0x7FFF)) return false;
    if (state&0x8000) { done=true; break; }
  }
  uint16_t raw=0;
  if (!done || !adsRead(0,raw)) return false;
  const int16_t code=int16_t(raw);
  if (code<=0 || code>=32767) return false;
  mv=code*0.125f; // +/-4.096V range; measured at AIN0 AFTER divider
  return true;
}

void setup() {
  digitalWrite(SENSOR_POWER_PIN,LOW); pinMode(SENSOR_POWER_PIN,OUTPUT); // start shared rail OFF
  digitalWrite(4,LOW); pinMode(4,OUTPUT); // BAT_EN OFF
  Wire.begin(5,6,100000);
  Wire.setTimeOut(50);
  Serial.begin(115200); // USB CDC must be enabled; UART0 TX conflicts with DS_PIN.
  pinMode(EC_PIN,INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(EC_PIN,ADC_11db);
  temperatureBus.begin();
  temperatureBus.setResolution(12);
  temperatureBus.setWaitForConversion(true);
  haveThermometer=temperatureBus.getDeviceCount()==1 && temperatureBus.getAddress(thermometer,0);
  snprintf(bootId,sizeof bootId,"%08lx%08lx",(unsigned long)esp_random(),(unsigned long)esp_random());
  // pH electrode remains connected via DFR0504. JP1 open; J9.2 no cable contact.
  // DFR0504 uses external regulated 5V; do NOT power it from TP5.
  // Operator enables external supply only after MCU/ADS1115 are powered.
  digitalWrite(SENSOR_POWER_PIN,HIGH); // existing boost/LDO supplies SEN0244 from TP5
  // Initial bench settling only; verify drift/stability before calibration.
  delay(60000);
}

void loop() {
  if (!haveThermometer) {
    temperatureBus.begin();
    temperatureBus.setResolution(12);
    haveThermometer=temperatureBus.getDeviceCount()==1 && temperatureBus.getAddress(thermometer,0);
  }
  float t=NAN;
  if (haveThermometer) {
    temperatureBus.requestTemperatures();
    const float sample=temperatureBus.getTempC(thermometer);
    if (sample!=DEVICE_DISCONNECTED_C && isfinite(sample) && sample>=10 && sample<=35) t=sample;
    else haveThermometer=false; // rescan after unplug/replacement; reject stale address
  }
  uint32_t samples[31];
  for (int i=0;i<31;++i) { samples[i]=analogReadMilliVolts(EC_PIN); delay(20); }
  for (int i=1;i<31;++i) {
    uint32_t v=samples[i]; int j=i-1;
    while(j>=0 && samples[j]>v) {samples[j+1]=samples[j];--j;}
    samples[j+1]=v;
  }
  const uint32_t mv=samples[15],spread=samples[27]-samples[3];
  float ec=NAN;
  const char* status=calculateEC(mv/1000.f,t,spread,ec);
  float phMv=NAN;
  const bool phAdcOk=readPHMillivolts(phMv);
  const PHCalibration phCal={PH_CALIBRATED,PH_SUPPLY_VALIDATED,PH_COEXISTENCE_VALIDATED,
    PH_ADC_MV_LOW,PH_VALUE_LOW,PH_ADC_MV_HIGH,PH_VALUE_HIGH,PH_CAL_TEMP_C};
  const PHResult phResult=phAdcOk ? evaluatePH(phMv,t,phCal) : PHResult{NAN,"adc_missing_or_fault"};
  Serial.printf("{\"schema\":\"aquanode.ecph.revC.v1\",\"event\":\"BENCH_SAMPLE\",\"node_id\":\"ecph-bench-01\",\"boot_id\":\"%s\",\"seq\":%lu,\"uptime_ms\":%lu,\"ec_mv\":%lu,\"adc_spread_mv\":%lu,\"temperature_c\":",bootId,(unsigned long)seq++,(unsigned long)millis(),(unsigned long)mv,(unsigned long)spread);
  if (isfinite(t)) Serial.print(t,3); else Serial.print("null");
  Serial.print(",\"ec25_estimated_us_cm\":");
  if (isfinite(ec)) Serial.print(ec,2); else Serial.print("null");
  Serial.print(",\"physical_validation\":false,\"measurement_kind\":\"experimental_ec_estimate\"");
  Serial.print(",\"ph_adc_mv\":");
  if (isfinite(phMv)) Serial.print(phMv,3); else Serial.print("null");
  Serial.print(",\"ph\":");
  if (isfinite(phResult.value)) Serial.print(phResult.value,3); else Serial.print("null");
  Serial.printf(",\"ph_status\":\"%s\",\"ph_calibration_id\":\"%s\"",phResult.status,PH_CAL_ID);
  Serial.printf(",\"ec_status\":\"%s\",\"calibration_id\":\"%s\"}\n",status,CAL_ID);
  delay(4000); // bench timing; not a low-power deployment scheduler
}
