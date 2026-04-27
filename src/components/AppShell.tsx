import Header from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5 lg:py-8">
        {children}
      </main>
      <footer className="border-t border-brand-gray-border bg-white py-4 text-center text-xs text-brand-navy/40 font-medium">
        MamaCare © {new Date().getFullYear()} — Maternal Health Monitoring System
      </footer>
    </div>
  );
}
