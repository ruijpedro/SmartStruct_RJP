export type Node2D={id:number,x:number,y:number,support?:'free'|'pin'|'roller'|'fixed',Fx?:number,Fy?:number,M?:number}
export type Member2D={id:number,a:number,b:number,E:number,A:number,I:number,label?:string}
export type Model2D={nodes:Node2D[],members:Member2D[]}
export type MemberResult={id:number,L:number,angle:number,axialApprox:number}
