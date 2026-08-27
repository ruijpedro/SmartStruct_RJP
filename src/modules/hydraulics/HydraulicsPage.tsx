import React,{useMemo,useState} from 'react'
type Tab='supply'|'sewer'|'storm'|'general'
const F=({l,v,s,u}:{l:string,v:number,s:(v:number)=>void,u:string})=><label className="compact-field"><span>{l}</span><div><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/><em>{u}</em></div></label>
export default function HydraulicsPage(){
 const[tab,setTab]=useState<Tab>('supply')
 return <div className="module-page"><div className="module-head"><div><h2>Hidráulica</h2><p>Abastecimento · águas residuais · pluviais · hidráulica geral.</p></div></div>
 <nav className="hyd-tabs">{([['supply','Abastecimento'],['sewer','Esgotos'],['storm','Pluviais'],['general','Geral']] as const).map(([k,l])=><button className={tab===k?'active':''} onClick={()=>setTab(k)} key={k}>{l}</button>)}</nav>
 {tab==='supply'&&<Supply/>}{tab==='sewer'&&<Sewer/>}{tab==='storm'&&<Storm/>}{tab==='general'&&<General/>}
 </div>
}
function Supply(){
 const[Q,setQ]=useState(2),[D,setD]=useState(50),[L,setL]=useState(30),[C,setC]=useState(130)
 const d=D/1000,q=Q/1000,A=Math.PI*d*d/4,v=q/A
 const hf=10.67*L*Math.pow(Math.max(q,1e-12),1.852)/(Math.pow(Math.max(C,1),1.852)*Math.pow(Math.max(d,1e-6),4.87))
 return <Calc title="Abastecimento — conduta em pressão"><F l="Caudal Q" v={Q} s={setQ} u="L/s"/><F l="Diâmetro interior" v={D} s={setD} u="mm"/><F l="Comprimento" v={L} s={setL} u="m"/><F l="Coef. Hazen-Williams C" v={C} s={setC} u="-"/><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/><R l="Perda de carga" v={`${hf.toFixed(2)} m`}/></Calc>
}
function Sewer(){
 const[D,setD]=useState(200),[S,setS]=useState(1),[n,setN]=useState(.013)
 const d=D/1000,A=Math.PI*d*d/4,Rh=d/4,sl=S/100,Q=(1/n)*A*Math.pow(Rh,2/3)*Math.sqrt(sl),v=Q/A
 return <Calc title="Esgotos — Manning, secção circular cheia"><F l="Diâmetro" v={D} s={setD} u="mm"/><F l="Inclinação" v={S} s={setS} u="%"/><F l="Manning n" v={n} s={setN} u="-"/><R l="Capacidade" v={`${(Q*1000).toFixed(2)} L/s`}/><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/></Calc>
}
function Storm(){
 const[C,setC]=useState(.9),[I,setI]=useState(100),[A,setA]=useState(500)
 const q=C*I*A/3600
 return <Calc title="Pluviais — método racional"><F l="Coef. escoamento C" v={C} s={setC} u="-"/><F l="Intensidade i" v={I} s={setI} u="mm/h"/><F l="Área" v={A} s={setA} u="m²"/><R l="Caudal de ponta" v={`${q.toFixed(2)} L/s`}/></Calc>
}
function General(){
 const[Q,setQ]=useState(10),[D,setD]=useState(100),[nu,setNu]=useState(1.004)
 const d=D/1000,q=Q/1000,A=Math.PI*d*d/4,v=q/A,Re=v*d/(nu*1e-6)
 return <Calc title="Hidráulica geral"><F l="Caudal" v={Q} s={setQ} u="L/s"/><F l="Diâmetro" v={D} s={setD} u="mm"/><F l="Viscosidade cinemática" v={nu} s={setNu} u="mm²/s"/><R l="Velocidade" v={`${v.toFixed(2)} m/s`}/><R l="Reynolds" v={Re.toFixed(0)}/></Calc>
}
const Calc=({title,children}:{title:string,children:React.ReactNode})=><section className="hyd-calc tech-card"><h3>{title}</h3><div className="hyd-grid">{children}</div></section>
const R=({l,v}:{l:string,v:string})=><div className="hyd-result"><span>{l}</span><b>{v}</b></div>
