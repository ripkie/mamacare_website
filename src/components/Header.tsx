'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserRound, Activity, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/patients', label: 'Pasien', icon: UserRound },
  { href: '/history', label: 'Riwayat', icon: ClipboardList },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-gray-border shadow-soft">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 sm:h-18 lg:h-20">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 shrink-0">
              <Image
                src="/logo-mamacare.png"
                alt="MamaCare Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold text-lg lg:text-xl text-brand-navy tracking-tight">
                MamaCare
              </span>
              <span className="text-[10px] font-medium text-brand-navy/50 uppercase tracking-widest -mt-0.5">
                Monitoring System
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== '/' && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                    active
                      ? 'bg-brand-yellow1 text-brand-navy shadow-sm'
                      : 'text-brand-navy/60 hover:bg-brand-yellow1/15 hover:text-brand-navy'
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-medium text-brand-navy/50 shrink-0">
            <Activity size={15} className="text-green-500" />
            <span>Realtime</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}