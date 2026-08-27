export type FrameNode={id:number,x:number,y:number,fixX?:boolean,fixY?:boolean,fixR?:boolean,Fx?:number,Fy?:number,M?:number}
export type FrameElement={id:number,a:number,b:number,E:number,A:number,I:number}
export type FrameModel={nodes:FrameNode[],elements:FrameElement[]}
export type FrameResult={displacements:number[],reactions:number[],elementForces:Record<number,number[]>}

function zeros(n:number,m=n){return Array.from({length:n},()=>Array(m).fill(0))}
function transpose(a:number[][]){return a[0].map((_,j)=>a.map(r=>r[j]))}
function mul(a:number[][],b:number[][]){return a.map(r=>b[0].map((_,j)=>r.reduce((s,v,k)=>s+v*b[k][j],0)))}
function mv(a:number[][],v:number[]){return a.map(r=>r.reduce((s,x,i)=>s+x*v[i],0))}
function solve(A:number[][],b:number[]){
  const n=b.length,M=A.map((r,i)=>[...r,b[i]])
  for(let k=0;k<n;k++){
    let p=k; for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i
    ;[M[k],M[p]]=[M[p],M[k]]
    const d=M[k][k]; if(Math.abs(d)<1e-12)throw new Error('Modelo instável ou singular')
    for(let j=k;j<=n;j++)M[k][j]/=d
    for(let i=0;i<n;i++)if(i!==k){const f=M[i][k];for(let j=k;j<=n;j++)M[i][j]-=f*M[k][j]}
  }
  return M.map(r=>r[n])
}
function localK(E:number,A:number,I:number,L:number){
 const ea=E*A/L, e12=12*E*I/L**3,e6=6*E*I/L**2,e4=4*E*I/L,e2=2*E*I/L
 return [[ea,0,0,-ea,0,0],[0,e12,e6,0,-e12,e6],[0,e6,e4,0,-e6,e2],
 [-ea,0,0,ea,0,0],[0,-e12,-e6,0,e12,-e6],[0,e6,e2,0,-e6,e4]]
}
function T(c:number,s:number){return [[c,s,0,0,0,0],[-s,c,0,0,0,0],[0,0,1,0,0,0],[0,0,0,c,s,0],[0,0,0,-s,c,0],[0,0,0,0,0,1]]}
export function solveFrame2D(m:FrameModel):FrameResult{
 const nn=m.nodes.length,nd=3*nn,K=zeros(nd),F=Array(nd).fill(0),index=new Map(m.nodes.map((n,i)=>[n.id,i]))
 m.nodes.forEach((n,i)=>{F[3*i]=n.Fx||0;F[3*i+1]=n.Fy||0;F[3*i+2]=n.M||0})
 const cache:any[]=[]
 for(const e of m.elements){
  const ia=index.get(e.a)!,ib=index.get(e.b)!,a=m.nodes[ia],b=m.nodes[ib],dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),c=dx/L,s=dy/L
  const kl=localK(e.E,e.A,e.I,L),t=T(c,s),kg=mul(transpose(t),mul(kl,t)),dofs=[3*ia,3*ia+1,3*ia+2,3*ib,3*ib+1,3*ib+2]
  dofs.forEach((r,i)=>dofs.forEach((q,j)=>K[r][q]+=kg[i][j]));cache.push({e,kl,t,dofs})
 }
 const fixed:boolean[]=[];m.nodes.forEach(n=>fixed.push(!!n.fixX,!!n.fixY,!!n.fixR))
 const free=fixed.map((v,i)=>v?-1:i).filter(i=>i>=0),Kff=free.map(i=>free.map(j=>K[i][j])),Ff=free.map(i=>F[i])
 const uf=solve(Kff,Ff),u=Array(nd).fill(0);free.forEach((d,i)=>u[d]=uf[i])
 const reactions=mv(K,u).map((x,i)=>x-F[i]),elementForces:Record<number,number[]>={}
 cache.forEach(({e,kl,t,dofs})=>{const ug=dofs.map((d:number)=>u[d]),ul=mv(t,ug);elementForces[e.id]=mv(kl,ul)})
 return {displacements:u,reactions,elementForces}
}
