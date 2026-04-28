'use client';

import { type ActiveSession } from '@/lib/firebase';
import { UserRound, Stethoscope, Clock, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface ActiveSessionCardProps {
  session: ActiveSession;
}

export default function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  const updatedAt = session.updatedAt?.toDate?.();

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-yellow1/30 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-4 bg-brand-yellow1/10 border-b border-brand-yellow1/20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
            Sesi Aktif
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-yellow1/20 flex items-center justify-center shrink-0">
            <UserRound size={20} className="text-brand-yellow2" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
              Pasien
            </p>
            <p className="font-bold text-brand-navy text-base leading-tight truncate">
              {session.patientName}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/[0.08] flex items-center justify-center shrink-0">
            <Stethoscope size={20} className="text-brand-navy/60" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
              Petugas
            </p>
            <p className="font-bold text-brand-navy text-base leading-tight truncate">
              {session.nurseName}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gray-soft flex items-center justify-center shrink-0">
            <Hash size={18} className="text-brand-navy/40" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
              Patient ID
            </p>
            <p className="font-mono text-[11px] text-brand-navy/70 mt-0.5 break-all leading-snug">
              {session.patientId}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gray-soft flex items-center justify-center shrink-0">
            <Clock size={18} className="text-brand-navy/40" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">
              Dibuat
            </p>
            <p className="text-sm font-medium text-brand-navy/70">
              {updatedAt
                ? format(updatedAt, 'dd MMM yyyy, HH:mm', { locale: localeId })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}