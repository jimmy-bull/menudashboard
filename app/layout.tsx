import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ming Xuan Dashboard',
  description: 'Ming Xuan Dashboard',
  generator: 'Ming Xuan Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
