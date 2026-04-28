import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  RotateCcw,
} from 'lucide-react';
import type { LatestMeasurement, LatestROT } from '@/lib/firebase';
import clsx from 'clsx';

interface Props {
  measurement: LatestMeasurement | null;
  rot?: LatestROT | null;
}

function classifyBP(sbp: number, dbp: number) {
  if (sbp >= 160 || dbp >= 110) {
    return {
      label: 'Berat',
      tone: 'danger',
      badge: 'bg-red-50 text-red-700 border-red-200',
      panel: 'bg-red-50/70 border-red-200',
      text: 'text-red-700',
      note: 'Tekanan darah sangat tinggi. Perlu evaluasi segera.',
    };
  }

  if (sbp >= 140 || dbp >= 90) {
    return {
      label: 'Tinggi',
      tone: 'warning',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      panel: 'bg-orange-50/70 border-orange-200',
      text: 'text-orange-700',
      note: 'Tekanan darah tinggi. Perlu pemantauan dan evaluasi lanjutan.',
    };
  }

  if (sbp >= 130 || dbp >= 80) {
    return {
      label: 'Waspada',
      tone: 'caution',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      panel: 'bg-amber-50/70 border-amber-200',
      text: 'text-amber-700',
      note: 'Tekanan darah perlu dipantau kembali.',
    };
  }

  return {
    label: 'Normal',
    tone: 'normal',
    badge: 'bg-green-50 text-green-700 border-green-200',
    panel: 'bg-green-50/70 border-green-200',
    text: 'text-green-700',
    note: 'Tekanan darah dalam rentang normal.',
  };
}

function classifyROT(value: number) {
  if (value >= 20) {
    return {
      label: 'Positif Kuat',
      badge: 'bg-red-50 text-red-700 border-red-200',
      panel: 'bg-red-50/70 border-red-200',
      text: 'text-red-700',
      note: 'ROT positif kuat. Risiko preeklamsia perlu dievaluasi.',
    };
  }

  if (value >= 15) {
    return {
      label: 'Positif',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      panel: 'bg-orange-50/70 border-orange-200',
      text: 'text-orange-700',
      note: 'ROT positif. Perlu evaluasi lanjutan.',
    };
  }

  return {
    label: 'Negatif',
    badge: 'bg-green-50 text-green-700 border-green-200',
    panel: 'bg-green-50/70 border-green-200',
    text: 'text-green-700',
    note: 'ROT negatif.',
  };
}

