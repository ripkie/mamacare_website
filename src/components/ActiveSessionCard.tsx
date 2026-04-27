'use client';

import { useState } from 'react';
import { updateSessionMode, type ActiveSession, type MeasurementMode } from '@/lib/firebase';
import { UserRound, Stethoscope, Clock, Hash, Loader2 } from 'lucide-react';
import ModeBadge from './ModeBadge';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import clsx from 'clsx';

interface ActiveSessionCardProps {
  session: ActiveSession;
}

export default function ActiveSessionCard({ session }: ActiveSessionCardProps) {
  const [switching, setSwitching] = useState(false);

  const handleModeSwitch = async (newMode: MeasurementMode) => {
    if (newMode === session.mode) return;
    setSwitching(true);
    try {
      await updateSessionMode(newMode);
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const updatedAt = session.updatedAt?.toDate?.();

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-yellow1/30 overflow-hidden animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-brand-yellow1/10 border-b border-brand-yellow1/20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Sesi Aktif</span>
        </div>
        <ModeBadge mode={session.mode} size="sm" />
      </div>

      {/* Info grid */}
      <div className="p-5 grid grid-cols-2 gap-4">
        {/* Patient */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-yellow1/20 flex items-center justify-center shrink-0">
            <UserRound size={20} className="text-brand-yellow2" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Pasien</p>
            <p className="font-bold text-brand-navy text-base leading-tight truncate">{session.patientName}</p>
          </div>
        </div>

        {/* Nurse */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/[0.08] flex items-center justify-center shrink-0">
            <Stethoscope size={20} className="text-brand-navy/60" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Petugas</p>
            <p className="font-bold text-brand-navy text-base leading-tight truncate">{session.nurseName}</p>
          </div>
        </div>

        {/* Patient ID */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gray-soft flex items-center justify-center shrink-0">
            <Hash size={18} className="text-brand-navy/40" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Patient ID</p>
            <p className="font-mono text-[11px] text-brand-navy/70 mt-0.5 break-all leading-snug">{session.patientId}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gray-soft flex items-center justify-center shrink-0">
            <Clock size={18} className="text-brand-navy/40" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Dibuat</p>
            <p className="text-sm font-medium text-brand-navy/70">
              {updatedAt
                ? format(updatedAt, 'dd MMM yyyy, HH:mm', { locale: localeId })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="px-5 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45 mb-2">Ubah Mode</p>
        <div className="flex gap-2">
          {(['single', 'rot'] as MeasurementMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              disabled={switching}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]',
                session.mode === m
                  ? 'bg-brand-yellow2 text-brand-navy cursor-default'
                  : 'bg-brand-gray-soft text-brand-navy/50 hover:bg-brand-yellow1/20 hover:text-brand-navy'
              )}
            >
              {switching && session.mode !== m && <Loader2 size={14} className="animate-spin" />}
              {m === 'single' ? 'Single' : 'ROT'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
