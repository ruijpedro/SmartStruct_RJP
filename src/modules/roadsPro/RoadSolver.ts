export function curveRadius(V:number,e:number,f:number){
  const R=V*V/(127*Math.max(e+f,1e-9))
  return {R}
}
export function earthworks(length:number,cutArea:number,fillArea:number){
  return {cut:length*cutArea,fill:length*fillArea,balance:length*(cutArea-fillArea)}
}
export function pavementQuantities(area:number,layers:{name:string,t:number}[]){
  return layers.map(x=>({...x,volume:area*x.t}))
}
export function roundaboutGeometry(Dext:number,Dins:number){
  return {ring:(Dext-Dins)/2,area:Math.PI*(Dext*Dext-Dins*Dins)/4}
}
