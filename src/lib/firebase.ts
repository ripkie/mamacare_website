import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface ActiveSession {
  patientId: string;
  patientName: string;
  nurseName: string;
  updatedAt: Timestamp;
}

export interface LatestMeasurement {
  mode: 'single';
  sbp: number;
  dbp: number;
  bpm: number;
  map: number;
  datetime: string;
  timestamp_ms: number;
  patientId: string;
  patientName: string;
  nurseName: string;
}

export interface LatestROT {
  rot: number;
  miring_dbp: number;
  terlentang_dbp: number;
  datetime: string;
  timestamp_ms: number;
}

export interface Patient {
  patientId: string;
  patientName: string;
  nurseName: string;
  status: string;
  createdAt: Timestamp;
  latestMeasurement?: LatestMeasurement;
  latestROT?: LatestROT;
}

export interface Measurement {
  id?: string;
  mode: 'single';
  sbp: number;
  dbp: number;
  bpm: number;
  map: number;
  datetime: string;
  timestamp_ms: number;
  patientId: string;
  patientName: string;
  nurseName: string;
}

export interface MiringTerlentang {
  sbp: number;
  dbp: number;
  bpm: number;
}

export interface ROTLog {
  id?: string;
  mode: 'rot';
  rot: number;
  miring_dbp: number;
  terlentang_dbp: number;
  datetime: string;
  timestamp_ms: number;
  patientId: string;
  patientName: string;
  nurseName: string;
  miring_kiri?: MiringTerlentang;
  terlentang?: MiringTerlentang;
}

export async function startPatientSession(
  nurseName: string,
  patientName: string
): Promise<string> {
  const patientRef = doc(collection(db, 'patients'));
  const patientId = patientRef.id;

  await Promise.all([
    setDoc(patientRef, {
      patientId,
      patientName,
      nurseName,
      status: 'active',
      createdAt: Timestamp.now(),
    }),
    setDoc(doc(db, 'settings', 'activeSession'), {
      patientId,
      patientName,
      nurseName,
      updatedAt: Timestamp.now(),
    }),
  ]);

  return patientId;
}

export async function updateActiveSession(
  patientId: string,
  patientName: string,
  nurseName: string
): Promise<void> {
  await setDoc(doc(db, 'settings', 'activeSession'), {
    patientId,
    patientName,
    nurseName,
    updatedAt: Timestamp.now(),
  });
}

export function listenActiveSession(
  callback: (session: ActiveSession | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'settings', 'activeSession'), (snap) => {
    callback(snap.exists() ? (snap.data() as ActiveSession) : null);
  });
}

export function listenPatients(
  callback: (patients: Patient[]) => void
): Unsubscribe {
  const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snap) => {
    const results: Patient[] = snap.docs.map((d) => d.data() as Patient);
    callback(results);
  });
}

export function listenPatient(
  patientId: string,
  callback: (patient: Patient | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    callback(snap.exists() ? (snap.data() as Patient) : null);
  });
}

export function listenLatestMeasurement(
  patientId: string,
  callback: (measurement: LatestMeasurement | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data() as Patient;
    callback(data.latestMeasurement ?? null);
  });
}

export function listenLatestROT(
  patientId: string,
  callback: (rot: LatestROT | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    if (!snap.exists()) return callback(null);
    const data = snap.data() as Patient;
    callback(data.latestROT ?? null);
  });
}

export function listenMeasurements(
  patientId: string,
  callback: (measurements: Measurement[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'patients', patientId, 'measurements'),
    orderBy('timestamp_ms', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const results: Measurement[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Measurement, 'id'>),
    }));

    callback(results);
  });
}

export function listenROTLogs(
  patientId: string,
  callback: (logs: ROTLog[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'patients', patientId, 'rotLogs'),
    orderBy('timestamp_ms', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const results: ROTLog[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ROTLog, 'id'>),
    }));

    callback(results);
  });
}