export type TrussType='pratt'|'howe'|'warren'
export type TrussInput={L:number;H:number;panels:number;P:number;type:TrussType;A:number;E:number}
export function solveTruss(i:TrussInput){
  const n=Math.max(2,Math.round(i.panels)), total=i.P*(n-1), RA=total/2,RB=total/2
  const panel=i.L/n, diag=Math.hypot(panel,i.H), angle=Math.atan2(i.H,panel)
  const chordApprox=(RA*i.L/2)/Math.max(i.H,1e-9)
  const diagApprox=RA/Math.max(Math.sin(angle),1e-9)/Math.max(n/2,1)
  const chordStress=Math.abs(chordApprox)*1000/Math.max(i.A,1e-9)/1e6
  const diagStress=Math.abs(diagApprox)*1000/Math.max(i.A,1e-9)/1e6
  const axialStiffness=i.E*1e9*i.A
  const deflectionApprox=(total*1000*Math.pow(i.L,3))/(48*Math.max(axialStiffness*i.H*i.H,1e-9))
  const weightIndex=(2*i.L+n*diag)*i.A
  return {n,total,RA,RB,panel,diag,angleDeg:angle*180/Math.PI,chordApprox,diagApprox,chordStress,diagStress,deflectionApprox,weightIndex}
}
