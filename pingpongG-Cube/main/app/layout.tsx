import ThemeRegistry from '@/theme/ThemeRegistry'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Codiny Hw Iframe',
  description: 'codiny hw iframe',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
