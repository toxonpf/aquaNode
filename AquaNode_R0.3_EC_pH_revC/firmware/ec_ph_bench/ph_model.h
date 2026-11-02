#pragma once
#include <math.h>
struct PHCalibration {
  bool calibrated, supplyValidated, coexistenceValidated;
  float mvLow, phLow, mvHigh, phHigh, temperature;
};
struct PHResult { float value; const char* status; };
inline PHResult evaluatePH(float mv, float t, const PHCalibration &c) {
  if (!isfinite(mv) || mv<=0 || mv>2600) return {NAN,"adc_out_of_scope"};
  if (!c.supplyValidated) return {NAN,"supply_unvalidated"};
  if (!isfinite(t) || t<10 || t>35) return {NAN,"temperature_out_of_scope"};
  if (!c.calibrated) return {NAN,"uncalibrated"};
  if (!isfinite(c.mvLow) || !isfinite(c.mvHigh) || !isfinite(c.phLow) ||
      !isfinite(c.phHigh) || !isfinite(c.temperature) ||
      c.phLow<0 || c.phHigh>14 || c.phHigh-c.phLow<2 ||
      c.mvLow<=0 || c.mvLow>1600 || c.mvHigh<=0 || c.mvHigh>1600 ||
      c.mvLow-c.mvHigh<50 || c.temperature<10 || c.temperature>35)
    return {NAN,"invalid_calibration"};
  // No unverified temperature model: accept only close to actual calibration temperature.
  if (fabsf(t-c.temperature)>0.5f) return {NAN,"temperature_calibration_mismatch"};
  if (!c.coexistenceValidated) return {NAN,"coexistence_unvalidated"};
  if (mv<c.mvHigh || mv>c.mvLow) return {NAN,"outside_calibration_voltage"};
  const float ph=c.phLow+(mv-c.mvLow)*(c.phHigh-c.phLow)/(c.mvHigh-c.mvLow);
  if (!isfinite(ph) || ph<c.phLow || ph>c.phHigh) return {NAN,"outside_calibration_ph"};
  return {ph,"calibrated_bench"};
}
