import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dead Stock Management',
  description: 'Sales team action plan tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
