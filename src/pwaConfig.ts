import type { VitePWAOptions } from 'vite-plugin-pwa';

export const HN_API_ORIGIN = 'https://node-hnapi.herokuapp.com';

export const pwaOptions: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    // Static assets under public/ are copied into the build output and picked up by
    // workbox.globPatterns (with revisions), so we neither include them again via
    // includeAssets nor let the plugin add the manifest icons separately — doing so
    // produces duplicate precache entries that crash the service worker install.
    includeManifestIcons: false,
    manifest: {
        name: 'React HN',
        short_name: 'React HN',
        icons: [
            { src: '/assets/icons/android-chrome-144x144.png', sizes: '144x144', type: 'image/png' },
            { src: '/assets/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/assets/icons/android-chrome-256x256.png', sizes: '256x256', type: 'image/png' },
            { src: '/assets/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
    },
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
            {
                urlPattern: new RegExp(`^${HN_API_ORIGIN.replace(/[.]/g, '\\.')}/.*`),
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'hn-api',
                    networkTimeoutSeconds: 10,
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24,
                    },
                    cacheableResponse: {
                        statuses: [0, 200],
                    },
                },
            },
        ],
    },
};
