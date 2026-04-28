import Header from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-7">
        {children}
      </main>

      <footer className="border-t border-brand-gray-border bg-white py-3 text-center text-[11px] sm:text-xs text-brand-navy/40 font-medium">
        MamaCare © {new Date().getFullYear()} - Maternal Health Monitoring System
      </footer>
    </div>
  );
}