import {ec2Fcd,ec2Fyd} from '../../engineering/structuralMath'
export type ColumnInput={N:number;Mx:number;My:number;b:number;h:number;L:number;fck:number;fyk:number;k:number}
export function solveColumn(i:ColumnInput){
  const A=i.b*i.h, Ix=i.b*Math.pow(i.h,3)/12, Iy=i.h*Math.pow(i.b,3)/12
  const rx=Math.sqrt(Ix/A), ry=Math.sqrt(Iy/A)
  const le=i.k*i.L
  const lambdaX=le/Math.max(rx,1e-9), lambdaY=le/Math.max(ry,1e-9), slender=Math.max(lambdaX,lambdaY)
  const sigN=i.N/Math.max(A,1e-9)/1000
  const sx=Math.abs(i.Mx)*6/(Math.max(i.b*i.h*i.h,1e-9))*0.001
  const sy=Math.abs(i.My)*6/(Math.max(i.h*i.b*i.b,1e-9))*0.001
  const sigMax=sigN+sx+sy
  const fcd=ec2Fcd(i.fck),util=sigMax/Math.max(fcd,1e-9)
  const fyd=ec2Fyd(i.fyk)
  const AsMin=.002*A*1e6
  const AsMax=.04*A*1e6
  const AsReq=Math.min(AsMax,Math.max(AsMin,(i.N*1000)/(0.87*fyd)*0.15))
  const secondOrderFactor=slender>70?1.15:slender>50?1.08:1.0
  const Mx2=i.Mx*secondOrderFactor, My2=i.My*secondOrderFactor
  const interaction=Math.abs(i.N)/(Math.max(A*fcd*1000,1e-9)) +
    Math.abs(Mx2)/(Math.max(fcd*i.b*i.h*i.h/6*1000,1e-9)) +
    Math.abs(My2)/(Math.max(fcd*i.h*i.b*i.b/6*1000,1e-9))
  return {A,Ix,Iy,rx,ry,le,lambdaX,lambdaY,slender,sigN,sigMax,fcd,util,AsMin,AsMax,AsReq,secondOrderFactor,Mx2,My2,interaction}
}
