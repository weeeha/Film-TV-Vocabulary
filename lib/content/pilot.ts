import { readFile,access } from 'node:fs/promises';
import { join } from 'node:path';
import { hash } from './catalog';
import { assetDir,pilotPath } from './routes';
import type { Catalog,PublicAsset } from './types';
export async function validatePilot(root:string,c:Catalog):Promise<{included:boolean;reasons:string[];assets:PublicAsset[]}>{
 const reasons:string[]=[],assets:PublicAsset[]=[];
 try{
  await access(join(root,pilotPath));await access(join(root,assetDir,'prompts.json'));
  const m=JSON.parse(await readFile(join(root,assetDir,'manifest.json'),'utf8'));
  if(m.asset_count!==12||m.assets?.length!==12)throw new Error('Pilot must declare its 12 illustrations');
  const ids=new Set<string>();
  for(const a of m.assets){
   if(!/^\d{2}-[a-z-]+$/.test(a.id)||ids.has(a.id))throw new Error('Invalid or duplicate asset ID');
   ids.add(a.id);
   if(a.file!==assetDir+'/'+a.id+'.png'||!c.entries.some(e=>e.id===a.term_id))throw new Error('Invalid asset path or vocabulary reference: '+a.id);
   const b=await readFile(join(root,a.file));
   if(hash(b)!==a.sha256||b.length!==a.bytes)throw new Error('Asset hash/size mismatch: '+a.file);
   if(b.toString('hex',0,8)!=='89504e470d0a1a0a'||b.readUInt32BE(16)!==a.width||b.readUInt32BE(20)!==a.height)throw new Error('Invalid PNG dimensions: '+a.file);
   assets.push({sourcePath:a.file,url:'/generated/'+a.file,sha256:a.sha256,width:a.width,height:a.height});
  }
 }catch(e){reasons.push(String(e));}
 return {included:reasons.length===0,reasons,assets:reasons.length?[]:assets};
}
