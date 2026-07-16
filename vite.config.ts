import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { pwaOptions } from './src/pwaConfig';

export default defineConfig({
    plugins: [react(), VitePWA(pwaOptions)],
    build: {
        outDir: 'dist',
    },
});
