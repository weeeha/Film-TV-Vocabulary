import defaults from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { PreparedPage } from '@/lib/content/types';
import { TermHeading } from './term-heading';
export function getMDXComponents(page:PreparedPage): MDXComponents {
 return {...defaults,
  h3:({id,children})=><TermHeading legacyId={id??''} stableId={page.termAnchors[id??'']}>{children}</TermHeading>,
  table:({children,...props})=><div className="table-scroll" role="region" aria-label="Scrollable reference table" tabIndex={0}><table {...props}>{children}</table></div>,
  pre:({children,...props})=><pre {...props}>{children}</pre>,
 };
}
