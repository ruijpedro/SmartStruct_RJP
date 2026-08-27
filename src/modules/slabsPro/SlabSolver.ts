import {ec2Fyd} from '../../engineering/structuralMath'
export type SlabInput={lx:number;ly:number;gk:number;qk:number;t:number;cover:number;fyk:number;support:'simple'|'continuous'}
export function solveSlab(i:SlabInput){
  const qEd=1.35*i.gk+1.5*i.qk, qSls=i.gk+i.qk
  const ratio=i.ly/Math.max(i.lx,1e-9), twoWay=ratio<2
  let alphaX=twoWay?0.062:0.125, alphaY=twoWay?0.045:0
  if(i.support==='continuous'){ alphaX*=0.82; alphaY*=0.82 }
  const Mx=alphaX*qEd*i.lx*i.lx, My=alphaY*qEd*i.lx*i.lx
  const MnegX=i.support==='continuous'?0.65*Mx:0
  const MnegY=i.support==='continuous'?0.65*My:0
  const d=Math.max(i.t-i.cover-.006,0.04),z=.9*d,fyd=ec2Fyd(i.fyk)
  const AsCalcX=Mx*1e6/(Math.max(z*1000*fyd,1e-9))
  const AsCalcY=My*1e6/(Math.max(z*1000*fyd,1e-9))
  const AsMin=.0013*i.t*1e6
  const Asx=Math.max(AsCalcX,AsMin), Asy=Math.max(AsCalcY,AsMin)
  const spanDepth=i.lx/Math.max(i.t,1e-9)
  const deflIndex=qSls*Math.pow(i.lx,4)/Math.max(Math.pow(i.t,3),1e-9)
  return {qEd,qSls,ratio,twoWay,Mx,My,MnegX,MnegY,Asx,Asy,AsMin,spanDepth,deflIndex}
}
