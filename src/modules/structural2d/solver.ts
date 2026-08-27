import type {Model2D,MemberResult} from './types'
export function analyseModel(m:Model2D){
  const totalFx=m.nodes.reduce((s,n)=>s+(n.Fx||0),0)
  const totalFy=m.nodes.reduce((s,n)=>s+(n.Fy||0),0)
  const supported=m.nodes.filter(n=>n.support && n.support!=='free')
  const reactions=supported.map((n,i)=>({
    node:n.id,
    Rx:i===0?-totalFx:0,
    Ry:-totalFy/Math.max(supported.length,1)
  }))
  const members:MemberResult[]=m.members.map(e=>{
    const a=m.nodes.find(n=>n.id===e.a)!, b=m.nodes.find(n=>n.id===e.b)!
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)
    const loadProjection=((a.Fx||0)+(b.Fx||0))*Math.cos(angle)+((a.Fy||0)+(b.Fy||0))*Math.sin(angle)
    return {id:e.id,L,angle:angle*180/Math.PI,axialApprox:-loadProjection/2}
  })
  return {totalFx,totalFy,reactions,members}
}
