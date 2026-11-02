"""Create pH header from measured AIN0 millivolts (whole isolated chain)."""
import argparse, json, math, re
from pathlib import Path

def make_header(c):
    keys=['adc_mv_low','ph_low','adc_mv_high','ph_high','temperature_c']
    if not all(type(c.get(k)) in (int,float) and math.isfinite(c[k]) for k in keys):
        raise ValueError('Finite numeric measurements required')
    cid=c.get('cal_id','')
    if not isinstance(cid,str) or not re.fullmatch(r'[A-Za-z0-9_.:-]{1,64}',cid) or 'SYNTHETIC' in cid.upper():
        raise ValueError('Real calibration ID required; allowed A-Z a-z 0-9 _ . : -')
    if not (0<=c['ph_low']<c['ph_high']<=14 and c['ph_high']-c['ph_low']>=2):
        raise ValueError('Invalid buffer pH values')
    if not (0<c['adc_mv_high']<c['adc_mv_low']<=1600 and c['adc_mv_low']-c['adc_mv_high']>=50):
        raise ValueError('Expect decreasing AIN0 voltage with increasing pH; enter AFTER-divider mV')
    if not 10<=c['temperature_c']<=35:
        raise ValueError('Temperature outside bench scope')
    names=['PH_ADC_MV_LOW','PH_VALUE_LOW','PH_ADC_MV_HIGH','PH_VALUE_HIGH','PH_CAL_TEMP_C']
    result='#pragma once\n#include <math.h>\nconstexpr bool PH_CALIBRATED=true;\n'
    result+='constexpr char PH_CAL_ID[]='+json.dumps(cid)+';\n'
    for n,k in zip(names,keys):result+=f'constexpr float {n}={float(c[k]):.10e}f;\n'
    return result+'// Set only after documented power and simultaneous-probe acceptance.\nconstexpr bool PH_SUPPLY_VALIDATED=false;\nconstexpr bool PH_COEXISTENCE_VALIDATED=false;\n'

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('json');p.add_argument('--out',required=True);a=p.parse_args()
    header=make_header(json.loads(Path(a.json).read_text(encoding='utf8')))
    with Path(a.out).open('x',encoding='utf8') as f:f.write(header)
