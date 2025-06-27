import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import '../globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}

