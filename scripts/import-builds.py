"""Importação conservadora dos trackers originais. Requer beautifulsoup4."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,re,subprocess,hashlib
root=Path(__file__).resolve().parents[1]
meta=[('MRaaj','mraaj',"M'Raaj Presa-Doce",'Khajiit','Templar','Paladino da Luz · DPS','Solo / aprendizado','Espada de duas mãos','Stamina'),('DarZak','darzak',"Dar'Zak",'Khajiit','Nightblade','Assassino · DPS','PvP','Duas adagas','Stamina'),('Krazir','krazir',"Kra'zir",'Khajiit','Warden','Arqueiro / Healer','PvE','Arco','Magicka'),('BroSchita','broschita',"Bro'Schita",'Khajiit','Dragonknight','Tank','PvE','Espada e escudo','Health'),('Nefasto','nefasto','Nefasto','Dunmer','Nightblade','Vampiro Assassino','PvE + caminho para PvP','Duas adagas','Stamina')]
characters=[];builds=[]
for prefix,cid,name,race,cls,role,content,weapons,attribute in meta:
 p=next((root/'originals').glob(prefix+'*.html')); raw=p.read_text();s=BeautifulSoup(raw,'html.parser');skills=[]
 m=re.search(r'const skillDefs\s*=\s*(\[.*?\])\s*(?:;|\n)',raw,re.S)
 if m:
  skills=json.loads(subprocess.check_output(['node','-e','const vm=require("node:vm");let x="";process.stdin.on("data",d=>x+=d);process.stdin.on("end",()=>console.log(JSON.stringify(vm.runInNewContext(x,{}, {timeout:500}))));'],input=m.group(1).encode()))
 else:
  for el in s.select('.skill'):
   if el.select_one('input[type=checkbox]'):
    skills.append({'id':'skill-'+str(len(skills)+1),'name':el.b.get_text(' ',strip=True),'line':el.small.get_text(' ',strip=True) if el.small else '', 'why':el.p.get_text(' ',strip=True) if el.p else ''})
 tasks=[]
 for el in s.select('.task'):
  if el.select_one('input[type=checkbox]'):
   label=el.find(['b','strong']);name_=label.get_text(' ',strip=True) if label else el.get_text(' ',strip=True)
   full=el.get_text(' ',strip=True);tasks.append({'id':'goal-'+str(len(tasks)+1),'name':name_,'line':'Objetivo','why':full[len(name_):].strip()})
 sections=[]
 for sec in s.select('section'):
  h=sec.find('h2')
  if not h:continue
  title=h.get_text(' ',strip=True)
  if title in ['Seu progresso','Painel','O que fazer AGORA','Minha barra / skills que peguei','Níveis 1–50'] or title.startswith('Skills') or title.startswith('Marcos'):continue
  h.extract()
  for el in sec.select('input,button,select,script,.level,.row'):el.decompose()
  for el in sec.select('label'):el.decompose()
  for el in sec.find_all(True):el.attrs={}
  sections.append({'title':title,'html':sec.decode_contents()})
 tips=re.findall(r"tips\.push\('(<div.*?</div>)'\)",raw)
 tips=[x.replace("\\'","'") for x in tips if 'Todas as skills' not in x]
 if cid=='nefasto':
  tips += ['<p>'+x+'</p>' for x in re.findall(r'\?"([^"]+)"',re.search(r'now.innerHTML=.*?;',raw).group(0))]
  tips.append('<p>Nível 50: agora separe uma configuração PvE e outra PvP. Não invista pesado em gear definitivo antes do CP160.</p>')
 if cid=='broschita':tips.append('<p>Comece equipando espada + escudo. Assim que Puncture aparecer, pegue a habilidade.</p>')
 if tips:sections.insert(0,{'title':'Orientações da ficha original','html':'\n'.join(tips)})
 b={'id':cid+'-v1','characterId':cid,'version':1,'source':p.name,'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'attribute':attribute,'sections':sections,'skills':skills,'goals':tasks,'pending':['Mundus','Alimentação','Sets e equipamento definitivo','Champion Points'],'checklistIds':[x['id'] for x in skills+tasks]}
 builds.append(b);characters.append({'id':cid,'name':name,'race':race,'class':cls,'role':role,'content':content,'weapons':weapons,'buildId':b['id'],'public':True,'archived':False})
(root/'public/data/seed.json').write_text(json.dumps({'characters':characters,'builds':builds},ensure_ascii=False,indent=2))
print('Importados',len(builds),'builds,',sum(len(b['checklistIds']) for b in builds),'itens; sem execução dos scripts originais.')
