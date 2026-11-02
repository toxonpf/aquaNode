"""Read actual schematic wires/pin positions and PCB pads; not native ERC/DRC."""
from inspect_local import ROOT, parse, child, children
import json, math, zipfile, hashlib

def ref(x):return next((p[2] for p in children(x,'property') if p[1]=='Reference'),None)
def pos(x):return tuple(round(float(v),5) for v in child(x,'at')[1:3])
d=json.loads((ROOT/'design.json').read_text())
s=parse((ROOT/'cad/AquaNode.kicad_sch').read_text());p=parse((ROOT/'cad/AquaNode.kicad_pcb').read_text())
syms={ref(x):x for x in children(s,'symbol')};fps={ref(x):x for x in children(p,'footprint')}
libs={x[1]:x for x in children(child(s,'lib_symbols'),'symbol')}
graph={};labels={}
for w in children(s,'wire'):
    pts=child(w,'pts');a=tuple(round(float(v),5) for v in pts[1][1:3]);b=tuple(round(float(v),5) for v in pts[2][1:3])
    graph.setdefault(a,set()).add(b);graph.setdefault(b,set()).add(a)
for x in children(s,'label'):labels.setdefault(pos(x),set()).add(x[1])
def nets_at(pt):
    seen=set();pending=[pt];out=set()
    while pending:
        n=pending.pop()
        if n in seen:continue
        seen.add(n);out.update(labels.get(n,set()));pending.extend(graph.get(n,set())-seen)
    return out
errors=[];pins=[];pads=0
for c in d['components']+d['external_components']:
    if not c['pins']:continue
    symbol=syms[c['ref']];at=child(symbol,'at');x,y,angle=map(float,at[1:4]);a=math.radians(angle)
    ps=[pin for u in children(libs[child(symbol,'lib_id')[1]],'symbol') for pin in children(u,'pin')]
    found=set()
    for pin in ps:
        num=child(pin,'number')[1];found.add(num)
        px,py=map(float,child(pin,'at')[1:3]);xy=(round(x+px*math.cos(a)-py*math.sin(a),5),round(y-px*math.sin(a)-py*math.cos(a),5))
        actual=nets_at(xy);expect=c['pins'].get(num)
        if num not in c['pins'] or (actual!={expect} if expect else bool(actual)):
            errors.append([c['ref'],num,expect,sorted(actual)])
        pins.append({'reference':c['ref'],'pin':num,'net':expect,'xy':xy,'actual_labels':sorted(actual)})
    if found!=set(c['pins']):errors.append(['missing_or_extra_pins',c['ref']])
    if c['ref'] in fps:
        for pad in children(fps[c['ref']],'pad'):
            if not pad[1]:continue
            net=child(pad,'net');actual=net[2] if net else None;pads+=1
            if actual!=c['pins'].get(pad[1]):errors.append(['PCB',c['ref'],pad[1],actual,c['pins'].get(pad[1])])
assert not errors,json.dumps(errors,indent=2)
b={c['ref']:c for c in d['components']+d['external_components']}
assert b['R3']['dnp'] and child(syms['R3'],'dnp')[1]=='yes' and 'dnp' in child(fps['R3'],'attr')
assert b['M3']['pins']=={'1':'PH_ISO_GND','2':'PH_ISO_5V','3':'PH_ISO_OUT'}
assert b['M4']['pins']=={'1':'GND','2':'PH_EXT_5V','3':'PH_OUT','4':'PH_ISO_GND','5':'PH_ISO_5V','6':'PH_ISO_OUT'}
assert b['J9']['pins']=={'1':'GND','2':'PH_SUPPLY','3':'PH_OUT'}
assert b['U1']['pins']['4']=='ADC_PH' and b['U1']['pins']['6']==b['U1']['pins']['7']=='GND'
assert b['R9']['pins']=={'1':'PH_OUT','2':'PH_DIV'} and b['R10']['pins']=={'1':'PH_DIV','2':'GND'}
assert b['R15']['pins']=={'1':'PH_DIV','2':'ADC_PH'}
assert b['J1']['pins']['5']=='I2C_SDA' and b['J1']['pins']['6']=='I2C_SCL'
isolated={'PH_ISO_GND','PH_ISO_5V','PH_ISO_OUT'}
assert all(c['ref'] in ('M3','M4') for c in d['components']+d['external_components'] if isolated & set(c['pins'].values()))
with zipfile.ZipFile(ROOT/'history/original_revB.zip') as z:
    old=parse(z.read('AquaNode_R0.3_EC_revB/cad/AquaNode.kicad_pcb').decode())
    oldfps={ref(x):x for x in children(old,'footprint')}
    for kind in ('segment','via','zone','gr_line','gr_arc'):assert children(old,kind)==children(p,kind),kind
    for name,f in fps.items():
        assert child(f,'at')==child(oldfps[name],'at')
        assert children(f,'pad')==children(oldfps[name],'pad')
# Divider worst case with 0.1% resistors; never mistake PGA range for input supply tolerance.
ratio_max=(49900*1.001)/(49900*.999+49900*1.001)
max_adc=5.1*ratio_max
assert max_adc<3.3
result={'scope':'source connectivity verification, NOT native ERC/DRC or hardware testing',
 'schematic_pins_checked':len(pins),'pcb_pads_checked':pads,'schematic_design_agreement':True,
 'pcb_design_agreement':True,'carrier_copper_and_pad_placement_unchanged_from_revB':True,
 'pH_isolated_nets_separate_in_source':True,'R3_DNP':True,
 'maximum_pH_ADC_V_assuming_5V1_isolator_output':max_adc,
 'JP1_and_J9_2_harness_omission':'assembly instruction; cannot verify physical wiring remotely',
 'native_erc':'NOT_RUN','native_drc':'NOT_RUN','hardware_tests':'NOT_RUN',
 'limitations':['coordinate graph checks wire endpoints and labels; not KiCad native connectivity engine',
 'no footprint/datasheet audit of every inherited component','power and shutdown transients unmeasured']}
(ROOT/'checks/connection_check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'checks/pin_by_pin.json').write_text(json.dumps(pins,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2))
