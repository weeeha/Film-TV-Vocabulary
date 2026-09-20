import { prepareAtlas } from '../lib/content/prepare';
import { mkdir,writeFile,copyFile,rm,rename } from 'node:fs/promises';
import { dirname,join } from 'node:path';
const atlas=await prepareAtlas(process.cwd()),staging='.atlas-preparation';
await rm(staging,{recursive:true,force:true});
await mkdir(staging+'/content',{recursive:true});await mkdir(staging+'/public',{recursive:true});
try{
 for(const p of atlas.pages){
  const dest=join(staging,'content',p.slug.join('/')+'.md');await mkdir(dirname(dest),{recursive:true});
  await writeFile(dest,'---\ntitle: '+JSON.stringify(p.title)+'\ndescription: '+JSON.stringify(p.summary)+'\n---\n\n'+p.markdown);
 }
 await writeFile(staging+'/atlas.json',JSON.stringify(atlas));await writeFile(staging+'/public/search.json',JSON.stringify(atlas.search));
 for(const a of atlas.assets){
  const suffix=a.url.startsWith('/downloads/')?'downloads/'+a.url.split('/').at(-1):a.url.slice('/generated/'.length);
  const dest=join(staging,'public',suffix);await mkdir(dirname(dest),{recursive:true});await copyFile(a.sourcePath,dest);
 }
 await mkdir('.generated',{recursive:true});await mkdir('public',{recursive:true});
 await rm('.generated/content',{recursive:true,force:true});await rm('public/generated',{recursive:true,force:true});
 await rename(staging+'/content','.generated/content');await rename(staging+'/atlas.json','.generated/atlas.json');await rename(staging+'/public','public/generated');
 console.log('Prepared '+atlas.pages.length+' pages, '+atlas.terms.length+' terms; lighting pilot '+(atlas.pilot.included?'included':'excluded: '+atlas.pilot.reasons.join('; ')));
}finally{await rm(staging,{recursive:true,force:true});}
