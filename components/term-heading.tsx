import type { ReactNode } from 'react';
export function TermHeading({legacyId,stableId,children}:{legacyId:string;stableId?:string;children:ReactNode}) {
 return <h3 id={legacyId} className={stableId?'term-heading':undefined}>{stableId&&<span id={stableId} className="term-anchor"/>}{children}{stableId&&<a href={'#'+stableId} className="term-permalink" aria-label={'Link to '+String(children)}>#</a>}</h3>;
}
