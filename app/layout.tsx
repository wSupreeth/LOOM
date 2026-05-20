import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ContentFlow - AI Content Pipeline Automation',
  description: 'Generate, draft, and optimize content in minutes. Powered by AI.',
  openGraph: {
    title: 'ContentFlow - AI Content Pipeline Automation',
    description: 'Generate, draft, and optimize content in minutes. Powered by AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}