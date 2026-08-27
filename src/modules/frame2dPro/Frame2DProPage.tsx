import React,{useMemo,useState} from 'react'
import {solveFrame2D,type FrameModel,type FrameElement,type FrameNode} from '../../engineering/core/frame2d'

type SupportPreset='free'|'pin'|'roller-x'|'roller-y'|'fixed'

const initial:FrameModel={
  nodes:[
    {id:1,x:0,y:0,fixX:true,fixY:true,fixR:true},
    {id:2,x:0,y:3},
    {id:3,x:5,y:3,Fy:-40000},
    {id:4,x:5,y:0,fixX:true,fixY:true}
  ],
  elements:[
    {id:1,a:1,b:2,E:210e9,A:.006,I:8e-5},
    {id:2,a:2,b:3,E:210e9,A:.006,I:8e-5},
    {id:3,a:3,b:4,E:210e9,A:.006,I:8e-5}
  ]
}

function supportOf(n:FrameNode):SupportPreset{
  if(n.fixX&&n.fixY&&n.fixR)return 'fixed'
  if(n.fixX&&n.fixY)return 'pin'
  if(n.fixX&&!n.fixY)return 'roller-y'
  if(!n.fixX&&n.fixY)return 'roller-x'
  return 'free'
}
function applyPreset(n:FrameNode,p:SupportPreset):FrameNode{
  if(p==='fixed')return {...n,fixX:true,fixY:true,fixR:true}
  if(p==='pin')return {...n,fixX:true,fixY:true,fixR:false}
  if(p==='roller-x')return {...n,fixX:false,fixY:true,fixR:false}
  if(p==='roller-y')return {...n,fixX:true,fixY:false,fixR:false}
  return {...n,fixX:false,fixY:false,fixR:false}
}
const N=({v}:{v:number})=>Number.isFinite(v)?v:0

