import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Liga Nacional De Lucha Bolivia',
        short_name: 'LNL Bolivia',
        description: 'El sitio oficial de la Liga Nacional de Lucha de Bolivia. Eventos, noticias y el mejor wrestling del país.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#000000',
        theme_color: '#DC2626',
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icons/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        categories: ['sports', 'entertainment'],
    }
}
