'use client';

import { useState } from 'react';
import { type Patient } from '@/lib/firebase';
import { UserRound, ChevronRight, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import clsx from 'clsx';

interface PatientListProps {
  patients: Patient[];
  selectedId?: string;
  activePatientId?: string;
  onSelect: (patientId: string) => void;
  onSetActive?: (patient: Patient) => Promise<void>;
}

export default function PatientList({
  patients,
  selectedId,
  activePatientId,
  onSelect,
  onSetActive,
}: PatientListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSetActive = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (!onSetActive || loadingId) return;
    setLoadingId(patient.patientId);
    try {
      await onSetActive(patient);
      setSuccessId(patient.patientId);
      setTimeout(() => setSuccessId(null), 2500);
    } finally {
      setLoadingId(null);
    }
  };

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-10 text-center">
        <UserRound size={36} className="mx-auto text-brand-navy/25 mb-3" strokeWidth={1.5} />
        <p className="font-semibold text-brand-navy/60">Belum ada data pasien</p>
        <p className="text-sm text-brand-navy/40 mt-1">Mulai pemeriksaan pertama dari dashboard</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-gray-border bg-brand-gray-soft">
        <h3 className="font-bold text-brand-navy">Daftar Pasien</h3>
        <p className="text-xs text-brand-navy/50 mt-0.5">{patients.length} pasien terdaftar</p>
      </div>
      <ul className="divide-y divide-brand-gray-border/60">
        {patients.map((p) => {
          const createdAt = p.createdAt?.toDate?.();
          const isSelected = p.patientId === selectedId;
          const isActive = p.patientId === activePatientId;
          const isLoading = loadingId === p.patientId;
          const isSuccess = successId === p.patientId;

          return (
            <li key={p.patientId}>
              <div
                className={clsx(
                  'flex items-center gap-3 px-4 py-3.5 transition-colors border-l-4',
                  isSelected
                    ? 'bg-brand-yellow1/15 border-brand-yellow2'
                    : 'hover:bg-brand-gray-soft border-transparent'
                )}
              >
                {/* Row left — click to view detail */}
                <button
                  onClick={() => onSelect(p.patientId)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[44px]"
                >
                  {/* Avatar */}
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm',
                    isActive
                      ? 'bg-green-500 text-white'
                      : isSelected
                      ? 'bg-brand-yellow2 text-brand-navy'
                      : 'bg-brand-navy/10 text-brand-navy/60'
                  )}>
                    {p.patientName.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-brand-navy truncate">{p.patientName}</p>
                      {isActive && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-brand-navy/50 font-medium truncate">
                        {p.nurseName}
                      </span>
                      {createdAt && (
                        <>
                          <span className="text-brand-navy/25">·</span>
                          <span className="text-xs text-brand-navy/40">
                            {format(createdAt, 'dd MMM', { locale: localeId })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-brand-navy/30 shrink-0" />
                </button>

                {/* Set Active button */}
                {onSetActive && !isActive && (
                  <button
                    onClick={(e) => handleSetActive(e, p)}
                    disabled={!!loadingId}
                    title="Jadikan sesi aktif"
                    className={clsx(
                      'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border min-h-[36px]',
                      isSuccess
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-brand-yellow1/20 text-brand-navy border-brand-yellow1/40 hover:bg-brand-yellow2 hover:border-brand-yellow2 disabled:opacity-40'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Zap size={13} strokeWidth={2.5} />
                    )}
                    <span className="hidden sm:inline">
                      {isSuccess ? 'Aktif!' : 'Set Aktif'}
                    </span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
