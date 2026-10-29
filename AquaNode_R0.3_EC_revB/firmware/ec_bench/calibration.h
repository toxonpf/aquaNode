#pragma once
#include <math.h>
// Fill from REAL ec_model.py calibration output, never from test fixtures.
constexpr bool CALIBRATED = false;
constexpr char CAL_ID[] = "NOT_CALIBRATED";
constexpr float EC_GAIN = NAN;
constexpr float EC_OFFSET = NAN;
constexpr float CAL_LOW_V = NAN;
constexpr float CAL_HIGH_V = NAN;
constexpr float CAL_LOW_EC = NAN;
constexpr float CAL_HIGH_EC = NAN;
constexpr float EC_ALPHA = 0.02f;

// Manual acceptance flags: not live voltage sensing and not device certification.
constexpr bool SUPPLY_VALIDATED = false;
constexpr bool TEMPERATURE_VALIDATED = false;
