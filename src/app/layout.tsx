import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crew Property',
  description: 'Private landlord management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
