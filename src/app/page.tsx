'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ActiveSessionCard from '@/components/ActiveSessionCard';
import LatestMeasurementCard from '@/components/LatestMeasurementCard';
import MeasurementHistoryTable from '@/components/MeasurementHistoryTable';
import ROTHistoryTable from '@/components/ROTHistoryTable';
import StartSessionForm from '@/components/StartSessionForm';
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

export default function DashboardPage() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [latestMeasurement, setLatestMeasurement] = useState<LatestMeasurement | null>(null);
  const [latestROT, setLatestROT] = useState<LatestROT | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [rotLogs, setRotLogs] = useState<ROTLog[]>([]);

  useEffect(() => {
    const unsub = listenActiveSession((data) => {
      setSession(data);
      setSessionLoading(false);
      if (!data) setShowForm(true);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!session?.patientId) {
      setLatestMeasurement(null);
      setLatestROT(null);
      setMeasurements([]);
      setRotLogs([]);
      return;
    }

    const pid = session.patientId;

    const unsub1 = listenLatestMeasurement(pid, setLatestMeasurement);
    const unsub2 = listenLatestROT(pid, setLatestROT);
    const unsub3 = listenMeasurements(pid, setMeasurements);
    const unsub4 = listenROTLogs(pid, setRotLogs);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [session?.patientId]);

  const handleSessionStarted = () => {
    setShowForm(false);
  };

  return (
    <AppShell>
      <div className="mb-5 lg:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-navy leading-tight">
            Dashboard Pemeriksaan
          </h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Monitoring tekanan darah ibu hamil secara realtime
          </p>
        </div>

        {!sessionLoading && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm bg-brand-yellow2 text-brand-navy hover:bg-brand-yellow1 transition"
          >
            + Tambah Pasien Baru
          </button>
        )}

        {!sessionLoading && showForm && (
          <button
            onClick={() => setShowForm(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            Tutup Form
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
        <div className="space-y-4 lg:space-y-5">
          {!sessionLoading && showForm && (
            <div className="animate-fade-in">
              <StartSessionForm onSessionStarted={handleSessionStarted} />
            </div>
          )}

          {sessionLoading && (
            <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-4 animate-pulse">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />
              <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-1/3 bg-gray-200 rounded" />
            </div>
          )}

          {!sessionLoading && session && (
            <ActiveSessionCard session={session} />
          )}

          {!sessionLoading && !session && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-xl border-2 border-dashed border-brand-yellow2 text-brand-yellow2 font-semibold text-sm hover:bg-brand-yellow2/10 transition"
            >
              + Mulai Pemeriksaan
            </button>
          )}
        </div>

        <div className="space-y-4 lg:space-y-5">
          {!session ? (
            <div className="bg-white rounded-2xl border border-brand-gray-border shadow-card p-8 lg:p-10 text-center">
              <p className="font-bold text-brand-navy/70">
                Siap untuk pemeriksaan
              </p>
              <p className="text-sm text-brand-navy/40 mt-2">
                Isi form di sebelah kiri untuk memulai sesi. Data dari ESP32 akan tampil secara realtime.
              </p>
            </div>
          ) : (
            <>
              <LatestMeasurementCard
                measurement={latestMeasurement}
                rot={latestROT}
              />

              {measurements.length > 0 && (
                <MeasurementHistoryTable measurements={measurements} />
              )}

              {rotLogs.length > 0 && (
                <ROTHistoryTable logs={rotLogs} />
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}