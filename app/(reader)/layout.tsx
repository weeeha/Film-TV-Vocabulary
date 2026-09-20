import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { atlas } from '@/lib/atlas';
import { buildNavigation } from '@/lib/navigation';
export default function Layout({children}:{children:React.ReactNode}) {
 return <DocsLayout tree={buildNavigation(atlas)} nav={{title:<span className="atlas-brand"><span aria-hidden="true">◧</span> Film & TV Atlas</span>}} searchToggle={{enabled:false}} sidebar={{collapsible:false}}>{children}</DocsLayout>;
}
