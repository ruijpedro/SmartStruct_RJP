import { useMemo, useState } from 'react'

type Tab = 'rc' | 'gravity' | 'gabions' | 'berlin' | 'techniques'

function Field({label,value,setValue,unit,step='0.1'}:{label:string,value:number,setValue:(v:number)=>void,unit:string,step?:string}){
  return <label>{label} ({unit})<input type="number" step={step} value={value} onChange={e=>setValue(Number(e.target.value))}/></label>
}
function Metric({name,value,status}:{name:string,value:string,status?:'ok'|'warn'|'bad'}){
  return <div className={`metric ${status?`metric--${status}`:''}`}><span>{name}</span><strong>{value}</strong></div>
}
function rankine(phi:number){const r=Math.max(0.1,phi)*Math.PI/180;return Math.tan(Math.PI/4-r/2)**2}

function WallSketch({type,H=4,B=3}:{type:'rc'|'gravity'|'gabions'|'berlin',H?:number,B?:number}){
  const h=Math.max(2,Math.min(8,H)); const b=Math.max(1.5,Math.min(6,B));
  const sy=175/h, sx=75/b;
  const baseY=215, topY=baseY-h*sy;
  return <svg viewBox="0 0 700 270" className="beamSvg" role="img" aria-label={type}>
    <line x1="35" y1={baseY} x2="665" y2={baseY} className="groundLine"/>
    {type==='rc'&&<><rect x="260" y={topY} width="48" height={baseY-topY} className="structFill"/><rect x={225} y={baseY-24} width={Math.max(180,b*sx)} height="24" className="structFill2"/><polygon points={`308,${topY+28} 625,${baseY} 308,${baseY}`} className="soilFill"/></>}
    {type==='gravity'&&<><polygon points={`230,${baseY} 315,${topY} 365,${topY} 455,${baseY}`} className="structFill"/><polygon points={`365,${topY+18} 625,${baseY} 455,${baseY}`} className="soilFill"/></>}
    {type==='gabions'&&<><rect x="220" y={baseY-48} width="240" height="48" className="gabion"/><rect x="250" y={baseY-96} width="190" height="48" className="gabion"/><rect x="285" y={baseY-144} width="145" height="48" className="gabion"/><polygon points={`430,${baseY-144} 625,${baseY} 460,${baseY}`} className="soilFill"/></>}
    {type==='berlin'&&<><line x1="250" y1={topY} x2="250" y2="238" className="pileLine"/><line x1="450" y1={topY} x2="450" y2="238" className="pileLine"/><rect x="250" y={topY+20} width="200" height="20" className="lagging"/><rect x="250" y={topY+58} width="200" height="20" className="lagging"/><rect x="250" y={topY+96} width="200" height="20" className="lagging"/><line x1="350" y1={topY+65} x2="565" y2={topY+25} className="anchorLine"/><polygon points={`565,${topY+25} 610,${topY+10} 575,${topY+42}`} className="anchorBulb"/><polygon points={`450,${topY} 650,${topY} 650,${baseY} 450,${baseY}`} className="soilFill"/></>}
    <text x="50" y="35">H = {H.toFixed(2)} m</text><text x="50" y="55">B = {B.toFixed(2)} m</text>
  </svg>
}