export default function Frame2DProPage(){
  const[model,setModel]=useState<FrameModel>(initial)
  const[selectedNode,setSelectedNode]=useState(3)
  const[selectedElement,setSelectedElement]=useState(2)
  const[scale,setScale]=useState(120)
  const solved=useMemo(()=>{try{return {r:solveFrame2D(model),error:''}}catch(e){return {r:null,error:e instanceof Error?e.message:String(e)}}},[model])

  function updateNode(id:number,patch:Partial<FrameNode>){
    setModel({...model,nodes:model.nodes.map(n=>n.id===id?{...n,...patch}:n)})
  }
  function updateElement(id:number,patch:Partial<FrameElement>){
    setModel({...model,elements:model.elements.map(e=>e.id===id?{...e,...patch}:e)})
  }
  function addNode(){
    const id=Math.max(0,...model.nodes.map(n=>n.id))+1
    setModel({...model,nodes:[...model.nodes,{id,x:2.5,y:1.5}]})
    setSelectedNode(id)
  }
  function addElement(){
    if(model.nodes.length<2)return
    const id=Math.max(0,...model.elements.map(e=>e.id))+1
    const a=model.nodes[model.nodes.length-2].id,b=model.nodes[model.nodes.length-1].id
    setModel({...model,elements:[...model.elements,{id,a,b,E:210e9,A:.006,I:8e-5}]})
    setSelectedElement(id)
  }

  const node=model.nodes.find(n=>n.id===selectedNode)
  const elem=model.elements.find(e=>e.id===selectedElement)

  return <div className="module-page">
    <div className="module-head"><div><h2>Pórticos 2D — Solver Matricial</h2><p>3 GDL por nó · deslocamentos · reações · N/V/M nas extremidades.</p></div></div>

    <div className="editor-toolbar">
      <button onClick={addNode}>+ Nó</button><button onClick={addElement}>+ Barra</button>
      <label className="deform-scale">Escala deformada <input type="range" min="1" max="400" value={scale} onChange={e=>setScale(+e.target.value)}/><b>{scale}×</b></label>
    </div>

    <div className="editor-grid">
      <section className="panel">
        <FrameSvg model={model} result={solved.r} scale={scale} selectedNode={selectedNode} selectedElement={selectedElement} setNode={setSelectedNode} setElement={setSelectedElement}/>
      </section>
      <section className="panel control-stack">
        <div><h3>Nó {selectedNode}</h3>{node&&<div className="form-grid">
          <Field l="x" u="m" v={node.x} s={v=>updateNode(node.id,{x:v})}/><Field l="y" u="m" v={node.y} s={v=>updateNode(node.id,{y:v})}/>
          <Field l="Fx" u="N" v={node.Fx||0} s={v=>updateNode(node.id,{Fx:v})}/><Field l="Fy" u="N" v={node.Fy||0} s={v=>updateNode(node.id,{Fy:v})}/>
          <Field l="M" u="N·m" v={node.M||0} s={v=>updateNode(node.id,{M:v})}/>
          <label className="field"><span>Apoio</span><select value={supportOf(node)} onChange={e=>updateNode(node.id,applyPreset(node,e.target.value as SupportPreset))}>
            <option value="free">Livre</option><option value="pin">Articulado</option><option value="roller-x">Móvel X</option><option value="roller-y">Móvel Y</option><option value="fixed">Encastre</option>
          </select></label>
        </div>}</div>
        <div><h3>Barra {selectedElement}</h3>{elem&&<div className="form-grid">
          <Field l="E" u="Pa" v={elem.E} s={v=>updateElement(elem.id,{E:v})}/><Field l="A" u="m²" v={elem.A} s={v=>updateElement(elem.id,{A:v})}/><Field l="I" u="m⁴" v={elem.I} s={v=>updateElement(elem.id,{I:v})}/>
        </div>}</div>
        {solved.error&&<div className="solver-error">{solved.error}</div>}
      </section>
    </div>

    {solved.r&&<>
      <section className="panel"><h3>Deslocamentos nodais</h3><div className="member-table">{model.nodes.map((n,i)=><div key={n.id}><b>Nó {n.id}</b><span>ux {(solved.r!.displacements[3*i]*1000).toExponential(3)} mm</span><span>uy {(solved.r!.displacements[3*i+1]*1000).toExponential(3)} mm</span><span>rz {solved.r!.displacements[3*i+2].toExponential(3)} rad</span></div>)}</div></section>
      <section className="panel"><h3>Reações</h3><div className="member-table">{model.nodes.map((n,i)=><div key={n.id}><b>Nó {n.id}</b><span>Rx {(solved.r!.reactions[3*i]/1000).toFixed(2)} kN</span><span>Ry {(solved.r!.reactions[3*i+1]/1000).toFixed(2)} kN</span><span>M {(solved.r!.reactions[3*i+2]/1000).toFixed(2)} kN·m</span></div>)}</div></section>
      <section className="panel"><h3>Esforços nas extremidades</h3><div className="member-table">{solved.r.endForces.map(e=><div key={e.elementId}><b>Barra {e.elementId}</b><span>N1 {(e.N1/1000).toFixed(2)} kN · N2 {(e.N2/1000).toFixed(2)} kN</span><span>V1 {(e.V1/1000).toFixed(2)} kN · V2 {(e.V2/1000).toFixed(2)} kN</span><span>M1 {(e.M1/1000).toFixed(2)} · M2 {(e.M2/1000).toFixed(2)} kN·m</span></div>)}</div></section>
      <section className="diagrams-grid">
        <section className="panel"><h3>Diagrama N</h3><EndForceDiagram model={model} forces={solved.r.endForces} type="N"/></section>
        <section className="panel"><h3>Diagrama V</h3><EndForceDiagram model={model} forces={solved.r.endForces} type="V"/></section>
        <section className="panel"><h3>Diagrama M</h3><EndForceDiagram model={model} forces={solved.r.endForces} type="M"/></section>
      </section>
    </>}
  </div>
}

function Field({l,v,s,u}:{l:string,v:number,s:(n:number)=>void,u?:string}){
 return <label className="field"><span>{l}{u?` (${u})`:''}</span><input type="number" step="any" value={v} onChange={e=>s(N(+e.target.value))}/></label>
}

