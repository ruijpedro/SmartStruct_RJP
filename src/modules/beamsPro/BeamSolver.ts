import {ec2Fyd} from '../../engineering/structuralMath'
export type SupportType='simply'|'cantilever'|'fixed-fixed'|'propped'
export type BeamInput={
  L:number;q:number;P:number;a:number;support:SupportType;
  b:number;h:number;cover:number;fck:number;fyk:number;E:number
}
export function solveBeam(i:BeamInput){
  const L=Math.max(i.L,0.1), q=i.q||0, P=i.P||0, a=Math.max(0,Math.min(i.a,L))
  let RA=0,RB=0,Mmax=0,Vmax=0,defl=0,Mleft=0,Mright=0
  const I=i.b*Math.pow(i.h,3)/12
  if(i.support==='cantilever'){
    RA=q*L+P; RB=0; Vmax=Math.abs(RA)
    Mleft=-(q*L*L/2+P*a); Mmax=Math.abs(Mleft)
    defl=(q*Math.pow(L,4)/(8*i.E*1e6*I))+(P*Math.pow(a,2)*(3*L-a)/(6*i.E*1e6*I))
  }else if(i.support==='fixed-fixed'){
    RA=(q*L+P)/2; RB=RA
    Mleft=-(q*L*L/12+P*(L-a)*(L-a)*(L+2*a)/(L*L*L))
    Mright=-(q*L*L/12+P*a*a*(3*L-2*a)/(L*L*L))
    Vmax=Math.max(Math.abs(RA),Math.abs(RB))
    Mmax=Math.max(Math.abs(Mleft),Math.abs(Mright),Math.abs(q*L*L/24+P*L/8))
    defl=(q*Math.pow(L,4)/(384*i.E*1e6*I))*0.4
  }else if(i.support==='propped'){
    // aproximação clássica para consola escorada sob q + P
    RB=3*q*L/8 + P*Math.pow(a,2)*(3*L-a)/(2*Math.pow(L,3))
    RA=q*L+P-RB
    Mleft=-(q*L*L/2+P*a-RB*L)
    Vmax=Math.max(Math.abs(RA),Math.abs(RB))
    Mmax=Math.max(Math.abs(Mleft),Math.abs(q*L*L/8+P*L/4))
    defl=0
  }else{
    RB=(q*L*(L/2)+P*a)/L; RA=q*L+P-RB
    Vmax=Math.max(Math.abs(RA),Math.abs(RB))
    const x=Math.max(0,Math.min(L,RA/Math.max(q,1e-9)))
    Mmax=Math.abs(RA*x-q*x*x/2)
    if(P>0){
      const Mp=RA*a-q*a*a/2
      if(Math.abs(Mp)>Mmax)Mmax=Math.abs(Mp)
    }
    defl=5*q*Math.pow(L,4)/(384*i.E*1e6*I)
  }

  const d=Math.max(i.h-i.cover-0.01,0.05), z=0.9*d, fyd=ec2Fyd(i.fyk)
  const AsReq=Mmax*1e6/Math.max(z*1000*fyd,1e-9)
  const AsMin=0.0013*i.b*i.h*1e6
  const As=Math.max(AsReq,AsMin)
  const shearStress=Vmax*1000/Math.max(i.b*d,1e-9)/1e6
  const spanDepth=L/Math.max(i.h,1e-9)
  const deflectionLimit=L/250
  const deflectionOK=defl<=deflectionLimit
  const crackControlIndex=As/Math.max(i.b*i.h*1e6,1)
  return {RA,RB,Mmax,Vmax,defl,As,AsReq,AsMin,d,z,Mleft,Mright,shearStress,spanDepth,deflectionLimit,deflectionOK,crackControlIndex}
}
