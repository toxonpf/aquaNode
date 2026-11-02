"""Experimental SEN0244 EC estimate, not a certified EC/salinity measurement."""
import argparse
import json
import math
import re


def finite(*values):
    return all(isinstance(v, (float, int)) and not isinstance(v, bool) and math.isfinite(v) for v in values)


def curve(volts):
    return 133.42 * volts ** 3 - 255.86 * volts ** 2 + 857.39 * volts


def calibrate(low_v, low_ec, high_v, high_ec, low_t=25., high_t=25., cal_id=''):
    if not finite(low_v, low_ec, high_v, high_ec, low_t, high_t):
        raise ValueError('calibration values must be finite numbers')
    if not (.15 <= low_v < high_v <= 2.3 and high_v-low_v >= .1):
        raise ValueError('voltage points must be 150..2300 mV, increasing, >=100 mV apart')
    if not (0 < low_ec < high_ec <= 2000):
        raise ValueError('EC standards must increase within 0..2000 uS/cm')
    if abs(low_t-25) > .5 or abs(high_t-25) > .5:
        raise ValueError('calibrate at 25 +/-0.5 C, using standard temperature tables')
    if not isinstance(cal_id, str) or not re.fullmatch(r'[A-Za-z0-9_.-]{1,64}',cal_id):
        raise ValueError('unique nonempty calibration ID required')
    gain = (high_ec-low_ec)/(curve(high_v)-curve(low_v))
    offset = low_ec-gain*curve(low_v)
    return dict(schema='aquanode.ec.cal.v1', cal_id=cal_id, gain=gain, offset=offset,
                low_v=low_v, high_v=high_v, low_ec=low_ec, high_ec=high_ec,
                low_t=low_t, high_t=high_t, alpha=.02, independently_validated=False, temperature_validated=False)


def validate_calibration(cal):
    if not isinstance(cal, dict) or cal.get('schema') != 'aquanode.ec.cal.v1':
        raise ValueError('invalid calibration schema')
    try:
        expected=calibrate(cal['low_v'],cal['low_ec'],cal['high_v'],cal['high_ec'],cal['low_t'],cal['high_t'],cal['cal_id'])
        if not finite(cal['gain'],cal['offset'],cal['alpha']) or not 0 <= cal['alpha'] <= .04:
            raise ValueError('invalid coefficients')
        if not math.isclose(cal['gain'],expected['gain'],rel_tol=1e-8) or not math.isclose(cal['offset'],expected['offset'],abs_tol=1e-6):
            raise ValueError('coefficients do not match calibration points')
    except (KeyError,TypeError) as exc:
        raise ValueError('incomplete calibration') from exc


def estimate(volts, temperature, cal=None, spread_mv=0, supply_validated=False):
    result={'ec25_estimated_us_cm':None, 'status':'uncalibrated'}
    if supply_validated is not True:
        return {**result,'status':'supply_unvalidated'}
    if not finite(volts,temperature,spread_mv):
        return {**result,'status':'invalid_input'}
    if not 10 <= temperature <= 35:
        return {**result,'status':'temperature_out_of_scope'}
    if not .15 <= volts <= 2.3:
        return {**result,'status':'adc_out_of_scope'}
    if not 0 <= spread_mv <= 40:
        return {**result,'status':'unstable_adc'}
    if cal is None:return result
    try:validate_calibration(cal)
    except ValueError:return {**result,'status':'invalid_calibration'}
    if cal.get('temperature_validated') is not True and abs(temperature-25)>.5:
        return {**result,'status':'temperature_compensation_unvalidated'}
    if not cal['low_v'] <= volts <= cal['high_v']:
        return {**result,'status':'outside_calibration_voltage'}
    ec=(cal['gain']*curve(volts)+cal['offset'])/(1+cal['alpha']*(temperature-25))
    if not cal['low_ec']-1e-6 <= ec <= cal['high_ec']+1e-6:
        return {**result,'status':'outside_calibration_ec'}
    return {'ec25_estimated_us_cm':ec,'status':'estimated','cal_id':cal['cal_id']}


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    for n in ['low-v','low-ec','high-v','high-ec']:p.add_argument('--'+n,type=float,required=True)
    p.add_argument('--low-t',type=float,default=25)
    p.add_argument('--high-t',type=float,default=25)
    p.add_argument('--cal-id',required=True)
    a=p.parse_args()
    print(json.dumps(calibrate(a.low_v,a.low_ec,a.high_v,a.high_ec,a.low_t,a.high_t,a.cal_id),indent=2,allow_nan=False))
