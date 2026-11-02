#pragma once
#include <math.h>
// Raw pH ADC acquisition is ACTIVE regardless of these release flags.
// Generate from real complete-chain buffer readings with export_ph_calibration.py.
constexpr bool PH_CALIBRATED=false;
constexpr bool PH_SUPPLY_VALIDATED=false;
constexpr bool PH_COEXISTENCE_VALIDATED=false;
constexpr char PH_CAL_ID[]="NOT_CALIBRATED";
constexpr float PH_ADC_MV_LOW=NAN;
constexpr float PH_VALUE_LOW=NAN;
constexpr float PH_ADC_MV_HIGH=NAN;
constexpr float PH_VALUE_HIGH=NAN;
constexpr float PH_CAL_TEMP_C=NAN;
