import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MamaCare — Monitoring Tekanan Darah Ibu Hamil',
  description: 'Dashboard IoT realtime untuk monitoring tekanan darah pasien ibu hamil dan deteksi preeklamsia.',
  icons: {
    icon: '/logo-mamacare.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FAFAF8]">{children}</body>
    </html>
  );
}
