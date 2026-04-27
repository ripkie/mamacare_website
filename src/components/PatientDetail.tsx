'use client';

import { useEffect, useState } from 'react';
import {
  listenPatient,
  listenMeasurements,
  listenROTLogs,
  type Patient,
  type Measurement,
  type ROTLog,
} from '@/lib/firebase';
import { UserRound, Hash, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import LatestMeasurementCard from './LatestMeasurementCard';
import LatestROTCard from './LatestROTCard';
import MeasurementHistoryTable from './MeasurementHistoryTable';
import ROTHistoryTable from './ROTHistoryTable';

interface PatientDetailProps {
  patientId: string;
  onClose?: () => void;
}

export default function PatientDetail({ patientId, onClose }: PatientDetailProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [rotLogs, setRotLogs] = useState<ROTLog[]>([]);

  useEffect(() => {
    const unsub1 = listenPatient(patientId, setPatient);
    const unsub2 = listenMeasurements(patientId, setMeasurements);
    const unsub3 = listenROTLogs(patientId, setRotLogs);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [patientId]);

  if (!patient) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-brand-gray-soft rounded-2xl" />
        <div className="h-48 bg-brand-gray-soft rounded-2xl" />
      </div>
    );
  }

  const createdAt = patient.createdAt?.toDate?.();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-border bg-brand-gray-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-brand-yellow2 flex items-center justify-center font-bold text-brand-navy text-lg">
              {patient.patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-brand-navy">{patient.patientName}</p>
              <p className="text-xs text-brand-navy/50 font-medium">Petugas: {patient.nurseName}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-gray-border transition-colors">
              <X size={16} className="text-brand-navy/50" />
            </button>
          )}
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Patient ID</p>
            <p className="font-mono text-xs text-brand-navy/70 mt-0.5 break-all">{patient.patientId}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-navy/45">Tanggal Daftar</p>
            <p className="text-sm font-medium text-brand-navy/70 mt-0.5">
              {createdAt ? format(createdAt, 'dd MMM yyyy, HH:mm', { locale: localeId }) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Latest data */}
      <div className="grid md:grid-cols-2 gap-4">
        <LatestMeasurementCard measurement={patient.latestMeasurement ?? null} />
        <LatestROTCard rot={patient.latestROT ?? null} />
      </div>

      {/* History tables */}
      {measurements.length > 0 && <MeasurementHistoryTable measurements={measurements} />}
      {rotLogs.length > 0 && <ROTHistoryTable logs={rotLogs} />}
    </div>
  );
}
