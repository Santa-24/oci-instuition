import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OCI Master Admin — Operational Command Center',
  description: 'Central operations and academic management command center for Odisha Competitive Institute (OCI).',
  icons: {
    icon: '/oci-logo.svg',
    shortcut: '/favicon.ico',
    apple: '/oci-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
