'use client';

import { type LatestROT } from '@/lib/firebase';
import { RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface LatestROTCardProps {
  rot: LatestROT | null;
}

function classifyROT(rot: number) {
  if (rot >= 20) return { label: 'Positif Kuat', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  if (rot >= 15) return { label: 'Positif', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  return { label: 'Negatif', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
}

export default function LatestROTCard({ rot }: LatestROTCardProps) {
  const classification = rot ? classifyROT(rot.rot) : null;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-navy/[0.08] flex items-center justify-center">
            <RotateCcw size={20} className="text-brand-navy/70" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy text-base">Hasil ROT Terbaru</h3>
            <p className="text-xs text-brand-navy/50">Roll Over Test</p>
          </div>
        </div>
        {rot && (
          <span className={clsx(
            'text-sm font-bold px-3 py-1.5 rounded-full border',
            classification?.color, classification?.bg, classification?.border
          )}>
            ROT {classification?.label}
          </span>
        )}
      </div>

      <div className="p-6">
        {!rot ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-navy/[0.08] flex items-center justify-center">
              <RotateCcw size={32} className="text-brand-navy/40" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-brand-navy/70">Menunggu data ROT...</p>
              <p className="text-sm text-brand-navy/40 mt-1">
                ESP32 akan mengirim hasil ROT setelah 2 pengukuran selesai
              </p>
            </div>

            {/* Instruction steps */}
            <div className="w-full mt-2 space-y-3">
              {[
                { step: '1/2', label: 'Miring Kiri', desc: 'Pasien berbaring miring kiri' },
                { step: '2/2', label: 'Terlentang', desc: 'Pasien berbaring terlentang' },
              ].map(({ step, label, desc }) => (
                <div key={step} className="flex items-center gap-4 bg-brand-gray-soft rounded-xl p-4 border border-brand-gray-border">
                  <span className="w-10 h-10 rounded-xl bg-brand-yellow1/30 flex items-center justify-center text-xs font-bold text-brand-navy shrink-0">
                    {step}
                  </span>
                  <div>
                    <p className="font-bold text-brand-navy">{label}</p>
                    <p className="text-xs text-brand-navy/50 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* ROT value hero */}
            <div className={clsx(
              'rounded-2xl p-6 border',
              classification?.bg, classification?.border
            )}>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-navy/50 mb-3">
                Nilai ROT
              </p>
              <p className="font-display font-bold text-6xl xl:text-7xl leading-none">
                <span className={classification?.color}>{rot.rot > 0 ? '+' : ''}{rot.rot}</span>
              </p>
              <p className="text-sm text-brand-navy/45 mt-2 font-medium">mmHg (DBP terlentang − DBP miring)</p>
            </div>

            {/* DBP values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-gray-soft rounded-xl p-4 border border-brand-gray-border">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/50 mb-2">
                  DBP Miring Kiri
                </p>
                <p className="font-bold text-3xl text-brand-navy">{rot.miring_dbp}</p>
                <p className="text-xs text-brand-navy/40 font-medium mt-0.5">mmHg</p>
              </div>
              <div className="bg-brand-gray-soft rounded-xl p-4 border border-brand-gray-border">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/50 mb-2">
                  DBP Terlentang
                </p>
                <p className="font-bold text-3xl text-brand-navy">{rot.terlentang_dbp}</p>
                <p className="text-xs text-brand-navy/40 font-medium mt-0.5">mmHg</p>
              </div>
            </div>

            {rot.datetime && (
              <div className="flex items-center gap-2 text-sm text-brand-navy/45">
                <Clock size={14} strokeWidth={2} />
                <span className="font-medium">{rot.datetime}</span>
              </div>
            )}

            {rot.rot >= 15 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.2} />
                <div>
                  <p className="text-sm font-bold text-red-700">ROT Positif — Risiko Preeklamsia</p>
                  <p className="text-xs text-red-600/80 mt-1">
                    Nilai ROT ≥ 15 mmHg mengindikasikan risiko hipertensi dalam kehamilan. Lakukan evaluasi lanjutan.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
