export type FrameNode={
  id:number;x:number;y:number;
  fixX?:boolean;fixY?:boolean;fixR?:boolean;
  Fx?:number;Fy?:number;M?:number
}
export type FrameElement={
  id:number;a:number;b:number;
  E:number;A:number;I:number
}
export type FrameModel={nodes:FrameNode[],elements:FrameElement[]}

export type ElementEndForces={
  elementId:number;
  local:[number,number,number,number,number,number];
  N1:number;V1:number;M1:number;N2:number;V2:number;M2:number;
  L:number;c:number;s:number
}
export type FrameResult={
  displacements:number[];
  reactions:number[];
  elementForces:Record<number,number[]>;
  endForces:ElementEndForces[];
}

function zeros(n:number,m=n){return Array.from({length:n},()=>Array(m).fill(0))}
function transpose(a:number[][]){return a[0].map((_,j)=>a.map(r=>r[j]))}
function mul(a:number[][],b:number[][]){
  return a.map(r=>b[0].map((_,j)=>r.reduce((s,v,k)=>s+v*b[k][j],0)))
}
function mv(a:number[][],v:number[]){
  return a.map(r=>r.reduce((s,x,i)=>s+x*v[i],0))
}
function solve(A:number[][],b:number[]){
  const n=b.length
  if(n===0)return []
  const M=A.map((r,i)=>[...r,b[i]])
  for(let k=0;k<n;k++){
    let p=k
    for(let i=k+1;i<n;i++){
      if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i
    }
    ;[M[k],M[p]]=[M[p],M[k]]
    const d=M[k][k]
    if(Math.abs(d)<1e-12)throw new Error('Modelo instável, mecanismos ou vínculos insuficientes.')
    for(let j=k;j<=n;j++)M[k][j]/=d
    for(let i=0;i<n;i++){
      if(i===k)continue
      const f=M[i][k]
      for(let j=k;j<=n;j++)M[i][j]-=f*M[k][j]
    }
  }
  return M.map(r=>r[n])
}
function localK(E:number,A:number,I:number,L:number){
  const ea=E*A/L
  const e12=12*E*I/L**3
  const e6=6*E*I/L**2
  const e4=4*E*I/L
  const e2=2*E*I/L
  return [
    [ea,0,0,-ea,0,0],
    [0,e12,e6,0,-e12,e6],
    [0,e6,e4,0,-e6,e2],
    [-ea,0,0,ea,0,0],
    [0,-e12,-e6,0,e12,-e6],
    [0,e6,e2,0,-e6,e4]
  ]
}
function T(c:number,s:number){
  return [
    [c,s,0,0,0,0],
    [-s,c,0,0,0,0],
    [0,0,1,0,0,0],
    [0,0,0,c,s,0],
    [0,0,0,-s,c,0],
    [0,0,0,0,0,1]
  ]
}
export function solveFrame2D(m:FrameModel):FrameResult{
  const nn=m.nodes.length, nd=3*nn
  const K=zeros(nd), F=Array(nd).fill(0)
  const index=new Map(m.nodes.map((n,i)=>[n.id,i]))

  m.nodes.forEach((n,i)=>{
    F[3*i]=n.Fx||0
    F[3*i+1]=n.Fy||0
    F[3*i+2]=n.M||0
  })

  const cache:{
    e:FrameElement,kl:number[][],t:number[][],dofs:number[],
    L:number,c:number,s:number
  }[]=[]

  for(const e of m.elements){
    const ia=index.get(e.a),ib=index.get(e.b)
    if(ia==null||ib==null)throw new Error(`Elemento ${e.id}: nó inexistente.`)
    const a=m.nodes[ia],b=m.nodes[ib]
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)
    if(L<=1e-9)throw new Error(`Elemento ${e.id}: comprimento nulo.`)
    const c=dx/L,s=dy/L
    const kl=localK(e.E,e.A,e.I,L),t=T(c,s),kg=mul(transpose(t),mul(kl,t))
    const dofs=[3*ia,3*ia+1,3*ia+2,3*ib,3*ib+1,3*ib+2]
    dofs.forEach((r,i)=>dofs.forEach((q,j)=>K[r][q]+=kg[i][j]))
    cache.push({e,kl,t,dofs,L,c,s})
  }

  const fixed:boolean[]=[]
  m.nodes.forEach(n=>fixed.push(!!n.fixX,!!n.fixY,!!n.fixR))
  const free=fixed.map((v,i)=>v?-1:i).filter(i=>i>=0)
  const Kff=free.map(i=>free.map(j=>K[i][j]))
  const Ff=free.map(i=>F[i])
  const uf=solve(Kff,Ff)
  const u=Array(nd).fill(0)
  free.forEach((d,i)=>u[d]=uf[i])

  const reactions=mv(K,u).map((x,i)=>x-F[i])
  const elementForces:Record<number,number[]>={}
  const endForces:ElementEndForces[]=[]

  cache.forEach(({e,kl,t,dofs,L,c,s})=>{
    const ug=dofs.map(d=>u[d])
    const ul=mv(t,ug)
    const fl=mv(kl,ul)
    elementForces[e.id]=fl
    endForces.push({
      elementId:e.id,
      local:fl as [number,number,number,number,number,number],
      N1:fl[0],V1:fl[1],M1:fl[2],N2:fl[3],V2:fl[4],M2:fl[5],
      L,c,s
    })
  })
  return {displacements:u,reactions,elementForces,endForces}
}

export function nodeDisplacement(result:FrameResult,nodeIndex:number){
  return {
    ux:result.displacements[3*nodeIndex]||0,
    uy:result.displacements[3*nodeIndex+1]||0,
    rz:result.displacements[3*nodeIndex+2]||0
  }
}
