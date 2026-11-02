// Synthetic software tests of the SAME pH model compiled into the ESP32 firmware.
// These coefficients must never be used as hardware calibration.
#include "../firmware/ec_ph_bench/ph_model.h"
#include <assert.h>
#include <string.h>
#include <stdio.h>
int main() {
  const PHCalibration good={true,true,true,1000,4,700,7,25};
  assert(fabsf(evaluatePH(1000,25,good).value-4)<0.0001f);
  assert(fabsf(evaluatePH(700,25,good).value-7)<0.0001f);
  assert(fabsf(evaluatePH(850,25,good).value-5.5f)<0.0001f);
  assert(isnan(evaluatePH(600,25,good).value)); // no extrapolation
  assert(isnan(evaluatePH(1100,25,good).value));
  assert(isnan(evaluatePH(NAN,25,good).value));
  assert(isnan(evaluatePH(850,NAN,good).value));
  assert(isnan(evaluatePH(850,26,good).value)); // no unverified compensation
  assert(isnan(evaluatePH(850,-127,good).value));
  auto c=good;c.calibrated=false;assert(isnan(evaluatePH(850,25,c).value));
  c=good;c.supplyValidated=false;assert(isnan(evaluatePH(850,25,c).value));
  c=good;c.coexistenceValidated=false;assert(isnan(evaluatePH(850,25,c).value));
  c=good;c.mvHigh=c.mvLow;assert(isnan(evaluatePH(850,25,c).value));
  c=good;c.mvLow=NAN;assert(isnan(evaluatePH(850,25,c).value));
  c=good;c.phHigh=15;assert(isnan(evaluatePH(850,25,c).value));
  puts("PASS: 15 pH model assertions; synthetic inputs only, no hardware test.");
}
