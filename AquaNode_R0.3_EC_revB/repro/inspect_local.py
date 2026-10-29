from pathlib import Path
import json,re,hashlib
from pypdf import PdfReader
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
def parse(s):
    stack=[];out=[]
    for t in re.findall(r'"(?:\\.|[^"\\])*"|[^\s()]+|[()]',s):
        if t=='(':
            a=[];(stack[-1] if stack else out).append(a);stack.append(a)
        elif t==')':stack.pop()
        else:stack[-1].append(json.loads(t) if t.startswith('"') else t)
    assert not stack
    return out[0]
def child(x,k):return next((v for v in x if isinstance(v,list) and v and v[0]==k),None)
def children(x,k):return [v for v in x if isinstance(v,list) and v and v[0]==k]
def blocks(s):
    d=0;q=False;e=False;a=0
    for i,c in enumerate(s):
        if q:
            if e:e=False
            elif c=='\\':e=True
            elif c=='"':q=False
        elif c=='"':q=True
        elif c=='(':
            if d==1:a=i
            d+=1
        elif c==')':
            d-=1
            if d==1:yield a,i+1,s[a:i+1]
if __name__=='__main__':
    records=[]
    for p in sorted(ROOT.rglob('*')):
        if not p.is_file() or '__pycache__' in str(p):continue
        b=p.read_bytes();kind='bytes hashed'
        if p.suffix in ['.json','.kicad_pro']:json.loads(b);kind='JSON parsed'
        elif p.suffix in ['.kicad_sch','.kicad_pcb','.kicad_sym','.kicad_mod','.net'] or p.name.endswith('lib-table'):parse(b.decode());kind='S-expression parsed, NOT ERC/DRC'
        elif p.suffix=='.pdf':
            r=PdfReader(p);kind=f'PDF {len(r.pages)} pages text extracted';print('PDF',p.name,(' '.join(x.extract_text() for x in r.pages))[:250])
        elif p.suffix=='.png':
            with Image.open(p) as im:im.verify()
            kind='PNG decoded'
        else:b.decode('utf8');kind='UTF8 decoded'
        records.append(dict(path=p.relative_to(ROOT).as_posix(),size=len(b),sha256=hashlib.sha256(b).hexdigest(),inspection=kind))
    Path('source_inventory.json').write_text(json.dumps(records,indent=2))
    for p in ROOT.glob('*.md'):
        print('\nDOCUMENT',p.name,'\n',p.read_text(encoding='utf8')[:5500])
    s=parse((ROOT/'cad/AquaNode.kicad_sch').read_text())
    print('SCHEMATIC TEXT', [x[1] for x in children(s,'text')])
    print('LAST SYMBOLS',[(child(x,'property')[2],child(x,'at')) for x in children(s,'symbol')][-10:])
