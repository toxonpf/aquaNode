// AquaNode R0.3-EC-revB. Experimental freshwater EC estimate. MIT licence.
// R3 MUST BE REMOVED. SEN0244 analog signal -> J7.3 -> GPIO1.
// DS18B20 moved to GPIO43. USB CDC ONLY. No radio or pH measurement here.
#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <esp_system.h>
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

void setup() {
  digitalWrite(SENSOR_POWER_PIN,LOW); pinMode(SENSOR_POWER_PIN,OUTPUT); // start shared rail OFF
  digitalWrite(4,LOW); pinMode(4,OUTPUT); // BAT_EN OFF
  Serial.begin(115200); // USB CDC must be enabled; UART0 TX conflicts with DS_PIN.
  pinMode(EC_PIN,INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(EC_PIN,ADC_11db);
  temperatureBus.begin();
  temperatureBus.setResolution(12);
  temperatureBus.setWaitForConversion(true);
  haveThermometer=temperatureBus.getDeviceCount()==1 && temperatureBus.getAddress(thermometer,0);
  snprintf(bootId,sizeof bootId,"%08lx%08lx",(unsigned long)esp_random(),(unsigned long)esp_random());
  // J9 must be disconnected; pH electrode physically removed.
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
  Serial.printf("{\"schema\":\"aquanode.ec.revB.v1\",\"event\":\"BENCH_SAMPLE\",\"node_id\":\"ec-bench-01\",\"boot_id\":\"%s\",\"seq\":%lu,\"uptime_ms\":%lu,\"ec_mv\":%lu,\"adc_spread_mv\":%lu,\"temperature_c\":",bootId,(unsigned long)seq++,(unsigned long)millis(),(unsigned long)mv,(unsigned long)spread);
  if (isfinite(t)) Serial.print(t,3); else Serial.print("null");
  Serial.print(",\"ec25_estimated_us_cm\":");
  if (isfinite(ec)) Serial.print(ec,2); else Serial.print("null");
  Serial.print(",\"physical_validation\":false,\"measurement_kind\":\"experimental_ec_estimate\"");
  Serial.printf(",\"ec_status\":\"%s\",\"calibration_id\":\"%s\"}\n",status,CAL_ID);
  delay(4000); // bench timing; not a low-power deployment scheduler
}
