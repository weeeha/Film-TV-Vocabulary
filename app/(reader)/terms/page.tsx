import {DocsPage,DocsTitle} from 'fumadocs-ui/layouts/docs/page';
import {atlas} from '@/lib/atlas';
import {TermBrowser} from '@/components/term-browser';
import {parseFilters} from '@/lib/terms';
export const metadata={title:'Alphabetical index',description:'Browse the film and television vocabulary by word or chapter.'};
export default async function Terms({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const raw=await searchParams;const params=new URLSearchParams();for(const key of ['q','chapter']){const value=raw[key];if(value)params.set(key,Array.isArray(value)?value[0]:value);}
 const chapters=atlas.chapters.map(({id,title})=>({id,title}));const filters=parseFilters(params,chapters.map(c=>c.id));
 const terms=atlas.terms.map(({id,name,chapter_id,chapterTitle,url})=>({id,name,chapter_id,chapterTitle,url}));
 return <DocsPage full breadcrumb={{enabled:false}} footer={{enabled:false}}><p className="eyebrow">The vocabulary, from A to Z</p><DocsTitle>Alphabetical index</DocsTitle><p className="index-intro">Every term, with the chapter that gives it context.</p><TermBrowser terms={terms} chapters={chapters} initialFilters={filters}/></DocsPage>;
}
