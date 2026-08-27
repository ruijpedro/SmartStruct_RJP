import React,{useMemo,useState} from 'react'; import {solveColumn} from './ColumnSolver'; import {fmt} from '../../engineering/structuralMath'
const F=({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string})=><label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(+e.target.value)}/></label>
export default function ColumnsProPage(){
  const [N,setN]=useState(900),[Mx,setMx]=useState(65),[My,setMy]=useState(20),[b,setB]=useState(.35),[h,setH]=useState(.45),[L,setL]=useState(3),[fck,setFck]=useState(30),[fyk,setFyk]=useState(500),[k,setK]=useState(1.0)
  const r=useMemo(()=>solveColumn({N,Mx,My,b,h,L,fck,fyk,k}),[N,Mx,My,b,h,L,fck,fyk,k])
  return <div className="module-page"><div className="module-head"><div><h2>Pilares</h2><p>Compressão, flexão biaxial e esbelteza preliminar.</p></div></div>
    <div className="work-grid"><section className="panel"><h3>Dados</h3><div className="form-grid">
      <F l="NEd" u="kN" v={N} s={setN}/><F l="Mx" u="kN·m" v={Mx} s={setMx}/><F l="My" u="kN·m" v={My} s={setMy}/>
      <F l="b" u="m" v={b} s={setB}/><F l="h" u="m" v={h} s={setH}/><F l="Comprimento" u="m" v={L} s={setL}/><F l="fck" u="MPa" v={fck} s={setFck}/><F l="fyk" u="MPa" v={fyk} s={setFyk}/><F l="Coef. comprimento k" v={k} s={setK}/>
    </div></section><section className="panel"><h3>Secção</h3><ColumnSvg b={b} h={h}/></section></div>
    <div className="result-grid"><M t="Área" v={`${fmt(r.A,3)} m²`}/><M t="Esbelteza" v={fmt(r.slender,1)}/><M t="σmax" v={`${fmt(r.sigMax)} MPa`}/><M t="Utilização" v={fmt(r.util,2)}/><M t="As mín" v={`${fmt(r.AsMin,0)} mm²`}/><M t="As req." v={`${fmt(r.AsReq,0)} mm²`}/><M t="Interação N-Mx-My" v={fmt(r.interaction,2)}/></div>
  </div>
}
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function ColumnSvg({b,h}:{b:number,h:number}){const sc=260/Math.max(b,h,.1),w=b*sc,hh=h*sc;return <svg viewBox="0 0 420 320" className="eng-svg"><rect x={(420-w)/2} y={(300-hh)/2} width={w} height={hh} rx="3" fill="#8496aa" stroke="#d7e2ec" strokeWidth="3"/>{[[.12,.12],[.88,.12],[.12,.88],[.88,.88]].map(([x,y],i)=><circle key={i} cx={(420-w)/2+w*x} cy={(300-hh)/2+hh*y} r="8" fill="#ef4444"/>)}</svg>}
