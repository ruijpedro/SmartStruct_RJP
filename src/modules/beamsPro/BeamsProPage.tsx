import React,{useMemo,useState} from 'react'
import {solveBeam,type SupportType} from './BeamSolver'
import {fmt} from '../../engineering/structuralMath'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function BeamsProPage(){
  const [support,setSupport]=useState<SupportType>('simply'),[L,setL]=useState(6),[q,setQ]=useState(12),[P,setP]=useState(0),[a,setA]=useState(3)
  const [b,setB]=useState(.30),[h,setH]=useState(.55),[cover,setCover]=useState(.035),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[E,setE]=useState(30)
  const r=useMemo(()=>solveBeam({L,q,P,a,support,b,h,cover,fck,fyk,E}),[L,q,P,a,support,b,h,cover,fck,fyk,E])
  return <div className="module-page">
    <div className="module-head"><div><h2>Vigas</h2><p>Modelo, apoios, cargas, secção, resultados e dimensionamento preliminar.</p></div></div>
    <div className="tabs-row">
      {(['simply','cantilever','fixed-fixed','propped'] as SupportType[]).map(x=><button className={support===x?'active':''} onClick={()=>setSupport(x)} key={x}>{({simply:'Biapoiada',cantilever:'Consola','fixed-fixed':'Encastrada',propped:'Engastada-apoiada'} as any)[x]}</button>)}
    </div>
    <div className="work-grid">
      <section className="panel"><h3>Geometria e cargas</h3><div className="form-grid">
        <F l="Vão L" u="m" v={L} s={setL}/><F l="Carga q" u="kN/m" v={q} s={setQ}/>
        <F l="Carga P" u="kN" v={P} s={setP}/><F l="Posição P" u="m" v={a} s={setA}/>
        <F l="Largura b" u="m" v={b} s={setB}/><F l="Altura h" u="m" v={h} s={setH}/>
        <F l="Recobrimento" u="m" v={cover} s={setCover}/><F l="fck" u="MPa" v={fck} s={setFck}/>
        <F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="E" u="GPa" v={E} s={setE}/>
      </div></section>
      <section className="panel"><h3>Modelo</h3><BeamSvg L={L} q={q} P={P} a={a} support={support}/></section>
    </div>
    <div className="result-grid">
      <Metric t="RA" v={`${fmt(r.RA)} kN`}/><Metric t="RB" v={`${fmt(r.RB)} kN`}/><Metric t="Vmax" v={`${fmt(r.Vmax)} kN`}/>
      <Metric t="Mmax" v={`${fmt(r.Mmax)} kN·m`}/><Metric t="Flecha" v={`${fmt(r.defl*1000,2)} mm`}/><Metric t="As" v={`${fmt(r.As,0)} mm²`}/>
    </div>
  </div>
}
const Metric=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function BeamSvg({L,q,P,a,support}:{L:number,q:number,P:number,a:number,support:SupportType}){
  const x1=70,x2=520,y=150,w=x2-x1,px=x1+w*(Math.max(0,Math.min(a,L))/Math.max(L,.1))
  return <svg viewBox="0 0 590 250" className="eng-svg"><line x1={x1} y1={y} x2={x2} y2={y} stroke="#c7d5e6" strokeWidth="8"/>
    {support==='cantilever'?<><rect x="45" y="105" width="18" height="92" fill="#8295aa"/>{Array.from({length:7}).map((_,i)=><line key={i} x1="43" y1={110+i*13} x2="28" y2={120+i*13} stroke="#8295aa"/>)}</>:<>
      <polygon points={`${x1},${y+4} ${x1-14},${y+28} ${x1+14},${y+28}`} fill="#6fa8dc"/>
      <polygon points={`${x2},${y+4} ${x2-14},${y+28} ${x2+14},${y+28}`} fill="#6fa8dc"/></>}
    {q>0 && Array.from({length:9}).map((_,i)=>{const x=x1+i*w/8;return <g key={i}><line x1={x} y1="78" x2={x} y2="130" stroke="#f59e0b" strokeWidth="2"/><polygon points={`${x-5},125 ${x+5},125 ${x},135`} fill="#f59e0b"/></g>})}
    {P>0 && <g><line x1={px} y1="55" x2={px} y2="130" stroke="#ef4444" strokeWidth="4"/><polygon points={`${px-7},122 ${px+7},122 ${px},137`} fill="#ef4444"/></g>}
    <text x="250" y="220" fill="#9fb3c8">{L.toFixed(2)} m</text>
  </svg>
}
