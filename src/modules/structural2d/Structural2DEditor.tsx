import React,{useMemo,useState} from 'react'
import type {Model2D,Node2D,Member2D} from './types'
import {analyseModel} from './solver'
const initial:Model2D={
  nodes:[
    {id:1,x:0,y:0,support:'fixed'},
    {id:2,x:0,y:3},
    {id:3,x:5,y:3,Fy:-40},
    {id:4,x:5,y:0,support:'pin'}
  ],
  members:[
    {id:1,a:1,b:2,E:210,A:.006,I:8e-5,label:'P1'},
    {id:2,a:2,b:3,E:210,A:.006,I:8e-5,label:'V1'},
    {id:3,a:3,b:4,E:210,A:.006,I:8e-5,label:'P2'}
  ]
}
export default function Structural2DEditor(){
  const [model,setModel]=useState<Model2D>(initial)
  const [mode,setMode]=useState<'select'|'node'|'member'|'load'|'support'>('select')
  const [selected,setSelected]=useState<number|null>(null)
  const r=useMemo(()=>analyseModel(model),[model])
  function addNode(){
    const id=Math.max(0,...model.nodes.map(n=>n.id))+1
    setModel({...model,nodes:[...model.nodes,{id,x:2.5,y:1.5,support:'free'}]})
  }
  function addMember(){
    if(model.nodes.length<2)return
    const id=Math.max(0,...model.members.map(e=>e.id))+1
    const a=model.nodes[model.nodes.length-2].id,b=model.nodes[model.nodes.length-1].id
    setModel({...model,members:[...model.members,{id,a,b,E:210,A:.006,I:8e-5,label:`B${id}`}]})
  }
  function cycleSupport(id:number){
    const order=['free','pin','roller','fixed'] as const
    setModel({...model,nodes:model.nodes.map(n=>n.id===id?{...n,support:order[(order.indexOf(n.support||'free')+1)%order.length]}:n)})
  }
  function addLoad(id:number){
    setModel({...model,nodes:model.nodes.map(n=>n.id===id?{...n,Fy:(n.Fy||0)-10}:n)})
  }
  return <div className="module-page">
    <div className="module-head"><div><h2>Editor Estrutural 2D</h2><p>Nós, barras, apoios e cargas para vigas, pórticos e treliças.</p></div></div>
    <div className="editor-toolbar">
      {(['select','node','member','support','load'] as const).map(x=><button key={x} className={mode===x?'active':''} onClick={()=>setMode(x)}>{({select:'Selecionar',node:'Nó',member:'Barra',support:'Apoio',load:'Carga'} as any)[x]}</button>)}
      <button onClick={addNode}>+ Nó</button><button onClick={addMember}>+ Barra</button>
    </div>
    <div className="editor-grid">
      <section className="panel">
        <ModelSvg model={model} selected={selected} setSelected={setSelected} mode={mode} cycleSupport={cycleSupport} addLoad={addLoad}/>
      </section>
      <section className="panel">
        <h3>Modelo</h3>
        <div className="model-list">
          {model.nodes.map(n=><button key={n.id} onClick={()=>setSelected(n.id)} className={selected===n.id?'selected':''}>Nó {n.id} · ({n.x.toFixed(1)}, {n.y.toFixed(1)}) · {n.support||'free'} · Fy {n.Fy||0} kN</button>)}
        </div>
        <h3 style={{marginTop:16}}>Equilíbrio global</h3>
        <div className="result-grid compact">
          <M t="ΣFx" v={`${r.totalFx.toFixed(1)} kN`}/><M t="ΣFy" v={`${r.totalFy.toFixed(1)} kN`}/>
          <M t="Nós" v={`${model.nodes.length}`}/><M t="Barras" v={`${model.members.length}`}/>
        </div>
      </section>
    </div>
    <section className="panel"><h3>Resultados preliminares por barra</h3>
      <div className="member-table">{r.members.map(e=><div key={e.id}><b>Barra {e.id}</b><span>L = {e.L.toFixed(2)} m</span><span>α = {e.angle.toFixed(1)}°</span><span>N aprox. = {e.axialApprox.toFixed(1)} kN</span></div>)}</div>
    </section>
  </div>
}
const M=({t,v}:{t:string,v:string})=><div className="metric"><span>{t}</span><b>{v}</b></div>
function ModelSvg({model,selected,setSelected,mode,cycleSupport,addLoad}:{model:Model2D,selected:number|null,setSelected:(n:number)=>void,mode:string,cycleSupport:(n:number)=>void,addLoad:(n:number)=>void}){
  const W=680,H=430,pad=70,maxX=Math.max(1,...model.nodes.map(n=>n.x)),maxY=Math.max(1,...model.nodes.map(n=>n.y))
  const sx=(W-2*pad)/maxX,sy=(H-2*pad)/maxY,S=Math.min(sx,sy)
  const P=(n:Node2D)=>({x:pad+n.x*S,y:H-pad-n.y*S})
  function click(n:Node2D){setSelected(n.id);if(mode==='support')cycleSupport(n.id);if(mode==='load')addLoad(n.id)}
  return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg editor-svg">
    {Array.from({length:11}).map((_,i)=><line key={'v'+i} x1={pad+i*(W-2*pad)/10} y1={pad} x2={pad+i*(W-2*pad)/10} y2={H-pad} stroke="#18283b"/>)}
    {Array.from({length:7}).map((_,i)=><line key={'h'+i} x1={pad} y1={pad+i*(H-2*pad)/6} x2={W-pad} y2={pad+i*(H-2*pad)/6} stroke="#18283b"/>)}
    {model.members.map(e=>{const a=P(model.nodes.find(n=>n.id===e.a)!),b=P(model.nodes.find(n=>n.id===e.b)!);return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#b7c9dc" strokeWidth="7" strokeLinecap="round"/>})}
    {model.nodes.map(n=>{const p=P(n);return <g key={n.id} onClick={()=>click(n)} style={{cursor:'pointer'}}>
      {(n.Fy||0)<0&&<><line x1={p.x} y1={p.y-70} x2={p.x} y2={p.y-16} stroke="#ef4444" strokeWidth="4"/><polygon points={`${p.x-7},${p.y-25} ${p.x+7},${p.y-25} ${p.x},${p.y-10}`} fill="#ef4444"/></>}
      <Support n={n} x={p.x} y={p.y}/>
      <circle cx={p.x} cy={p.y} r={selected===n.id?10:7} fill={selected===n.id?'#2dd4bf':'#e2e8f0'} stroke="#07111d" strokeWidth="2"/>
      <text x={p.x+10} y={p.y-10} fill="#9fb3c8" fontSize="13">{n.id}</text>
    </g>})}
  </svg>
}
function Support({n,x,y}:{n:Node2D,x:number,y:number}){
  if(n.support==='pin')return <polygon points={`${x},${y+6} ${x-14},${y+28} ${x+14},${y+28}`} fill="#60a5fa"/>
  if(n.support==='roller')return <><polygon points={`${x},${y+6} ${x-14},${y+25} ${x+14},${y+25}`} fill="#60a5fa"/><circle cx={x-7} cy={y+31} r="4" fill="#93c5fd"/><circle cx={x+7} cy={y+31} r="4" fill="#93c5fd"/></>
  if(n.support==='fixed')return <rect x={x-18} y={y+6} width="36" height="9" fill="#60a5fa"/>
  return null
}
