import ThemeRegistry from '@/theme/ThemeRegistry';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'AltinoLite',
  description: 'AltinoLite iframe',
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<p>Loading...</p>}>
          <ThemeRegistry>{children}</ThemeRegistry>
        </Suspense>
      </body>
    </html>
  );
}
