import React,{useEffect,useMemo,useState} from 'react'
import {sizeWater,sizeSewer} from './network'
import {loadPublicGraph,savePublicGraph} from './publicNetworkStore'

type Mode='predial'|'public'
type Kind=
  'meter'|'tap'|'basin'|'wc'|'shower'|'stack'|'inspection'|
  'manhole'|'collector'|'connection'

type Node={
  id:number
  kind:Kind
  x:number
  y:number
  label:string
  ground?:number
  invert?:number
}

type Edge={
  id:number
  a:number
  b:number
  L:number
  slope:number
  q:number
  dnMin:number
}

const defs:{kind:Kind,label:string}[]=[
  {kind:'meter',label:'Contador'},
  {kind:'tap',label:'Torneira'},
  {kind:'basin',label:'Lavatório'},
  {kind:'wc',label:'Sanita'},
  {kind:'shower',label:'Duche'},
  {kind:'stack',label:'Tubo de queda'},
  {kind:'inspection',label:'Caixa'},
  {kind:'manhole',label:'Câmara de visita'},
  {kind:'collector',label:'Coletor'},
  {kind:'connection',label:'Ramal de ligação'},
]

const predialKinds:Kind[]=['meter','tap','basin','wc','shower','stack','inspection']
const publicKinds:Kind[]=['manhole','collector','connection']

export default function GraphicNetworkEditor(){
  const[mode,setMode]=useState<Mode>('predial')
  const[nodes,setNodes]=useState<Node[]>([])
  const[edges,setEdges]=useState<Edge[]>([])
  const[tool,setTool]=useState<Kind>('meter')
  const[selected,setSelected]=useState<number|null>(null)

  const palette=defs.filter(d=>(mode==='predial'?predialKinds:publicKinds).includes(d.kind))

  useEffect(()=>{
    if(mode==='public') savePublicGraph({nodes,edges})
  },[mode,nodes,edges])


  function reset(next:Mode){
    setMode(next)
    setSelected(null)
    setTool(next==='predial'?'meter':'manhole')
    if(next==='public'){
      const saved=loadPublicGraph()
      setNodes((saved?.nodes||[]) as Node[])
      setEdges((saved?.edges||[]) as Edge[])
    }else{
      setNodes([])
      setEdges([])
    }
  }

  function addNode(e:React.MouseEvent<SVGSVGElement>){
    const rect=e.currentTarget.getBoundingClientRect()
    const x=(e.clientX-rect.left)*900/rect.width
    const y=(e.clientY-rect.top)*500/rect.height
    const d=defs.find(x=>x.kind===tool)!
    const id=Date.now()+Math.floor(Math.random()*1000)
    setNodes([...nodes,{
      id,kind:tool,x,y,label:d.label,
      ground:mode==='public'?100:undefined,
      invert:mode==='public'?98:undefined
    }])
  }

  function clickNode(id:number,e:React.MouseEvent){
    e.stopPropagation()
    if(selected && selected!==id){
      const a=nodes.find(n=>n.id===selected)!
      const b=nodes.find(n=>n.id===id)!
      const L=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)/12)
      setEdges([...edges,{
        id:Date.now()+Math.floor(Math.random()*1000),
        a:selected,b:id,L,
        slope:mode==='public'?1:2,
        q:mode==='public'?5:.5,
        dnMin:mode==='public'?200:50
      }])
      setSelected(null)
    }else{
      setSelected(id)
    }
  }

  const results=useMemo(()=>edges.map(e=>{
    const a=nodes.find(n=>n.id===e.a)
    const b=nodes.find(n=>n.id===e.b)
    if(!a||!b)return null

    if(mode==='public'){
      const r=sizeSewer(e.q,e.slope,Math.max(200,e.dnMin))
      return {...e,...r,a,b}
    }
    const r=sizeWater(e.q,e.L)
    return {...e,...r,a,b}
  }).filter(Boolean) as any[],[edges,nodes,mode])

  return <div className="graphic-editor">
    <section className="tech-card editor-toolbar">
      <div className="mode-switch">
        <button className={mode==='predial'?'active':''} onClick={()=>reset('predial')}>Rede Predial</button>
        <button className={mode==='public'?'active':''} onClick={()=>reset('public')}>Rede Pública de Saneamento</button>
      </div>

      <div className="palette">
        {palette.map(d=>
          <button key={d.kind} className={tool===d.kind?'active':''} onClick={()=>setTool(d.kind)}>
            {d.label}
          </button>
        )}
      </div>

      <p>
        Toque no desenho para colocar elementos. Toque num elemento e depois noutro para criar um troço.
        O SmartStruct calcula automaticamente o troço criado.
      </p>
    </section>

    <section className="tech-card canvas-wrap">
      <svg viewBox="0 0 900 500" className="network-canvas" onClick={addNode}>
        <defs>
          <pattern id="grid-v50" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" fill="none" stroke="#173246" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="900" height="500" fill="url(#grid-v50)"/>

        {results.map((r:any)=>{
          const xm=(r.a.x+r.b.x)/2
          const ym=(r.a.y+r.b.y)/2
          return <g key={r.id}>
            <line
              x1={r.a.x} y1={r.a.y} x2={r.b.x} y2={r.b.y}
              stroke={mode==='public'?'#b5c2ca':'#2ac8c1'}
              strokeWidth={mode==='public'?7:5}
            />
            <rect x={xm-58} y={ym-23} width="116" height="20" rx="6" fill="#07131e" opacity=".9"/>
            <text x={xm} y={ym-9} textAnchor="middle" fill="#fff" fontSize="11">
              {mode==='public'
                ? `DN ${Math.max(200,r.dn)} · i ${r.slope.toFixed(1)}%`
                : `DN ${r.dn} · ${r.v.toFixed(2)} m/s`}
            </text>
          </g>
        })}

        {nodes.map(n=>
          <g key={n.id} onClick={e=>clickNode(n.id,e)} style={{cursor:'pointer'}}>
            <circle
              cx={n.x} cy={n.y} r="22"
              fill={selected===n.id?'#185f68':'#102b3d'}
              stroke="#42d4cd" strokeWidth="3"
            />
            <text x={n.x} y={n.y+4} textAnchor="middle" fill="#fff" fontSize="10">
              {symbol(n.kind)}
            </text>
            <text x={n.x} y={n.y+39} textAnchor="middle" fill="#9bb1c2" fontSize="11">
              {n.label}
            </text>
          </g>
        )}
      </svg>
    </section>

    {mode==='predial'
      ? <PredialPanel results={results}/>
      : <PublicPanel results={results} edges={edges} setEdges={setEdges} nodes={nodes} setNodes={setNodes}/>
    }
  </div>
}

