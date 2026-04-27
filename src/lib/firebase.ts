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
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';

// ─── Firebase Init ────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeasurementMode = 'single' | 'rot';

export interface ActiveSession {
  patientId: string;
  patientName: string;
  nurseName: string;
  mode: MeasurementMode;
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

// ─── Session Functions ────────────────────────────────────────────────────────

/**
 * Membuat sesi pasien baru dan mengatur active session.
 * Returns patientId yang dibuat.
 */
export async function startPatientSession(
  nurseName: string,
  patientName: string,
  mode: MeasurementMode
): Promise<string> {
  // 1. Generate ID dulu secara lokal — tidak perlu round-trip ke server
  const patientRef = doc(collection(db, 'patients'));
  const patientId = patientRef.id;

  // 2. Tulis dokumen pasien + active session secara paralel (Promise.all)
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
      mode,
      updatedAt: Timestamp.now(),
    }),
  ]);

  return patientId;
}

/**
 * Update settings/activeSession
 */
export async function updateActiveSession(
  patientId: string,
  patientName: string,
  nurseName: string,
  mode: MeasurementMode
): Promise<void> {
  await setDoc(doc(db, 'settings', 'activeSession'), {
    patientId,
    patientName,
    nurseName,
    mode,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update hanya mode pada active session
 */
export async function updateSessionMode(
  mode: MeasurementMode
): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'activeSession'),
    { mode, updatedAt: Timestamp.now() },
    { merge: true }
  );
}

// ─── Realtime Listeners ───────────────────────────────────────────────────────

/**
 * Listen ke settings/activeSession
 */
export function listenActiveSession(
  callback: (session: ActiveSession | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'settings', 'activeSession'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ActiveSession);
    } else {
      callback(null);
    }
  });
}

/**
 * Listen ke dokumen pasien (profile + latestMeasurement + latestROT)
 */
export function listenPatient(
  callback: (patient: Patient | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Patient);
    } else {
      callback(null);
    }
  });
}

/**
 * Listen ke latestMeasurement dari dokumen pasien
 */
export function listenLatestMeasurement(
  patientId: string,
  callback: (measurement: LatestMeasurement | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Patient;
      callback(data.latestMeasurement ?? null);
    } else {
      callback(null);
    }
  });
}

/**
 * Listen ke latestROT dari dokumen pasien
 */
export function listenLatestROT(
  patientId: string,
  callback: (rot: LatestROT | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'patients', patientId), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Patient;
      callback(data.latestROT ?? null);
    } else {
      callback(null);
    }
  });
}

/**
 * Listen ke subcollection measurements (ordered by timestamp_ms desc)
 */
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

/**
 * Listen ke subcollection rotLogs (ordered by timestamp_ms desc)
 */
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

/**
 * Listen ke semua pasien (collection patients, ordered by createdAt desc)
 */
export function listenPatients(
  callback: (patients: Patient[]) => void
): Unsubscribe {
  const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const results: Patient[] = snap.docs.map((d) => ({
      ...(d.data() as Patient),
    }));
    callback(results);
  });
}
