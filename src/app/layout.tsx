import './globals.scss';
import type { PropsWithChildren } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <header>Header</header>
        {children}
      </body>
    </html>
  );
}
