'use client';

import { type ROTLog } from '@/lib/firebase';
import { RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface ROTHistoryTableProps {
  logs: ROTLog[];
}

function rotClass(rot: number) {
  if (rot >= 20) return 'text-red-600 bg-red-50';
  if (rot >= 15) return 'text-orange-600 bg-orange-50';
  return 'text-green-600 bg-green-50';
}

export default function ROTHistoryTable({ logs }: ROTHistoryTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-brand-gray-border">
        <div className="w-10 h-10 rounded-xl bg-brand-navy/[0.08] flex items-center justify-center">
          <RotateCcw size={18} className="text-brand-navy/60" strokeWidth={2.2} />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy text-base">Riwayat ROT</h3>
          <p className="text-xs text-brand-navy/50">{logs.length} data tercatat</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-navy/40">
          <RotateCcw size={32} strokeWidth={1.5} />
          <p className="font-medium">Belum ada data ROT</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-gray-soft border-b border-brand-gray-border">
                {['Waktu', 'DBP Miring', 'DBP Terlentang', 'ROT', 'Petugas', 'Hasil'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-brand-navy/50 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr
                  key={l.id || i}
                  className="border-b border-brand-gray-border/60 hover:bg-brand-yellow1/5 transition-colors"
                >
                  <td className="px-5 py-3.5 text-xs text-brand-navy/70 font-medium whitespace-nowrap">
                    {l.datetime}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-navy text-base">{l.miring_dbp}</td>
                  <td className="px-5 py-3.5 font-bold text-brand-navy text-base">{l.terlentang_dbp}</td>
                  <td className="px-5 py-3.5 font-bold text-brand-navy text-base">
                    {l.rot > 0 ? '+' : ''}{l.rot}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-brand-navy/60 font-medium">{l.nurseName}</td>
                  <td className="px-5 py-3.5">
                    <span className={clsx(
                      'text-xs font-bold px-2.5 py-1 rounded-full',
                      rotClass(l.rot)
                    )}>
                      {l.rot >= 20 ? 'Positif Kuat' : l.rot >= 15 ? 'Positif' : 'Negatif'}
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
