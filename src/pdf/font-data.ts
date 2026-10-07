/** Static hosts may decode gzip via Content-Encoding or return the compressed file unchanged. */
export async function decodeFontResponse(response:Response):Promise<Uint8Array>{
 if(!response.ok)throw Error('Dossier fallback font could not be loaded.');
 const bytes=new Uint8Array(await response.arrayBuffer());
 if(bytes[0]!==0x1f||bytes[1]!==0x8b)return bytes;
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
 return new Uint8Array(await new Response(stream).arrayBuffer());
}
