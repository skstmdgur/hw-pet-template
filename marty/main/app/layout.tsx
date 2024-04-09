import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { Metadata } from 'next'
import theme from '../src/theme'

export const metadata: Metadata = {
  title: 'Marty Iframe',
  description: 'marty iframe',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
