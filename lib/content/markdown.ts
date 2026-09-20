import { unified } from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import stringify from 'remark-stringify';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { RootContent,Heading } from 'mdast';
import type { Catalog,RouteRegistry,PreparedPage,SearchRecord } from './types';
import { resolveLink,pilotPath } from './routes';
export const parser=unified().use(parse).use(gfm);
export const plain=(text:string)=>toString(parser.parse(text));
export const legacyAnchor=(text:string)=>text.replace(/[`*_]/g,'').toLowerCase().trim().replace(/[^\p{L}\p{N}_\- ]/gu,'').replaceAll(' ','-');
export function prepareDocument(sourcePath:string,markdown:string,c:Catalog,r:RouteRegistry):PreparedPage {
 const tree=parser.parse(markdown),url=r.get(sourcePath)!;
 const h1=tree.children.find(n=>n.type==='heading'&&n.depth===1) as Heading|undefined;
 const title=h1?toString(h1):sourcePath;
 const anchors:string[]=[],headingIds:string[]=[],termAnchors:Record<string,string>={},links:string[]=[];
 const counter=new Map<string,number>(),headingMap=new Map<RootContent,string>();
 for(const node of tree.children)if(node.type==='heading'){
  const base=legacyAnchor(toString(node)),count=counter.get(base)||0;
  counter.set(base,count+1);const id=base+(count?'-'+count:'');
  anchors.push(id);headingMap.set(node,id);if(node!==h1)headingIds.push(id);
 }
 for(let i=0;i<tree.children.length;i++){
  const n=tree.children[i];
  if(n.type==='html'){
   const id=n.value.match(/^<!-- term-id: ([a-z0-9.-]+) -->$/)?.[1];
   if(id){
    const heading=tree.children[i-1];
    if(!heading||heading.type!=='heading'||heading.depth!==3)throw new Error(sourcePath+': term ID without heading');
    const e=c.entries.find(e=>e.id===id),headingId=headingMap.get(heading)!;
    if(!e||e.source_path!==sourcePath||e.name!==toString(heading)||e.anchor!==headingId)throw new Error(sourcePath+': catalog/heading disagreement '+id);
    termAnchors[headingId]=id;anchors.push(id);
   }else if(!/^<!--[\s\S]*-->$/.test(n.value))throw new Error(sourcePath+': unsupported HTML');
  }
 }
 if(new Set(anchors).size!==anchors.length)throw new Error(sourcePath+': duplicate anchor');
 tree.children=tree.children.filter(n=>{
  if(n===h1||n.type==='html')return false;
  if(n.type==='paragraph'&&toString(n).startsWith('Wiki home'))return false;
  if(!r.has(pilotPath)&&n.type==='paragraph'&&toString(n).startsWith('Illustrated pilot:'))return false;
  return true;
 });
 visit(tree,(n,index,parent)=>{
  if(n.type==='html'&&/^<br\s*\/?\s*>$/i.test(n.value)&&parent&&index!==undefined){parent.children[index]={type:'break'};return;}
  if(n.type==='link'||n.type==='image'||n.type==='definition'){n.url=resolveLink(sourcePath,n.url,r);links.push(n.url);}
  if(n.type==='html')throw new Error(sourcePath+': unsupported inline HTML');
 });
 const sections:SearchRecord[]=[];
 let sectionTitle=title,sectionId='',parts:string[]=[],isTerm=false;
 const flush=()=>{
  const text=parts.join(' ').trim();
  if(text&&!isTerm)sections.push({id:sourcePath+'#'+sectionId,title:sectionTitle,context:title.replace(/^\d+\s*·\s*/,''),text,url:url+(sectionId?'#'+sectionId:''),kind:'section'});
  parts=[];
 };
 for(const n of tree.children){
  if(n.type==='heading'){flush();sectionTitle=toString(n);sectionId=headingMap.get(n)!;isTerm=!!termAnchors[sectionId];}
  else if(n.type!=='code')parts.push(toString(n));
 }flush();
 const first=tree.children.find(n=>n.type==='paragraph');
 return {sourcePath,url,slug:url.slice(1).split('/'),title,titleId:h1?headingMap.get(h1)!:legacyAnchor(title),summary:first?toString(first):'',markdown:unified().use(stringify,{bullet:'-',fences:true}).use(gfm).stringify(tree),anchors,headingIds,termAnchors,links,sections};
}
