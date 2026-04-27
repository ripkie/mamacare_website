'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  listenPatient,
  listenMeasurements,
  listenROTLogs,
  Patient,
  Measurement,
  ROTLog,
} from '@/lib/firebase';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [rotLogs, setRotLogs] = useState<ROTLog[]>([]);

  useEffect(() => {
    if (!patientId) return;

    const unsubPatient = listenPatient(patientId, setPatient);
    const unsubMeasurements = listenMeasurements(patientId, setMeasurements);
    const unsubROTLogs = listenROTLogs(patientId, setRotLogs);

    return () => {
      unsubPatient();
      unsubMeasurements();
      unsubROTLogs();
    };
  }, [patientId]);

  if (!patient) {
    return (
      <main className="p-6">
        <p>Memuat data pasien...</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">{patient.patientName}</h1>
        <p className="text-sm text-gray-500">ID: {patientId}</p>
        <p className="text-sm text-gray-500">Petugas: {patient.nurseName}</p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Riwayat Pengukuran</h2>

        {measurements.length === 0 ? (
          <p>Belum ada data pengukuran.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>SBP</th>
                <th>DBP</th>
                <th>BPM</th>
                <th>MAP</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((item) => (
                <tr key={item.id}>
                  <td>{item.datetime}</td>
                  <td>{item.sbp}</td>
                  <td>{item.dbp}</td>
                  <td>{item.bpm}</td>
                  <td>{item.map}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold mb-4">Riwayat ROT</h2>

        {rotLogs.length === 0 ? (
          <p>Belum ada data ROT.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>DBP Miring</th>
                <th>DBP Terlentang</th>
                <th>ROT</th>
              </tr>
            </thead>
            <tbody>
              {rotLogs.map((item) => (
                <tr key={item.id}>
                  <td>{item.datetime}</td>
                  <td>{item.miring_dbp}</td>
                  <td>{item.terlentang_dbp}</td>
                  <td>{item.rot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}