function PredialPanel({results}:{results:any[]}){
  return <section className="tech-card">
    <h3>REDE PREDIAL — TROÇOS CALCULADOS</h3>
    <div className="public-table">
      {results.map((r:any)=>
        <div className="public-row predial-row" key={r.id}>
          <b>{r.a.label} → {r.b.label}</b>
          <span>Q {r.q.toFixed(2)} L/s</span>
          <span>DN {r.dn}</span>
          <span className={r.v>=.5&&r.v<=2?'pass':'warn'}>v {r.v.toFixed(2)} m/s</span>
          <span>hf {r.hf.toFixed(2)} m</span>
          <span>L {r.L.toFixed(1)} m</span>
        </div>
      )}
    </div>
  </section>
}

function PublicPanel({
  results,edges,setEdges,nodes,setNodes
}:{
  results:any[],
  edges:Edge[],
  setEdges:(v:Edge[])=>void,
  nodes:Node[],
  setNodes:(v:Node[])=>void
}){
  return <section className="tech-card">
    <h3>REDE PÚBLICA — COLETORES E CÂMARAS DE VISITA</h3>

    <div className="public-table">
      {results.map((r:any)=>
        <div className="public-row" key={r.id}>
          <b>{r.a.label} → {r.b.label}</b>

          <label>
            Q
            <input
              type="number"
              value={r.q}
              onChange={e=>setEdges(edges.map(x=>x.id===r.id?{...x,q:+e.target.value}:x))}
            />
            L/s
          </label>

          <label>
            i
            <input
              type="number"
              value={r.slope}
              onChange={e=>setEdges(edges.map(x=>x.id===r.id?{...x,slope:+e.target.value}:x))}
            />
            %
          </label>

          <span>DN {Math.max(200,r.dn)}</span>
          <span>v {r.v.toFixed(2)} m/s</span>
          <span className={r.L<=60?'pass':'warn'}>L {r.L.toFixed(1)} m</span>
        </div>
      )}
    </div>

    <h3 style={{marginTop:16}}>CÂMARAS DE VISITA</h3>
    <div className="manhole-grid">
      {nodes.filter(n=>n.kind==='manhole').map(n=>{
        const depth=Math.max(0,(n.ground||0)-(n.invert||0))
        const minDim=depth<2.5?1.00:1.25
        return <article className="manhole-card" key={n.id}>
          <b>{n.label}</b>
          <label>Cota terreno <input type="number" value={n.ground||0} onChange={e=>setNodes(nodes.map(x=>x.id===n.id?{...x,ground:+e.target.value}:x))}/> m</label>
          <label>Cota soleira <input type="number" value={n.invert||0} onChange={e=>setNodes(nodes.map(x=>x.id===n.id?{...x,invert:+e.target.value}:x))}/> m</label>
          <span>Profundidade {depth.toFixed(2)} m</span>
          <span>Dimensão mínima em planta {minDim.toFixed(2)} m</span>
        </article>
      })}
    </div>

    <div className="public-rules">
      <b>Controlo automático — DR 23/95</b>
      <span>DN mínimo de coletor público: 200 mm</span>
      <span>Câmara de visita em confluências e mudanças de direção, inclinação ou diâmetro</span>
      <span>Afastamento máximo: 60 m em coletores não visitáveis</span>
      <span>CV: ≥1,00 m para profundidade &lt;2,5 m; ≥1,25 m para profundidade ≥2,5 m</span>
      <span>Queda guiada quando aplicável para desníveis superiores a 0,50 m</span>
      <span>Ramal de ligação: DN ≥125 mm; i ≥1%, aconselhado 2–4%</span>
    </div>
  </section>
}

function symbol(k:Kind){
  if(k==='manhole')return 'CV'
  if(k==='collector')return 'COL'
  if(k==='connection')return 'RL'
  if(k==='stack')return 'TQ'
  if(k==='wc')return 'WC'
  if(k==='basin')return 'LV'
  if(k==='shower')return 'DU'
  if(k==='meter')return 'CT'
  if(k==='inspection')return 'CX'
  if(k==='tap')return 'TR'
  return '•'
}
