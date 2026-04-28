'use client';

import { type Measurement } from '@/lib/firebase';
import { ClipboardList, Heart } from 'lucide-react';
import clsx from 'clsx';

interface MeasurementHistoryTableProps {
  measurements: Measurement[];
}

function bpClass(sbp: number, dbp: number) {
  if (sbp >= 160 || dbp >= 110) return 'text-red-600 bg-red-50';
  if (sbp >= 140 || dbp >= 90) return 'text-orange-600 bg-orange-50';
  if (sbp >= 130 || dbp >= 80) return 'text-amber-600 bg-amber-50';
  return 'text-green-600 bg-green-50';
}

export default function MeasurementHistoryTable({ measurements }: MeasurementHistoryTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-gray-border">
        <div className="w-10 h-10 rounded-xl bg-brand-yellow1/20 flex items-center justify-center">
          <ClipboardList size={18} className="text-brand-yellow2" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy text-base">Riwayat Pengukuran</h3>
          <p className="text-xs text-brand-navy/50">{measurements.length} data tercatat</p>
        </div>
      </div>

      {measurements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-navy/40">
          <Heart size={32} strokeWidth={1.5} />
          <p className="font-medium">Belum ada data pengukuran</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-gray-soft border-b border-brand-gray-border">
                {['Waktu', 'SBP', 'DBP', 'BPM', 'MAP', 'Petugas', 'Status Preeklampsia'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-brand-navy/50 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => (
                <tr
                  key={m.id || i}
                  className="border-b border-brand-gray-border/60 hover:bg-brand-yellow1/5 transition-colors"
                >
                  <td className="px-5 py-3.5 text-xs text-brand-navy/70 font-medium whitespace-nowrap">
                    {m.datetime}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-navy text-base">{m.sbp}</td>
                  <td className="px-5 py-3.5 font-bold text-brand-navy text-base">{m.dbp}</td>
                  <td className="px-5 py-3.5 font-medium text-brand-navy/70">{m.bpm}</td>
                  <td className="px-5 py-3.5 font-medium text-brand-navy/70">{m.map}</td>
                  <td className="px-5 py-3.5 text-xs text-brand-navy/60 font-medium">{m.nurseName}</td>
                  <td className="px-5 py-3.5">
                    <span className={clsx(
                      'text-xs font-bold px-2.5 py-1 rounded-full',
                      bpClass(m.sbp, m.dbp)
                    )}>
                      {m.sbp >= 160 || m.dbp >= 110 ? 'Berat' :
                        m.sbp >= 140 || m.dbp >= 90 ? 'Tinggi' :
                          m.sbp >= 130 || m.dbp >= 80 ? 'Normal' : 'Ideal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
