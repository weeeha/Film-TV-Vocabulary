import type {TermRecord} from './content/types';
import {normalize} from './search';
export type TermListItem=Pick<TermRecord,'id'|'name'|'chapter_id'|'chapterTitle'|'url'>;
export type TermFilters={q:string;chapter:string};
export function parseFilters(params:URLSearchParams,ids:string[]):TermFilters {
 const chapter=params.get('chapter')??'';
 return {q:(params.get('q')??'').trim(),chapter:ids.includes(chapter)?chapter:''};
}
export function filterTerms(terms:TermListItem[],filters:TermFilters):TermListItem[] {
 const q=normalize(filters.q);
 return terms.filter(t=>(!filters.chapter||t.chapter_id===filters.chapter)&&normalize(t.name).includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'en')||a.chapterTitle.localeCompare(b.chapterTitle,'en')||a.id.localeCompare(b.id));
}
export function groupTerms(terms:TermListItem[]):Map<string,TermListItem[]> {
 const groups=new Map<string,TermListItem[]>();
 for(const term of terms){const first=normalize(term.name).charAt(0).toUpperCase();const key=/[A-Z]/.test(first)?first:'0–9';groups.set(key,[...(groups.get(key)??[]),term]);}
 return new Map([...groups].sort(([a],[b])=>a.localeCompare(b)));
}
export function filtersUrl(filters:TermFilters) {
 const params=new URLSearchParams();if(filters.q.trim())params.set('q',filters.q.trim());if(filters.chapter)params.set('chapter',filters.chapter);
 return '/terms'+(params.size?'?'+params.toString():'');
}
