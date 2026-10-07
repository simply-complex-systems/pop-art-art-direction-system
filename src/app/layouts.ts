import type {Canvas} from '../state/types.js';
export interface Layout {id:string;name:string;grid:Canvas['grid'];cells:Omit<Canvas['panels'][number],'id'>[]}
const cell=(row:number,column:number,rowSpan=1,columnSpan=1)=>({row,column,rowSpan,columnSpan});
function grid(rows:number,columns:number,name:string):Layout {
  return {id:`grid-${rows}-${columns}`,name,grid:{rows,columns},cells:Array.from({length:rows*columns},(_,i)=>cell(Math.floor(i/columns),i%columns))};
}
function featured(count:number,wide:boolean):Layout {
  // One large panel followed by pairs; prime counts need no empty grid cells.
  const rows=count===3?2:(count-1)/2;
  const columns=count===3?2:3;
  const cells=[cell(0,0,rows,1),...Array.from({length:count-1},(_,i)=>count===3?cell(i,1):cell(Math.floor(i/2),1+i%2))];
  return wide?{id:`featured-${count}-left`,name:'One large + '+(count-1)+' alongside',grid:{rows,columns},cells}
    :{id:`featured-${count}-top`,name:'One large + '+(count-1)+' below',grid:{rows:columns,columns:rows},cells:cells.map(c=>cell(c.column,c.row,c.columnSpan,c.rowSpan))};
}
export function availableLayouts(count:number,ratio:Canvas['aspectRatio']):Layout[] {
  if(!Number.isInteger(count)||count<1||count>12)throw new Error('Basic workspace supports 1–12 panels');
  const a=ratio.width/ratio.height;const wide=a>=1;
  if(count===1)return [grid(1,1,'Single panel')];
  if(count===2)return [grid(1,2,'Side by side'),grid(2,1,'Stacked')];
  if(count===3)return [wide?grid(1,3,'Three columns'):grid(3,1,'Three rows'),featured(3,wide)];
  if(count===4)return [grid(2,2,'2 × 2'),...(a>=1.5?[grid(1,4,'Four columns')]:a<=2/3?[grid(4,1,'Four rows')]:[])];
  if(count===5||count===7||count===11)return [featured(count,wide)];
  const dims=count===6?[2,3]:count===8?[2,4]:count===9?[3,3]:count===10?[2,5]:[3,4];
  const rows=wide?dims[0]!:dims[1]!;const columns=wide?dims[1]!:dims[0]!;
  return [grid(rows,columns,`${rows} × ${columns}`)];
}
export function currentLayout(canvas:Canvas):Layout|undefined {
  if(canvas.panels.length>12)return undefined;
  return availableLayouts(canvas.panels.length,canvas.aspectRatio).find(l=>l.grid.rows===canvas.grid.rows&&l.grid.columns===canvas.grid.columns
    &&l.cells.every((c,i)=>{const p=canvas.panels[i];return p&&p.row===c.row&&p.column===c.column&&p.rowSpan===c.rowSpan&&p.columnSpan===c.columnSpan;}));
}
export function applyLayout(canvas:Canvas,layout:Layout,ratio=canvas.aspectRatio):Canvas {
  const used=new Set(canvas.panels.map(p=>p.id));
  let next=1;
  return {...canvas,aspectRatio:{...ratio},grid:{...layout.grid},panels:layout.cells.map((c,i)=>{
    let id=canvas.panels[i]?.id;
    if(!id) {while(used.has(`panel-${next}`))next++;id=`panel-${next++}`;used.add(id);}
    return {...c,id};
  })};
}
