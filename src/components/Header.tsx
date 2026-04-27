'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserRound, Activity } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/patients', label: 'Pasien', icon: UserRound },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-gray-border shadow-soft">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex items-center justify-between h-20 lg:h-24">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-14 h-14 lg:w-16 lg:h-16 shrink-0">
              <Image
                src="/logo-mamacare.png"
                alt="MamaCare Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-xl lg:text-2xl text-brand-navy tracking-tight">
                MamaCare
              </span>
              <span className="text-[11px] font-medium text-brand-navy/50 uppercase tracking-widest -mt-0.5">
                Monitoring System
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-semibold transition-all min-h-[52px]',
                    active
                      ? 'bg-brand-yellow1 text-brand-navy shadow-sm'
                      : 'text-brand-navy/60 hover:bg-brand-yellow1/15 hover:text-brand-navy'
                  )}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Live indicator */}
          <div className="flex items-center gap-2.5 text-sm font-medium text-brand-navy/50">
            <Activity size={16} className="text-green-500" />
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
