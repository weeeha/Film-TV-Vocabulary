'use client';
import {RootProvider} from 'fumadocs-ui/provider/next';
import AtlasSearchDialog from '@/components/search-dialog';
export function Providers({children}:{children:React.ReactNode}) {return <RootProvider search={{SearchDialog:AtlasSearchDialog,preload:false}}>{children}</RootProvider>;}
