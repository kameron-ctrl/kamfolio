'use client';

import dynamic from 'next/dynamic';

/** WebGL can't render on the server, so the canvas loads client-side only. */
const MoonCanvasLazy = dynamic(() => import('./MoonCanvas'), { ssr: false });

export default MoonCanvasLazy;
