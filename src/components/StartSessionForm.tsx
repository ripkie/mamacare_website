'use client';

import { useState } from 'react';
import { startPatientSession } from '@/lib/firebase';
import { UserRound, Stethoscope, Loader2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface StartSessionFormProps {
  onSessionStarted?: (patientId: string) => void;
}

export default function StartSessionForm({ onSessionStarted }: StartSessionFormProps) {
  const [nurseName, setNurseName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nurseName.trim() || !patientName.trim()) {
      setError('Nama petugas dan nama pasien harus diisi.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const patientId = await startPatientSession(
        nurseName.trim(),
        patientName.trim()
      );

      setSuccess(true);
      onSessionStarted?.(patientId);

      setTimeout(() => {
        setSuccess(false);
        setNurseName('');
        setPatientName('');
      }, 3000);
    } catch (err) {
      setError('Gagal membuat sesi. Periksa koneksi Firebase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      <div className="bg-gradient-to-r from-brand-yellow1 to-brand-yellow2 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
            <Stethoscope size={22} className="text-brand-navy" strokeWidth={2.2} />
          </div>

          <div>
            <h2 className="font-bold text-brand-navy text-lg leading-tight">
              Mulai Pemeriksaan
            </h2>
            <p className="text-brand-navy/60 text-xs font-medium">
              Buat sesi pasien baru
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wide mb-2">
            Nama Petugas / Nurse
          </label>

          <div className="relative">
            <UserRound
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
              strokeWidth={2}
            />

            <input
              type="text"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
              placeholder="Nama petugas..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-medium text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30 transition min-h-[48px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wide mb-2">
            Nama Pasien
          </label>

          <div className="relative">
            <UserRound
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
              strokeWidth={2}
            />

            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nama pasien..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-medium text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30 transition min-h-[48px]"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={clsx(
            'w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all min-h-[52px]',
            success
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-brand-yellow2 text-brand-navy hover:bg-brand-yellow1 active:scale-[0.98] shadow-sm disabled:opacity-60'
          )}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Membuat Sesi...
            </>
          ) : success ? (
            <>
              <CheckCircle2 size={18} /> Sesi Berhasil Dibuat!
            </>
          ) : (
            'Mulai Pemeriksaan'
          )}
        </button>
      </form>
    </div>
  );
}