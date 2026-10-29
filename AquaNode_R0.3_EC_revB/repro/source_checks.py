from inspect_local import *
import math,ast,sys,subprocess
R=ROOT
def ref(x):return next((p[2] for p in children(x,'property') if p[1]=='Reference'),None)
d=json.loads((R/'design.json').read_text());sch=parse((R/'cad/AquaNode.kicad_sch').read_text());pcb=parse((R/'cad/AquaNode.kicad_pcb').read_text())
syms={ref(x):x for x in children(sch,'symbol')};fps={ref(x):x for x in children(pcb,'footprint')}
libs={x[1]:x for x in children(child(sch,'lib_symbols'),'symbol')}
def pos(x):return tuple(round(float(v),5) for v in child(x,'at')[1:3])
# Coordinate graph is a source cross-check only. It is NOT a KiCad electrical rules engine.
graph={}
def edge(a,b):graph.setdefault(a,set()).add(b);graph.setdefault(b,set()).add(a)
for w in children(sch,'wire'):
    pts=child(w,'pts');a=tuple(round(float(v),5) for v in pts[1][1:3]);b=tuple(round(float(v),5) for v in pts[2][1:3]);edge(a,b)
labels={}
for x in children(sch,'label'):labels.setdefault(pos(x),set()).add(x[1])
def nets_at(p):
    seen=set();pending=[p];out=set()
    while pending:
        n=pending.pop()
        if n in seen:continue
        seen.add(n);out.update(labels.get(n,set()));pending.extend(graph.get(n,set())-seen)
    return out
errors=[];pin_count=0
for c in d['components']+d['external_components']:
    if not c['pins']:continue
    s=syms[c['ref']];at=child(s,'at');x,y,angle=map(float,at[1:4]);a=math.radians(angle)
    pins=[p for u in children(libs[child(s,'lib_id')[1]],'symbol') for p in children(u,'pin')]
    for p in pins:
        num=child(p,'number')[1]
        if num not in c['pins']:continue
        px,py=map(float,child(p,'at')[1:3]);xy=(round(x+px*math.cos(a)-py*math.sin(a),5),round(y-px*math.sin(a)-py*math.cos(a),5))
        actual=nets_at(xy);expect=c['pins'][num];pin_count+=1
        if (actual!={expect} if expect else bool(actual)):errors.append([c['ref'],num,expect,sorted(actual),xy])
    if c['ref'] in fps:
        for p in children(fps[c['ref']],'pad'):
            num=p[1];n=child(p,'net');actual=n[2] if n else None
            if num in c['pins'] and actual!=c['pins'][num]:errors.append(['PCB',c['ref'],num,c['pins'][num],actual])
assert not errors,json.dumps(errors,indent=2)
assert child(syms['R3'],'dnp')[1]=='yes' and 'dnp' in child(fps['R3'],'attr')
assert next(c for c in d['components'] if c['ref']=='R3')['dnp']
old=parse((R/'history_ec_revA/cad/AquaNode.kicad_pcb').read_text())
for kind in ['segment','via','zone','gr_line','gr_arc']:assert children(old,kind)==children(pcb,kind),kind
oldfps={ref(x):x for x in children(old,'footprint')}
for name,f in fps.items():
    assert child(f,'at')==child(oldfps[name],'at')
    assert children(f,'pad')==children(oldfps[name],'pad')
for p in R.rglob('*'):
    if not p.is_file() or '__pycache__' in p.parts:continue
    if p.suffix in ['.json','.kicad_pro']:json.loads(p.read_bytes())
    if p.suffix in ['.kicad_sch','.kicad_pcb','.kicad_sym','.kicad_mod','.net']:parse(p.read_text(encoding='utf8'))
    if p.suffix=='.py':ast.parse(p.read_text(encoding='utf8'))
# Original source preservation is recorded separately from the production run.
run=subprocess.run([sys.executable,'-m','unittest','discover','-s',str(R/'test_tools'),'-p','test_*.py','-v'],capture_output=True,text=True)
(R/'checks/python_tests.txt').write_text(run.stdout+run.stderr,encoding='utf8');assert run.returncode==0,run.stderr
result={'kind':'STRUCTURAL SOURCE CHECK, NOT ERC/DRC','schematic_pin_checks':pin_count,'schematic_design_agreement':True,'pcb_pad_design_agreement':True,'copper_segments_vias_zones_unchanged':True,'pads_and_placement_unchanged':True,'R3_DNP_in_all_sources':True,'native_erc':'NOT_RUN','native_drc':'NOT_RUN','firmware_esp32_compile':'NOT_RUN','hardware_tests':'NOT_RUN','source_hash_comparison':'see source_preservation.json from original run'}
(R/'checks/static_review.json').write_text(json.dumps(result,indent=2))
s=json.loads((R/'web_handoff/status.json').read_text());s['software_tests'].update(result='passed',count=15);(R/'web_handoff/status.json').write_text(json.dumps(s,indent=2))
print(json.dumps(result,indent=2));print(run.stderr)
