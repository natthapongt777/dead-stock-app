import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dead Stock Management',
    short_name: 'Dead Stock',
    description: 'Sales team action plan tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e3a8a',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
