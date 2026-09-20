import { createMDX } from 'fumadocs-mdx/next';
export default createMDX()({reactStrictMode:true,async rewrites(){return [{source:'/downloads/:file',destination:'/generated/downloads/:file'}];}});
