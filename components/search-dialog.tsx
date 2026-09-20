'use client';
import {useEffect,useRef,useState} from 'react';
import {SearchDialog,SearchDialogHeader,SearchDialogInput,SearchDialogClose,SearchDialogOverlay,SearchDialogContent,SearchDialogList,SearchDialogListItem,type SharedProps,type SearchItemType} from 'fumadocs-ui/components/dialog/search';
import {loadSearchRecords,searchRecords} from '@/lib/search';
import type {SearchRecord} from '@/lib/content/types';
type SearchState={status:'idle'}|{status:'loading'}|{status:'ready';records:SearchRecord[]}|{status:'error'};
export default function AtlasSearchDialog(props:SharedProps) {
 const [query,setQuery]=useState('');const [state,setState]=useState<SearchState>({status:'idle'});const [attempt,setAttempt]=useState(0);const opener=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(!props.open)return;let live=true;setState({status:'loading'});loadSearchRecords().then(records=>{if(live)setState({status:'ready',records});},()=>{if(live)setState({status:'error'});});return()=>{live=false;};},[props.open,attempt]);
 const found=state.status==='ready'?searchRecords(state.records,query):[];
 const items:SearchItemType[]=found.map(r=>({id:r.id,url:r.url,type:'page',content:r.title}));
 return <SearchDialog {...props} search={query} onSearchChange={setQuery} isLoading={state.status==='loading'}><SearchDialogOverlay/><SearchDialogContent onOpenAutoFocus={()=>{opener.current=document.activeElement as HTMLElement;}} onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus();}}><SearchDialogHeader><SearchDialogInput aria-label="Search the atlas" placeholder="Search terms, definitions, examples…"/><SearchDialogClose>Esc</SearchDialogClose></SearchDialogHeader>
 {state.status==='loading'?<p className="search-message" role="status">Loading search…</p>:state.status==='error'?<div className="search-message" role="alert"><p>Search could not load. Try again or browse a chapter.</p><button className="primary-link" onClick={()=>setAttempt(a=>a+1)}>Retry</button><a href="/">Browse chapters</a></div>:!query.trim()?<p className="search-message">Search terms, definitions, and examples.</p>:<SearchDialogList role="listbox" aria-label="Search results" items={items} Empty={()=><p className="search-message">No results for “{query}”. Try another word.</p>} Item={({item,onClick})=>{const record=found.find(r=>r.id===item.id)!;return <SearchDialogListItem item={item} onClick={onClick} role="option"><span className="search-result-title">{record.title}</span><span className="search-result-context">{record.context}</span><span className="search-result-excerpt">{record.text.slice(0,150)}{record.text.length>150?'…':''}</span></SearchDialogListItem>;}}/>}
 </SearchDialogContent></SearchDialog>;
}
