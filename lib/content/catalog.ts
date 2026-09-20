import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { z } from 'zod';
import type { Catalog } from './types';
const label=z.string().min(1);
const chapter=z.object({id:label.regex(/^[a-z0-9-]+$/),number:z.number().int().positive(),title:label,source_path:label.regex(/^wiki\/[0-9]{2}-[a-z0-9-]+\.md$/),entry_count:z.number().int().positive(),word_count:z.number().int().positive(),sha256:label.regex(/^[a-f0-9]{64}$/)});
const entry=z.object({id:label.regex(/^[a-z0-9-]+\.[a-z0-9.-]+$/),name:label,chapter_id:label,group:label,definition:label,use:label,example:label,source_path:label,anchor:label});
const schema=z.object({chapter_count:z.number().int(),entry_count:z.number().int(),chapters:z.array(chapter),entries:z.array(entry)});
export const hash=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
export async function loadCatalog(root:string):Promise<Catalog>{
 const c=schema.parse(JSON.parse(await readFile(join(root,'data/catalog.json'),'utf8')));
 if(c.chapter_count!==c.chapters.length||c.entry_count!==c.entries.length)throw new Error('Catalog counts disagree');
 for(const [name,items] of [['chapter',c.chapters],['term',c.entries]] as const)
  if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Duplicate '+name+' IDs');
 const chapters=new Map(c.chapters.map(ch=>[ch.id,ch]));
 for(const e of c.entries)if(chapters.get(e.chapter_id)?.source_path!==e.source_path)throw new Error('Unknown chapter/source for '+e.id);
 for(const ch of c.chapters){
  if(hash(await readFile(join(root,ch.source_path)))!==ch.sha256)throw new Error(ch.source_path+': stale catalog hash; run npm run content:build');
  if(c.entries.filter(e=>e.chapter_id===ch.id).length!==ch.entry_count)throw new Error(ch.source_path+': entry count mismatch');
 }
 return c;
}