export default function LatestMeasurementCard({ measurement, rot = null }: Props) {
  if (!measurement) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border p-5 sm:p-6">
        <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow1/15 flex items-center justify-center">
            <Activity size={24} className="text-brand-yellow2" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold text-brand-navy/75">
              Belum ada data pengukuran
            </p>
            <p className="text-sm text-brand-navy/40 mt-1">
              Data akan tampil setelah ESP32 mengirim hasil tensi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bp = classifyBP(measurement.sbp, measurement.dbp);
  const rotStatus = rot ? classifyROT(rot.rot) : null;
  const hasClinicalAlert = bp.tone === 'danger' || bp.tone === 'warning' || (rot?.rot ?? 0) >= 15;

  return (
    <section className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 border-b border-brand-gray-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <HeartPulse size={19} className="text-red-500" strokeWidth={2.3} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-brand-navy text-sm sm:text-base leading-tight">
              Hasil Pemeriksaan Terbaru
            </h3>
            <p className="text-[11px] text-brand-navy/40 font-medium mt-0.5">
              Tensi, MAP, BPM, dan ROT
            </p>
          </div>
        </div>

        <span
          className={clsx(
            'shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border',
            bp.badge
          )}
        >
          {bp.label}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className={clsx('rounded-2xl border p-4 sm:p-5', bp.panel)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-brand-navy/45">
                Tekanan Darah
              </p>

              <div className="mt-2 flex items-end gap-2 flex-wrap">
                <span className="font-display font-bold text-5xl sm:text-6xl lg:text-6xl leading-none text-brand-navy">
                  {measurement.sbp}
                </span>
                <span className="text-3xl sm:text-4xl leading-none text-brand-navy/35 mb-1">
                  /
                </span>
                <span className="font-display font-bold text-4xl sm:text-5xl lg:text-5xl leading-none text-brand-navy/70">
                  {measurement.dbp}
                </span>
                <span className="text-sm font-semibold text-brand-navy/45 mb-1.5">
                  mmHg
                </span>
              </div>

              <p className="text-xs sm:text-sm text-brand-navy/45 font-medium mt-2">
                Sistolik / Diastolik
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-gray-soft border border-brand-gray-border p-3.5">
            <p className="text-[11px] uppercase tracking-wide font-bold text-brand-navy/45">
              BPM
            </p>
            <p className="text-2xl font-bold text-brand-navy mt-1">
              {measurement.bpm}
            </p>
            <p className="text-[11px] text-brand-navy/40 font-medium">
              denyut/menit
            </p>
          </div>

          <div className="rounded-xl bg-brand-gray-soft border border-brand-gray-border p-3.5">
            <p className="text-[11px] uppercase tracking-wide font-bold text-brand-navy/45">
              MAP
            </p>
            <p className="text-2xl font-bold text-brand-navy mt-1">
              {measurement.map}
            </p>
            <p className="text-[11px] text-brand-navy/40 font-medium">
              mmHg
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-brand-gray-soft border border-brand-gray-border p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0">
                <RotateCcw size={17} className="text-brand-navy/55" strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-bold text-brand-navy text-sm">
                  Roll Over Test
                </p>
                <p className="text-[11px] text-brand-navy/40">
                  DBP terlentang − DBP miring
                </p>
              </div>
            </div>

            {rotStatus ? (
              <span
                className={clsx(
                  'shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border',
                  rotStatus.badge
                )}
              >
                ROT {rotStatus.label}
              </span>
            ) : (
              <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                Menunggu
              </span>
            )}
          </div>

          {rot ? (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-3">
              <div className={clsx('rounded-xl border p-4', rotStatus?.panel)}>
                <p className="text-[11px] uppercase tracking-widest font-bold text-brand-navy/45">
                  Nilai ROT
                </p>
                <p className={clsx('font-display font-bold text-4xl leading-none mt-2', rotStatus?.text)}>
                  {rot.rot > 0 ? '+' : ''}
                  {rot.rot}
                </p>
                <p className="text-xs text-brand-navy/45 font-medium mt-1">
                  mmHg
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-brand-gray-border p-3.5">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-brand-navy/45">
                    DBP Miring
                  </p>
                  <p className="text-2xl font-bold text-brand-navy mt-1">
                    {rot.miring_dbp}
                  </p>
                  <p className="text-[11px] text-brand-navy/40">mmHg</p>
                </div>

                <div className="rounded-xl bg-white border border-brand-gray-border p-3.5">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-brand-navy/45">
                    DBP Terlentang
                  </p>
                  <p className="text-2xl font-bold text-brand-navy mt-1">
                    {rot.terlentang_dbp}
                  </p>
                  <p className="text-[11px] text-brand-navy/40">mmHg</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-brand-gray-border px-4 py-4 text-center">
              <p className="font-bold text-sm text-brand-navy/70">
                Lakukan pengukuran kedua untuk menghitung ROT
              </p>
              <p className="text-xs text-brand-navy/40 mt-1">
                ROT akan muncul otomatis setelah data kedua dikirim ESP32.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-navy/40 font-medium">
          <Clock size={13} strokeWidth={2} />
          <span>{measurement.datetime}</span>
        </div>

        {hasClinicalAlert && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={17} className="text-red-600 shrink-0 mt-0.5" strokeWidth={2.2} />
            <div>
              <p className="text-sm font-bold text-red-700">
                Perlu perhatian klinis
              </p>
              <p className="text-xs text-red-600/85 mt-0.5">
                {rotStatus && rot && rot.rot >= 15 ? rotStatus.note : bp.note}
              </p>
            </div>
          </div>
        )}

        {!hasClinicalAlert && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
            <CheckCircle2 size={17} className="text-green-600 shrink-0 mt-0.5" strokeWidth={2.2} />
            <p className="text-xs text-green-700 font-semibold">
              Pemeriksaan terbaru tidak menunjukkan tanda risiko tinggi berdasarkan data saat ini.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}