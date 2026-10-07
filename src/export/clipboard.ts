export interface ClipboardWriter {writeText(text:string):Promise<void>}
export interface CopyResult {copied:boolean;message:string}
export async function copyText(text:string,label:string,clipboard?:ClipboardWriter):Promise<CopyResult> {
 try{if(!clipboard)throw new Error('Clipboard unavailable');await clipboard.writeText(text);return {copied:true,message:`${label} copied.`};}catch{return {copied:false,message:`Clipboard unavailable. Select the ${label.toLowerCase()} below to copy manually, or download the text.`};}
}
export function browserClipboard():ClipboardWriter|undefined {try{return navigator.clipboard;}catch{return undefined;}}
/** Text-file fallback only; no ZIP/PDF/project packaging or transient URL in production state. */
export function downloadText(text:string,filename:string,mediaType='text/plain'):void {
 const url=URL.createObjectURL(new Blob([text],{type:mediaType}));const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
