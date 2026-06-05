import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Mis Finanzas',
        short_name: 'Finanzas',
        description: 'Controla tus gastos personales de forma simple',
        theme_color: '#10b981',
        background_color: '#10b981',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            // Cache para Google Fonts / GIS script
            urlPattern: /^https:\/\/accounts\.google\.com\/gsi\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'google-gis' },
          },
        ],
      },
    }),
  ],
})
