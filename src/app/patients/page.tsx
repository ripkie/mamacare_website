'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import PatientList from '@/components/PatientList';
import PatientDetail from '@/components/PatientDetail';
import {
  listenPatients,
  listenActiveSession,
  updateActiveSession,
  type Patient,
  type ActiveSession,
  type MeasurementMode,
} from '@/lib/firebase';
import { Search, X, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  const [pendingPatient, setPendingPatient] = useState<Patient | null>(null);
  const [selectedMode, setSelectedMode] = useState<MeasurementMode>('single');
  const [settingActive, setSettingActive] = useState(false);

  useEffect(() => {
    const unsub1 = listenPatients((data) => { setPatients(data); setLoading(false); });
    const unsub2 = listenActiveSession(setActiveSession);
    return () => { unsub1(); unsub2(); };
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.nurseName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSetActiveRequest = async (patient: Patient) => {
    setPendingPatient(patient);
    setSelectedMode('single');
  };

  const handleConfirmSetActive = async () => {
    if (!pendingPatient) return;
    setSettingActive(true);
    try {
      await updateActiveSession(
        pendingPatient.patientId,
        pendingPatient.patientName,
        pendingPatient.nurseName,
        selectedMode
      );
      setPendingPatient(null);
    } finally {
      setSettingActive(false);
    }
  };

  return (
    <AppShell>
      {/* Modal pilih mode */}
      {pendingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-gray-border w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-border bg-brand-gray-soft">
              <div>
                <p className="font-bold text-brand-navy">Jadikan Sesi Aktif</p>
                <p className="text-xs text-brand-navy/50 mt-0.5">Pilih mode pengukuran untuk pasien ini</p>
              </div>
              <button
                onClick={() => setPendingPatient(null)}
                className="p-2 rounded-lg hover:bg-brand-gray-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={16} className="text-brand-navy/50" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 bg-brand-yellow1/10 rounded-xl p-4 border border-brand-yellow1/20">
                <div className="w-10 h-10 rounded-full bg-brand-yellow2 flex items-center justify-center font-bold text-brand-navy shrink-0">
                  {pendingPatient.patientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-brand-navy">{pendingPatient.patientName}</p>
                  <p className="text-xs text-brand-navy/50">Petugas: {pendingPatient.nurseName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy/50 mb-3">
                  Mode Pengukuran
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['single', 'rot'] as MeasurementMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all min-h-[80px]',
                        selectedMode === m
                          ? 'border-brand-yellow2 bg-brand-yellow1/15 text-brand-navy'
                          : 'border-brand-gray-border bg-brand-gray-soft text-brand-navy/50 hover:border-brand-yellow1/50'
                      )}
                    >
                      <Activity size={20} strokeWidth={2.2} className={selectedMode === m ? 'text-brand-yellow2' : 'text-brand-navy/30'} />
                      {m === 'single' ? 'Single Measurement' : 'Roll Over Test (ROT)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setPendingPatient(null)}
                  className="flex-1 py-3 rounded-xl border border-brand-gray-border text-sm font-semibold text-brand-navy/60 hover:bg-brand-gray-soft transition-colors min-h-[48px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSetActive}
                  disabled={settingActive}
                  className="flex-1 py-3 rounded-xl bg-brand-yellow2 text-brand-navy font-bold text-sm hover:bg-brand-yellow1 transition-colors disabled:opacity-60 min-h-[48px]"
                >
                  {settingActive ? 'Menyimpan...' : 'Aktifkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 lg:mb-8 flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl xl:text-4xl text-brand-navy leading-tight">
            Daftar Pasien
          </h1>
          <p className="text-sm lg:text-base text-brand-navy/50 font-medium mt-1">
            Riwayat seluruh pemeriksaan pasien
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 lg:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" strokeWidth={2.2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pasien atau petugas..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-white text-sm font-medium text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30 shadow-soft transition min-h-[48px]"
          />
        </div>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <p className="text-sm text-green-800 font-medium">
            Sesi aktif:{' '}
            <span className="font-bold">{activeSession.patientName}</span>
            <span className="text-green-600 font-normal"> · {activeSession.nurseName} · mode {activeSession.mode}</span>
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-soft" />
            ))}
          </div>
          <div className="h-80 bg-white rounded-2xl animate-pulse shadow-soft" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6">
          {/* Patient list */}
          <div>
            <PatientList
              patients={filtered}
              selectedId={selectedId ?? undefined}
              activePatientId={activeSession?.patientId}
              onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
              onSetActive={handleSetActiveRequest}
            />
          </div>

          {/* Patient detail */}
          <div>
            {selectedId ? (
              <PatientDetail
                patientId={selectedId}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-12 lg:p-16 flex flex-col items-center text-center gap-4 min-h-[320px] justify-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-yellow1/15 flex items-center justify-center">
                  <Search size={28} className="text-brand-yellow2" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-bold text-brand-navy/70 text-lg">Pilih pasien</p>
                  <p className="text-sm text-brand-navy/40 mt-2 max-w-xs">
                    Klik nama pasien untuk melihat detail, atau klik{' '}
                    <span className="font-semibold text-brand-navy/60">⚡ Set Aktif</span>{' '}
                    untuk menjadikannya sesi aktif
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
