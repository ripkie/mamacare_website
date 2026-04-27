'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import StartSessionForm from '@/components/StartSessionForm';
import ActiveSessionCard from '@/components/ActiveSessionCard';
import LatestMeasurementCard from '@/components/LatestMeasurementCard';
import LatestROTCard from '@/components/LatestROTCard';
import MeasurementHistoryTable from '@/components/MeasurementHistoryTable';
import ROTHistoryTable from '@/components/ROTHistoryTable';
import {
  listenActiveSession,
  listenLatestMeasurement,
  listenLatestROT,
  listenMeasurements,
  listenROTLogs,
  type ActiveSession,
  type LatestMeasurement,
  type LatestROT,
  type Measurement,
  type ROTLog,
} from '@/lib/firebase';
import { Plus, X } from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [latestMeasurement, setLatestMeasurement] = useState<LatestMeasurement | null>(null);
  const [latestROT, setLatestROT] = useState<LatestROT | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [rotLogs, setRotLogs] = useState<ROTLog[]>([]);

  useEffect(() => {
    const unsub = listenActiveSession((s) => {
      setSession(s);
      setSessionLoading(false);
      if (!s) setShowForm(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!session?.patientId) return;
    const pid = session.patientId;
    const unsub1 = listenLatestMeasurement(pid, setLatestMeasurement);
    const unsub2 = listenLatestROT(pid, setLatestROT);
    const unsub3 = listenMeasurements(pid, setMeasurements);
    const unsub4 = listenROTLogs(pid, setRotLogs);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [session?.patientId]);

  const handleSessionStarted = () => setShowForm(false);

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6 lg:mb-8 flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl xl:text-4xl text-brand-navy leading-tight">
            Dashboard Pemeriksaan
          </h1>
          <p className="text-sm lg:text-base text-brand-navy/50 font-medium mt-1">
            Monitoring tekanan darah ibu hamil secara realtime
          </p>
        </div>

        {!sessionLoading && session && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm lg:text-base transition-all shadow-sm
              bg-brand-yellow2 text-brand-navy hover:bg-brand-yellow1 active:scale-[0.98] min-h-[44px]"
          >
            {showForm ? (
              <><X size={18} strokeWidth={2.5} /> Tutup Form</>
            ) : (
              <><Plus size={18} strokeWidth={2.5} /> Tambah Pasien Baru</>
            )}
          </button>
        )}
      </div>

      {/* Main grid — 3 col on desktop, stacked on mobile */}
      <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-5 lg:gap-7">
        {/* Left column */}
        <div className="space-y-5">

          {/* Form */}
          {!sessionLoading && showForm && (
            <div className="animate-fade-in">
              <StartSessionForm onSessionStarted={handleSessionStarted} />
            </div>
          )}

          {/* Loading skeleton */}
          {sessionLoading && (
            <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-6 animate-pulse">
              <div className="h-4 bg-brand-gray-soft rounded w-1/2 mb-3" />
              <div className="h-3 bg-brand-gray-soft rounded w-3/4" />
            </div>
          )}

          {/* Active session card */}
          {!sessionLoading && session && (
            <ActiveSessionCard session={session} />
          )}

          {!sessionLoading && !session && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-brand-yellow2/50
                text-sm font-semibold text-brand-yellow2 hover:bg-brand-yellow1/10 transition-colors min-h-[56px]"
            >
              + Mulai Pemeriksaan
            </button>
          )}
        </div>

        {/* Right column: measurement data */}
        <div className="space-y-5">
          {!session ? (
            <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-10 lg:p-16 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-brand-yellow1/15 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-yellow2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-brand-navy/70 text-lg">Siap untuk pemeriksaan</p>
                <p className="text-sm lg:text-base text-brand-navy/40 mt-2 max-w-sm">
                  Isi form di sebelah kiri untuk memulai sesi. Data dari ESP32 akan tampil di sini secara realtime.
                </p>
              </div>
            </div>
          ) : session.mode === 'single' ? (
            <>
              <LatestMeasurementCard measurement={latestMeasurement} />
              <MeasurementHistoryTable measurements={measurements} />
            </>
          ) : (
            <>
              <LatestROTCard rot={latestROT} />
              <ROTHistoryTable logs={rotLogs} />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
