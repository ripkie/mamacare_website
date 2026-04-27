'use client';

import { type LatestMeasurement } from '@/lib/firebase';
import { Heart, Activity, Gauge, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface LatestMeasurementCardProps {
  measurement: LatestMeasurement | null;
  loading?: boolean;
}

function classifyBP(sbp: number, dbp: number) {
  if (sbp >= 160 || dbp >= 110) return { label: 'Berat', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  if (sbp >= 140 || dbp >= 90)  return { label: 'Tinggi', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
  if (sbp >= 130 || dbp >= 80)  return { label: 'Elevated', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
}

export default function LatestMeasurementCard({ measurement, loading }: LatestMeasurementCardProps) {
  const classification = measurement ? classifyBP(measurement.sbp, measurement.dbp) : null;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Heart size={20} className="text-red-500" fill="currentColor" strokeWidth={0} />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy text-base">Hasil Terbaru</h3>
            <p className="text-xs text-brand-navy/50">Single Measurement</p>
          </div>
        </div>
        {measurement ? (
          <span className={clsx(
            'text-sm font-bold px-3 py-1.5 rounded-full border',
            classification?.color, classification?.bg, classification?.border
          )}>
            {classification?.label}
          </span>
        ) : (
          <span className="text-xs font-medium text-brand-navy/40 bg-brand-gray-soft px-3 py-1.5 rounded-full">
            Menunggu data...
          </span>
        )}
      </div>

      <div className="p-6">
        {!measurement ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow1/15 flex items-center justify-center">
              <Activity size={32} className="text-brand-yellow2" strokeWidth={1.8} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-brand-navy/70">Menunggu hasil pengukuran...</p>
              <p className="text-sm text-brand-navy/40 mt-1">ESP32 akan mengirim data setelah pengukuran selesai</p>
            </div>
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-brand-yellow2 animate-pulse"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Blood pressure — hero */}
            <div className="bg-gradient-to-br from-brand-yellow1/10 to-brand-yellow2/5 rounded-2xl p-6 border border-brand-yellow1/20">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-navy/50 mb-3">
                Tekanan Darah
              </p>
              <div className="flex items-end gap-3">
                <span className="font-display font-bold text-6xl xl:text-7xl text-brand-navy leading-none">
                  {measurement.sbp}
                </span>
                <span className="text-brand-navy/40 text-2xl font-light mb-2">/</span>
                <span className="font-display font-bold text-5xl xl:text-6xl text-brand-navy/70 leading-none">
                  {measurement.dbp}
                </span>
                <span className="text-brand-navy/50 text-base font-medium mb-2">mmHg</span>
              </div>
              <p className="text-sm text-brand-navy/45 mt-2 font-medium">Sistolik / Diastolik</p>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-gray-soft rounded-xl p-4 border border-brand-gray-border">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={15} className="text-red-500" fill="currentColor" strokeWidth={0} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/50">BPM</p>
                </div>
                <p className="font-bold text-3xl text-brand-navy">{measurement.bpm}</p>
                <p className="text-xs text-brand-navy/40 font-medium mt-0.5">denyut/menit</p>
              </div>
              <div className="bg-brand-gray-soft rounded-xl p-4 border border-brand-gray-border">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={15} className="text-brand-yellow2" strokeWidth={2.2} />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/50">MAP</p>
                </div>
                <p className="font-bold text-3xl text-brand-navy">{measurement.map}</p>
                <p className="text-xs text-brand-navy/40 font-medium mt-0.5">mmHg</p>
              </div>
            </div>

            {measurement.datetime && (
              <div className="flex items-center gap-2 text-sm text-brand-navy/45">
                <Clock size={14} strokeWidth={2} />
                <span className="font-medium">{measurement.datetime}</span>
              </div>
            )}

            {(measurement.sbp >= 140 || measurement.dbp >= 90) && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.2} />
                <div>
                  <p className="text-sm font-bold text-red-700">Perhatian — Tekanan Darah Tinggi</p>
                  <p className="text-xs text-red-600/80 mt-1">
                    Tekanan darah melebihi batas normal untuk ibu hamil. Tindakan lanjut diperlukan.
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