function FrameSvg({model,result,scale,selectedNode,selectedElement,setNode,setElement}:{model:FrameModel,result:any,scale:number,selectedNode:number,selectedElement:number,setNode:(n:number)=>void,setElement:(n:number)=>void}){
 const W=700,H=440,p=70,maxX=Math.max(1,...model.nodes.map(n=>n.x)),maxY=Math.max(1,...model.nodes.map(n=>n.y)),S=Math.min((W-2*p)/maxX,(H-2*p)/maxY)
 const P=(n:FrameNode)=>({x:p+n.x*S,y:H-p-n.y*S})
 const Pd=(n:FrameNode,i:number)=>({x:p+(n.x+(result?.displacements[3*i]||0)*scale)*S,y:H-p-(n.y+(result?.displacements[3*i+1]||0)*scale)*S})
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg editor-svg">
   {model.elements.map(e=>{const a=P(model.nodes.find(n=>n.id===e.a)!),b=P(model.nodes.find(n=>n.id===e.b)!);return <line key={'u'+e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={selectedElement===e.id?'#2dd4bf':'#a9bacd'} strokeWidth={selectedElement===e.id?9:6} onClick={()=>setElement(e.id)} style={{cursor:'pointer'}}/>})}
   {result&&model.elements.map(e=>{const ia=model.nodes.findIndex(n=>n.id===e.a),ib=model.nodes.findIndex(n=>n.id===e.b),a=Pd(model.nodes[ia],ia),b=Pd(model.nodes[ib],ib);return <line key={'d'+e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 5"/>})}
   {model.nodes.map((n,i)=>{const q=P(n);return <g key={n.id} onClick={()=>setNode(n.id)} style={{cursor:'pointer'}}><Support n={n} x={q.x} y={q.y}/><circle cx={q.x} cy={q.y} r={selectedNode===n.id?10:7} fill={selectedNode===n.id?'#2dd4bf':'#e7eef6'}/><text x={q.x+11} y={q.y-10} fill="#9fb3c8">{n.id}</text>{(n.Fy||0)!==0&&<><line x1={q.x} y1={q.y-60} x2={q.x} y2={q.y-15} stroke="#ef4444" strokeWidth="4"/><polygon points={`${q.x-7},${q.y-25} ${q.x+7},${q.y-25} ${q.x},${q.y-8}`} fill="#ef4444"/></>}</g>})}
   <text x="20" y="25" fill="#f59e0b" fontSize="13">— — deformada amplificada</text>
 </svg>
}
function Support({n,x,y}:{n:FrameNode,x:number,y:number}){
 if(n.fixX&&n.fixY&&n.fixR)return <rect x={x-16} y={y+7} width="32" height="9" fill="#60a5fa"/>
 if(n.fixX&&n.fixY)return <polygon points={`${x},${y+5} ${x-13},${y+27} ${x+13},${y+27}`} fill="#60a5fa"/>
 if(!n.fixX&&n.fixY)return <><polygon points={`${x},${y+5} ${x-13},${y+24} ${x+13},${y+24}`} fill="#60a5fa"/><circle cx={x-7} cy={y+30} r="4" fill="#93c5fd"/><circle cx={x+7} cy={y+30} r="4" fill="#93c5fd"/></>
 if(n.fixX&&!n.fixY)return <g transform={`rotate(-90 ${x} ${y})`}><polygon points={`${x},${y+5} ${x-13},${y+24} ${x+13},${y+24}`} fill="#60a5fa"/><circle cx={x-7} cy={y+30} r="4" fill="#93c5fd"/><circle cx={x+7} cy={y+30} r="4" fill="#93c5fd"/></g>
 return null
}
function EndForceDiagram({model,forces,type}:{model:FrameModel,forces:any[],type:'N'|'V'|'M'}){
 const W=620,H=210,p=35
 const vals=forces.flatMap(f=>type==='N'?[f.N1,f.N2]:type==='V'?[f.V1,f.V2]:[f.M1,f.M2])
 const max=Math.max(1,...vals.map(v=>Math.abs(v)))
 return <svg viewBox={`0 0 ${W} ${H}`} className="eng-svg"><line x1={p} y1={H/2} x2={W-p} y2={H/2} stroke="#52677c"/>{forces.map((f,i)=>{
   const x1=p+i*(W-2*p)/Math.max(forces.length,1),x2=p+(i+1)*(W-2*p)/Math.max(forces.length,1)
   const a=type==='N'?f.N1:type==='V'?f.V1:f.M1,b=type==='N'?f.N2:type==='V'?f.V2:f.M2
   const y1=H/2-a*(H*.35)/max,y2=H/2-b*(H*.35)/max
   return <g key={f.elementId}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={type==='N'?'#22c55e':type==='V'?'#38bdf8':'#a78bfa'} strokeWidth="4"/><text x={(x1+x2)/2-12} y={H-12} fill="#8fa5bf" fontSize="11">B{f.elementId}</text></g>
 })}</svg>
}
