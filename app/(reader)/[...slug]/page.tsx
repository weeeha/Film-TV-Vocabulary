import { notFound } from 'next/navigation';
import { DocsPage,DocsTitle,DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { atlas } from '@/lib/atlas';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx-components';
export function generateStaticParams(){return source.getPages().map(p=>({slug:p.slugs}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}) {
 const {slug}=await params;const page=atlas.pages.find(p=>p.slug.join('/')===slug.join('/'));
 return {title:page?.title,description:page?.summary};
}
export default async function Page({params}:{params:Promise<{slug:string[]}>}) {
 const {slug}=await params;const page=source.getPage(slug);if(!page)notFound();
 const prepared=atlas.pages.find(p=>p.url===page.url);if(!prepared)notFound();
 const Body=page.data.body;
 return <DocsPage toc={page.data.toc}><DocsTitle id={prepared.titleId}>{prepared.title}</DocsTitle><DocsBody className="atlas-prose"><Body components={getMDXComponents(prepared)}/></DocsBody><noscript><nav aria-label="Chapter index"><h2>Explore more chapters</h2>{atlas.chapters.map(c=><p key={c.id}><a href={'/wiki/'+c.id}>{c.title}</a></p>)}</nav></noscript></DocsPage>;
}
