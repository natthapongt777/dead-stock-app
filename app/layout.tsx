import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dead Stock Management',
  description: 'Sales team action plan tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dead Stock',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta name="theme-color" content="#1e3a8a" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
