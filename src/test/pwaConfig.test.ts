import { describe, expect, it } from 'vitest';

import { HN_API_ORIGIN, pwaOptions } from '../pwaConfig';

describe('pwaOptions', () => {
    it('auto-updates the service worker', () => {
        expect(pwaOptions.registerType).toBe('autoUpdate');
    });

    it('has correct manifest metadata', () => {
        const manifest = pwaOptions.manifest;
        expect(manifest).toBeTruthy();
        if (!manifest || typeof manifest === 'boolean') throw new Error('manifest missing');
        expect(manifest.name).toBe('React HN');
        expect(manifest.short_name).toBe('React HN');
        expect(manifest.theme_color).toBe('#b92b27');
        expect(manifest.background_color).toBe('#ffffff');
        expect(manifest.display).toBe('standalone');
        expect(manifest.start_url).toBe('/');
    });

    it('references the four android-chrome icon sizes', () => {
        const manifest = pwaOptions.manifest;
        if (!manifest || typeof manifest === 'boolean') throw new Error('manifest missing');
        const sizes = (manifest.icons ?? []).map((icon) => icon.sizes);
        expect(sizes).toEqual(['144x144', '192x192', '256x256', '512x512']);
    });

    it('precaches built assets and falls back to the app-shell for SPA routes', () => {
        const workbox = pwaOptions.workbox;
        expect(workbox?.globPatterns).toContain('**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}');
        expect(workbox?.navigateFallback).toBe('index.html');
    });

    it('runtime-caches the Hacker News API with NetworkFirst', () => {
        const runtimeCaching = pwaOptions.workbox?.runtimeCaching ?? [];
        const hnRule = runtimeCaching.find((rule) => rule.options?.cacheName === 'hn-api');
        expect(hnRule).toBeTruthy();
        expect(hnRule?.handler).toBe('NetworkFirst');
        const pattern = hnRule?.urlPattern as RegExp;
        expect(pattern.test(`${HN_API_ORIGIN}/news?page=1`)).toBe(true);
    });
});
