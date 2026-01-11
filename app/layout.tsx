import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TRACE — Public Footprints Intelligence',
  description: 'Map public GitHub signals onto an interactive globe.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-white">
        {children}
      </body>
    </html>
  );
}
