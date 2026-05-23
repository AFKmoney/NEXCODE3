import type {Metadata} from 'next';
import './globals.css';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'NexusCode Mobile IDE',
  description: 'Prototypage de l\'IDE Mobile IA NexusCode',
  manifest: '/manifest.json',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-black text-gray-200">{children}</body>
    </html>
  );
}
