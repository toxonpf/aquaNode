"""Generate a firmware header from real calibration JSON; never use synthetic fixtures."""
import argparse,json
from pathlib import Path
from ec_model import validate_calibration

def make_header(cal):
    validate_calibration(cal)
    if 'SYNTHETIC' in cal['cal_id'].upper():
        raise ValueError('Synthetic calibration must not be exported to firmware')
    keys={'EC_GAIN':'gain','EC_OFFSET':'offset','CAL_LOW_V':'low_v','CAL_HIGH_V':'high_v','CAL_LOW_EC':'low_ec','CAL_HIGH_EC':'high_ec','EC_ALPHA':'alpha'}
    text='#pragma once\n#include <math.h>\n// Generated from operator-supplied calibration; not physical validation.\nconstexpr bool CALIBRATED = true;\nconstexpr char CAL_ID[] = '+json.dumps(cal['cal_id'])+';\n'
    for name,key in keys.items():text+=f'constexpr float {name} = {float(cal[key]):.10e}f;\n'
    return text+'// Set only after documented power and temperature acceptance.\nconstexpr bool SUPPLY_VALIDATED = false;\nconstexpr bool TEMPERATURE_VALIDATED = false;\n'

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('json');p.add_argument('--out',required=True);a=p.parse_args()
    header=make_header(json.loads(Path(a.json).read_text(encoding='utf8')))
    with Path(a.out).open('x',encoding='utf8') as f:f.write(header)
