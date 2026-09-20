import type { Root, Node } from 'fumadocs-core/page-tree';
import type { PreparedAtlas } from './content/types';
export const families = [
 {title:'Story & characters',start:1,end:8},
 {title:'World, scenes & performance',start:9,end:13},
 {title:'Image, sound & construction',start:14,end:22},
];
export function buildNavigation(atlas: PreparedAtlas): Root {
 const children: Node[] = [{type:'page',name:'Explore the atlas',url:'/'},{type:'page',name:'Alphabetical index',url:'/terms'}];
 for (const family of families) {
  children.push({type:'separator',name:family.title});
  children.push(...atlas.chapters.filter(c=>c.number>=family.start&&c.number<=family.end).map(c=>({type:'page' as const,name:c.title.replace(/^\d+ · /,''),url:'/wiki/'+c.id})));
 }
 children.push({type:'separator',name:'Guides & examples'});
 children.push(...atlas.pages.filter(p=>!p.url.startsWith('/wiki/')&&!p.url.startsWith('/reference/')).map(p=>({type:'page' as const,name:p.title,url:p.url})));
 return {name:'Film & TV Atlas',children};
}
