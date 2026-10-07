import {assertPath} from './assets.js';
/** Inspect raw central-directory names before JSZip can normalize traversal or collapse duplicates. */
export function inspectZip(bytes:Uint8Array):{names:string[];uncompressedBytes:number} {
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50&&i+22+view.getUint16(i+20,true)===bytes.length){end=i;break;}
 if(end<0)throw Error('Not a valid ZIP package.');
 const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),start=view.getUint32(end+16,true);
 if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||view.getUint16(end+8,true)!==count||count===65535||start+size>end||count>10000)throw Error('Unsupported multi-volume/ZIP64 archive or package exceeds 10,000 entries.');
 let offset=start,total=0;const names:string[]=[];const seen=new Set<string>();const folded=new Set<string>();
 try{for(let i=0;i<count;i++){
  if(view.getUint32(offset,true)!==0x02014b50)throw Error('Invalid ZIP directory.');
  const flags=view.getUint16(offset+8,true),n=view.getUint16(offset+28,true),extra=view.getUint16(offset+30,true),comment=view.getUint16(offset+32,true);if(flags&1)throw Error('Encrypted ZIP packages are not supported.');
  const local=view.getUint32(offset+42,true);if(view.getUint32(local,true)!==0x04034b50)throw Error('Invalid local ZIP header.');const localN=view.getUint16(local+26,true),localExtra=view.getUint16(local+28,true);const localName=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(local+30,local+30+localN));
  const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(offset+46,offset+46+n));if(localName!==raw)throw Error('Conflicting local/central ZIP filename.');
  const checkExtra=(start:number,length:number)=>{let p=start;while(p<start+length){const id=view.getUint16(p,true),size=view.getUint16(p+2,true);if(p+4+size>start+length)throw Error('Invalid ZIP extra field.');if(id===0x7075){const name=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(p+9,p+4+size));if(name!==raw)throw Error('Conflicting Unicode ZIP path.');}p+=4+size;}};checkExtra(offset+46+n,extra);checkExtra(local+30+localN,localExtra);
  const path=raw.endsWith('/')?raw.slice(0,-1):raw;assertPath(path);
  if(seen.has(raw)||folded.has(raw.toLowerCase()))throw Error(`Duplicate/conflicting ZIP path: ${raw}`);seen.add(raw);folded.add(raw.toLowerCase());names.push(raw);
  total+=view.getUint32(offset+24,true);if(total>256*1024*1024)throw Error('Package expands beyond the 256 MiB safe-load limit.');offset+=46+n+extra+comment;
 }if(offset!==start+size)throw Error('Invalid ZIP directory length.');}catch(e){if(e instanceof RangeError)throw Error('Truncated ZIP package.');throw e;}
 return {names,uncompressedBytes:total};
}
