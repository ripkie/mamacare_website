import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <p className="font-display font-bold text-7xl text-brand-yellow2">404</p>
        <h2 className="font-bold text-xl text-brand-navy">Halaman tidak ditemukan</h2>
        <p className="text-brand-navy/50 text-sm max-w-xs">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-2 px-5 py-2.5 bg-brand-yellow2 text-brand-navy font-bold text-sm rounded-xl hover:bg-brand-yellow1 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
