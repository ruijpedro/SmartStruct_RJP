import React,{useMemo,useState} from 'react'
import {isolatedFooting,stripFooting,raftFoundation,pileGroup,punchingDemand} from './FoundationsSolver'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
export default function FoundationsProPage(){
  const [tab,setTab]=useState<'isolated'|'strip'|'raft'|'piles'>('isolated')
  const [N,setN]=useState(900),[Mx,setMx]=useState(50),[My,setMy]=useState(20),[B,setB]=useState(2.2),[L,setL]=useState(2.6),[qAllow,setQAllow]=useState(250)
  const [A,setA]=useState(120),[nPiles,setNP]=useState(4),[capPile,setCapPile]=useState(450),[eff,setEff]=useState(.9)
  const [cb,setCb]=useState(.4),[cl,setCl]=useState(.4),[d,setD]=useState(.45)
  const iso=useMemo(()=>isolatedFooting(N,Mx,My,B,L,qAllow),[N,Mx,My,B,L,qAllow])
  const st=useMemo(()=>stripFooting(N,B,qAllow),[N,B,qAllow])
  const ra=useMemo(()=>raftFoundation(N,A,qAllow),[N,A,qAllow])
  const pg=useMemo(()=>pileGroup(N,nPiles,capPile,eff),[N,nPiles,capPile,eff])
  const pu=useMemo(()=>punchingDemand(N,cb,cl,d),[N,cb,cl,d])
  return <div className="module-page">
    <div className="module-head"><div><h2>Fundações</h2><p>Sapatas, vigas de fundação, radier e grupos de estacas.</p></div></div>
    <div className="tabs-row">{[['isolated','Sapata isolada'],['strip','Sapata corrida'],['raft','Radier'],['piles','Estacas']].map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k as any)}>{l}</button>)}</div>
    <div className="work-grid">
      <section className="panel"><h3>Dados</h3><div className="form-grid">
        <F l="NEd" u="kN" v={N} s={setN}/>
        {tab==='isolated'&&<><F l="Mx" u="kN·m" v={Mx} s={setMx}/><F l="My" u="kN·m" v={My} s={setMy}/><F l="B" u="m" v={B} s={setB}/><F l="L" u="m" v={L} s={setL}/><F l="qadm" u="kPa" v={qAllow} s={setQAllow}/><F l="b pilar" u="m" v={cb} s={setCb}/><F l="l pilar" u="m" v={cl} s={setCl}/><F l="d" u="m" v={d} s={setD}/></>}
        {tab==='strip'&&<><F l="B" u="m" v={B} s={setB}/><F l="qadm" u="kPa" v={qAllow} s={setQAllow}/></>}
        {tab==='raft'&&<><F l="Área radier" u="m²" v={A} s={setA}/><F l="qadm" u="kPa" v={qAllow} s={setQAllow}/></>}
        {tab==='piles'&&<><F l="N.º estacas" v={nPiles} s={setNP}/><F l="Capacidade/estaca" u="kN" v={capPile} s={setCapPile}/><F l="Eficiência grupo" v={eff} s={setEff}/></>}
      </div></section>
      <section className="panel"><h3>Resultados</h3><div className="result-grid compact">
        {tab==='isolated'&&<><M t="q méd." v={`${iso.q0.toFixed(1)} kPa`}/><M t="q máx." v={`${iso.qmax.toFixed(1)} kPa`}/><M t="q mín." v={`${iso.qmin.toFixed(1)} kPa`}/><M t="Punçoamento v" v={`${pu.v.toFixed(2)} MPa`}/><M t="Estado" v={iso.ok?'OK':'REVER'}/></>}
        {tab==='strip'&&<><M t="q" v={`${st.q.toFixed(1)} kPa`}/><M t="Utilização" v={st.util.toFixed(2)}/><M t="Estado" v={st.ok?'OK':'REVER'}/></>}
        {tab==='raft'&&<><M t="q" v={`${ra.q.toFixed(1)} kPa`}/><M t="Utilização" v={ra.util.toFixed(2)}/><M t="Estado" v={ra.ok?'OK':'REVER'}/></>}
        {tab==='piles'&&<><M t="Cap. grupo" v={`${pg.cap.toFixed(0)} kN`}/><M t="Utilização" v={pg.util.toFixed(2)}/><M t="Estado" v={pg.ok?'OK':'REVER'}/></>}
      </div></section>
    </div>
  </div>
}
