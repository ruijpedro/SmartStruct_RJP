export function isolatedFooting(N:number,Mx:number,My:number,B:number,L:number,qAllow:number){
  const A=B*L
  const q0=N/Math.max(A,1e-9)
  const ex=Mx/Math.max(N,1e-9)
  const ey=My/Math.max(N,1e-9)
  const qmax=q0*(1+6*Math.abs(ex)/Math.max(L,1e-9)+6*Math.abs(ey)/Math.max(B,1e-9))
  const qmin=q0*(1-6*Math.abs(ex)/Math.max(L,1e-9)-6*Math.abs(ey)/Math.max(B,1e-9))
  return {A,q0,ex,ey,qmax,qmin,ok:qmax<=qAllow && qmin>=0}
}

export function stripFooting(NperM:number,B:number,qAllow:number){
  const q=NperM/Math.max(B,1e-9)
  return {q,util:q/Math.max(qAllow,1e-9),ok:q<=qAllow}
}

export function raftFoundation(N:number,A:number,qAllow:number){
  const q=N/Math.max(A,1e-9)
  return {q,util:q/Math.max(qAllow,1e-9),ok:q<=qAllow}
}

export function pileGroup(N:number,nPiles:number,capPerPile:number,efficiency:number=.9){
  const cap=nPiles*capPerPile*efficiency
  return {cap,util:N/Math.max(cap,1e-9),ok:N<=cap}
}

export function punchingDemand(N:number,columnB:number,columnL:number,d:number){
  const u=2*((columnB+2*d)+(columnL+2*d))
  const v=N*1000/Math.max(u*d,1e-9)/1e6
  return {u,v}
}
