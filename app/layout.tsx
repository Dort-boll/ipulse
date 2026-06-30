import type {Metadata} from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { PulseProvider } from '@/lib/pulse-store';
import './globals.css'; 

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'iPulse | Real-Time Internet Infrastructure Intelligence Device',
  description: 'The Internet\'s Pulse. Live real-time status and cascading failure mapping for global cloud networks.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-black font-sans antialiased text-gray-200 min-h-screen selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
        <PulseProvider>
          {children}
        </PulseProvider>
      </body>
    </html>
  );
}