function RCWall(){
  const [H,setH]=useState(4),[B,setB]=useState(3.2),[toe,setToe]=useState(.8),[gamma,setGamma]=useState(19),[phi,setPhi]=useState(30),[q,setQ]=useState(10),[mu,setMu]=useState(.5)
  const r=useMemo(()=>{const Ka=rankine(phi);const Pa=.5*Ka*gamma*H*H+Ka*q*H;const W=24*(.3*H+.45*B)+gamma*Math.max(0,B-toe-.3)*H*.45;const Mr=W*B*.45;const Mo=Pa*H/3;const fsO=Mo>0?Mr/Mo:99;const fsS=Pa>0?mu*W/Pa:99;return{Ka,Pa,W,fsO,fsS}},[H,B,toe,gamma,phi,q,mu])
  return <ModuleLayout title="Muro de betão armado" sub="Consola · pré-dimensionamento e estabilidade externa" sketch={<WallSketch type="rc" H={H} B={B}/>} fields={<><Field label="Altura H" value={H} setValue={setH} unit="m"/><Field label="Base B" value={B} setValue={setB} unit="m"/><Field label="Ponta" value={toe} setValue={setToe} unit="m"/><Field label="γ solo" value={gamma} setValue={setGamma} unit="kN/m³"/><Field label="φ'" value={phi} setValue={setPhi} unit="°"/><Field label="Sobrecarga q" value={q} setValue={setQ} unit="kPa"/><Field label="μ base" value={mu} setValue={setMu} unit="-" step="0.05"/></>} results={<><Metric name="Ka" value={r.Ka.toFixed(3)}/><Metric name="Impulso ativo" value={`${r.Pa.toFixed(1)} kN/m`}/><Metric name="FS derrubamento" value={r.fsO.toFixed(2)} status={r.fsO>=1.5?'ok':r.fsO>=1.0?'warn':'bad'}/><Metric name="FS deslizamento" value={r.fsS.toFixed(2)} status={r.fsS>=1.5?'ok':r.fsS>=1.0?'warn':'bad'}/></>} note="Triagem preliminar. O dimensionamento estrutural EC2, capacidade de carga EC7, água, sismo e combinações devem ser verificados no cálculo final."/>
}
function GravityWall(){
 const [H,setH]=useState(3.5),[Bt,setBt]=useState(.5),[Bb,setBb]=useState(2.2),[gammaM,setGammaM]=useState(23),[gamma,setGamma]=useState(19),[phi,setPhi]=useState(32),[mu,setMu]=useState(.55)
 const r=useMemo(()=>{const Ka=rankine(phi),Pa=.5*Ka*gamma*H*H,W=((Bt+Bb)/2)*H*gammaM,fsS=mu*W/Math.max(.1,Pa),fsO=(W*Bb*.45)/(Math.max(.1,Pa)*H/3);return{Ka,Pa,W,fsS,fsO}},[H,Bt,Bb,gammaM,gamma,phi,mu])
 return <ModuleLayout title="Muro de gravidade" sub="Betão simples / alvenaria / pedra" sketch={<WallSketch type="gravity" H={H} B={Bb}/>} fields={<><Field label="Altura H" value={H} setValue={setH} unit="m"/><Field label="Esp. topo" value={Bt} setValue={setBt} unit="m"/><Field label="Largura base" value={Bb} setValue={setBb} unit="m"/><Field label="γ muro" value={gammaM} setValue={setGammaM} unit="kN/m³"/><Field label="γ solo" value={gamma} setValue={setGamma} unit="kN/m³"/><Field label="φ'" value={phi} setValue={setPhi} unit="°"/><Field label="μ" value={mu} setValue={setMu} unit="-" step="0.05"/></>} results={<><Metric name="Peso próprio" value={`${r.W.toFixed(1)} kN/m`}/><Metric name="Impulso" value={`${r.Pa.toFixed(1)} kN/m`}/><Metric name="FS derrubamento" value={r.fsO.toFixed(2)} status={r.fsO>=1.5?'ok':'warn'}/><Metric name="FS deslizamento" value={r.fsS.toFixed(2)} status={r.fsS>=1.5?'ok':'warn'}/></>} note="Modelo simplificado por metro linear. A posição real do centro de gravidade e a geometria deverão ser refinadas no projeto."/>
}
function Gabions(){
 const [H,setH]=useState(3),[B,setB]=useState(2.5),[gammaG,setGammaG]=useState(20),[gamma,setGamma]=useState(18),[phi,setPhi]=useState(30),[mu,setMu]=useState(.6)
 const r=useMemo(()=>{const Ka=rankine(phi),Pa=.5*Ka*gamma*H*H,W=.75*B*H*gammaG,fsS=mu*W/Math.max(.1,Pa),fsO=(W*B*.42)/(Math.max(.1,Pa)*H/3);return{Ka,Pa,W,fsS,fsO,vol:.75*B*H}},[H,B,gammaG,gamma,phi,mu])
 return <ModuleLayout title="Muros de gabiões" sub="Geometria escalonada · estabilidade externa" sketch={<WallSketch type="gabions" H={H} B={B}/>} fields={<><Field label="Altura H" value={H} setValue={setH} unit="m"/><Field label="Base equivalente" value={B} setValue={setB} unit="m"/><Field label="γ gabião" value={gammaG} setValue={setGammaG} unit="kN/m³"/><Field label="γ solo" value={gamma} setValue={setGamma} unit="kN/m³"/><Field label="φ'" value={phi} setValue={setPhi} unit="°"/><Field label="μ" value={mu} setValue={setMu} unit="-" step="0.05"/></>} results={<><Metric name="Volume indicativo" value={`${r.vol.toFixed(2)} m³/m`}/><Metric name="Peso" value={`${r.W.toFixed(1)} kN/m`}/><Metric name="FS derrubamento" value={r.fsO.toFixed(2)} status={r.fsO>=1.5?'ok':'warn'}/><Metric name="FS deslizamento" value={r.fsS.toFixed(2)} status={r.fsS>=1.5?'ok':'warn'}/></>} note="Pré-dimensionamento. Verificar deformabilidade, fundação, erosão, drenagem, malhas e durabilidade das caixas."/>
}
function BerlinWall(){
 const [H,setH]=useState(5),[spacing,setSpacing]=useState(2.5),[phi,setPhi]=useState(30),[gamma,setGamma]=useState(19),[q,setQ]=useState(10),[anchors,setAnchors]=useState(1)
 const r=useMemo(()=>{const Ka=rankine(phi),pmax=Ka*(gamma*H+q),Pa=.5*Ka*gamma*H*H+Ka*q*H,lineLoad=Pa*spacing,perAnchor=lineLoad/Math.max(1,anchors);return{Ka,pmax,Pa,lineLoad,perAnchor}},[H,spacing,phi,gamma,q,anchors])
 return <ModuleLayout title="Muro de Berlim" sub="Perfis verticais + pranchamento · contenção provisória/permanente" sketch={<WallSketch type="berlin" H={H} B={spacing}/>} fields={<><Field label="Escavação H" value={H} setValue={setH} unit="m"/><Field label="Espaçamento perfis" value={spacing} setValue={setSpacing} unit="m"/><Field label="γ solo" value={gamma} setValue={setGamma} unit="kN/m³"/><Field label="φ'" value={phi} setValue={setPhi} unit="°"/><Field label="Sobrecarga" value={q} setValue={setQ} unit="kPa"/><Field label="Níveis ancorados" value={anchors} setValue={setAnchors} unit="un" step="1"/></>} results={<><Metric name="p máx. Rankine" value={`${r.pmax.toFixed(1)} kPa`}/><Metric name="Impulso total" value={`${r.Pa.toFixed(1)} kN/m`}/><Metric name="Carga/perfil" value={`${r.lineLoad.toFixed(1)} kN`}/><Metric name="Carga média/nível" value={`${r.perAnchor.toFixed(1)} kN`}/></>} note="Modelo preliminar. A contenção faseada requer diagrama aparente de pressões adequado, verificação dos perfis, encastramento, pranchamento, ancoragens/escoras e movimentos do terreno."/>
}
function Techniques(){
 const cards=[
  ['Solo pregado','Pregagens passivas, malha, face em betão projetado e drenagem.'],['Ancoragens','Tirantes ativos/provisórios/permanentes, comprimento livre e selagem.'],['Betão projetado','Via seca/húmida, fibras, malha e espessura de revestimento.'],['Cortinas de estacas','Estacas tangentes, secantes ou espaçadas, ancoradas ou escoradas.'],['Paredes moldadas','Painéis de betão armado com elevada rigidez para escavações profundas.'],['Terra reforçada','Geogrelhas/geotêxteis e face modular ou vegetada.'],['Drenagem','Barbacãs, drenos sub-horizontais, máscaras drenantes e geocompostos.'],['Redes e proteção','Redes metálicas, barreiras, enrocamentos e proteção superficial.']
 ]
 return <div className="techGrid">{cards.map(([t,b])=><section className="panel techCard" key={t}><h3>{t}</h3><p>{b}</p><button className="ghostButton">Preparado para cálculo dedicado</button></section>)}</div>
}
function ModuleLayout({title,sub,sketch,fields,results,note}:{title:string,sub:string,sketch:React.ReactNode,fields:React.ReactNode,results:React.ReactNode,note:string}){
 return <div className="containmentModule"><div className="workspace"><section className="panel editorPanel">{sketch}<div className="formGrid">{fields}</div></section><aside className="panel resultPanel"><div className="panelTitle">Resultados preliminares</div>{results}<p className="note">{note}</p></aside></div></div>
}

export function ContainmentPage(){
 const [tab,setTab]=useState<Tab>('rc')
 const tabs:[Tab,string][]=[['rc','Betão armado'],['gravity','Gravidade'],['gabions','Gabiões'],['berlin','Berlim'],['techniques','Outras técnicas']]
 return <div className="page"><div className="pageTitle"><h1>Contenção</h1><span>Muros e técnicas de estabilização</span></div><div className="tabs containmentTabs">{tabs.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>{tab==='rc'&&<RCWall/>}{tab==='gravity'&&<GravityWall/>}{tab==='gabions'&&<Gabions/>}{tab==='berlin'&&<BerlinWall/>}{tab==='techniques'&&<Techniques/>}</div>
}
