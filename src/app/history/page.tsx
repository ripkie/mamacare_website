'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import {
    listenPatients,
    listenMeasurements,
    type Patient,
    type Measurement,
} from '@/lib/firebase';
import { Search, ArrowUpDown, CalendarDays, Filter, ClipboardList } from 'lucide-react';

type SortBy = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

type HistoryItem = Measurement & {
    patientName: string;
    nurseName: string;
};

const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export default function HistoryPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('date_desc');
    const [monthFilter, setMonthFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubPatients = listenPatients((data) => {
            setPatients(data);
            setLoading(false);
        });

        return () => unsubPatients();
    }, []);

    useEffect(() => {
        if (patients.length === 0) {
            setItems([]);
            return;
        }

        const unsubs = patients.map((patient) =>
            listenMeasurements(patient.patientId, (measurements) => {
                setItems((prev) => {
                    const withoutPatient = prev.filter(
                        (item) => item.patientId !== patient.patientId
                    );

                    const nextItems: HistoryItem[] = measurements.map((m) => ({
                        ...m,
                        patientId: patient.patientId,
                        patientName: patient.patientName,
                        nurseName: patient.nurseName,
                    }));

                    return [...withoutPatient, ...nextItems];
                });
            })
        );

        return () => {
            unsubs.forEach((unsub) => unsub());
        };
    }, [patients]);

    const availableYears = useMemo(() => {
        const years = new Set<number>();

        items.forEach((item) => {
            if (item.timestamp_ms) {
                years.add(new Date(item.timestamp_ms).getFullYear());
            }
        });

        return Array.from(years).sort((a, b) => b - a);
    }, [items]);

    const filtered = useMemo(() => {
        const keyword = search.toLowerCase();

        const result = items.filter((item) => {
            const date = new Date(item.timestamp_ms);

            const searchMatch =
                item.patientName.toLowerCase().includes(keyword) ||
                item.nurseName.toLowerCase().includes(keyword) ||
                item.datetime.toLowerCase().includes(keyword);

            const monthMatch =
                monthFilter === 'all' || date.getMonth() === Number(monthFilter);

            const yearMatch =
                yearFilter === 'all' || date.getFullYear() === Number(yearFilter);

            return searchMatch && monthMatch && yearMatch;
        });

        result.sort((a, b) => {
            if (sortBy === 'date_desc') return b.timestamp_ms - a.timestamp_ms;
            if (sortBy === 'date_asc') return a.timestamp_ms - b.timestamp_ms;
            if (sortBy === 'name_asc') return a.patientName.localeCompare(b.patientName);
            if (sortBy === 'name_desc') return b.patientName.localeCompare(a.patientName);
            return 0;
        });

        return result;
    }, [items, search, sortBy, monthFilter, yearFilter]);

    return (
        <AppShell>
            <div className="mb-5 lg:mb-6 flex flex-col gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-navy leading-tight">
                        Riwayat Pengukuran
                    </h1>
                    <p className="text-sm text-brand-navy/60 mt-1">
                        Arsip seluruh hasil tensi pasien yang dikirim dari ESP32.
                    </p>
                </div>

                <div className="bg-white border border-brand-gray-border shadow-card rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-brand-yellow1/20 flex items-center justify-center">
                            <Filter size={18} className="text-brand-navy/70" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-navy text-sm">
                                Filter Data Pemeriksaan
                            </p>
                            <p className="text-xs text-brand-navy/40">
                                Cari berdasarkan pasien, petugas, bulan, dan tahun
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-3">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari pasien, petugas, tanggal..."
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-medium text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30"
                            />
                        </div>

                        <div className="relative">
                            <CalendarDays
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
                            />
                            <select
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-bold text-brand-navy focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30"
                            >
                                <option value="all">Semua Bulan</option>
                                {months.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <CalendarDays
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
                            />
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-bold text-brand-navy focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30"
                            >
                                <option value="all">Semua Tahun</option>
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <ArrowUpDown
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortBy)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-gray-border bg-brand-gray-soft text-sm font-bold text-brand-navy focus:outline-none focus:border-brand-yellow2 focus:ring-2 focus:ring-brand-yellow1/30"
                            >
                                <option value="date_desc">Tanggal Terbaru</option>
                                <option value="date_asc">Tanggal Terlama</option>
                                <option value="name_asc">Nama A-Z</option>
                                <option value="name_desc">Nama Z-A</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-yellow1/20 text-brand-navy">
                            Total: {items.length}
                        </span>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Tampil: {filtered.length}
                        </span>
                        {(search || monthFilter !== 'all' || yearFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setMonthFilter('all');
                                    setYearFilter('all');
                                    setSortBy('date_desc');
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-brand-gray-border overflow-hidden">
                <div className="px-5 py-4 border-b border-brand-gray-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-navy/[0.06] flex items-center justify-center">
                            <ClipboardList size={18} className="text-brand-navy/60" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-navy">Data Pengukuran</p>
                            <p className="text-xs text-brand-navy/40 mt-0.5">
                                {filtered.length} data ditemukan
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 rounded-xl bg-brand-gray-soft animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-bold text-brand-navy/70">
                            Tidak ada data yang cocok
                        </p>
                        <p className="text-sm text-brand-navy/40 mt-1">
                            Coba ubah filter bulan, tahun, atau kata pencarian.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-brand-gray-soft text-brand-navy/50">
                                    <tr>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">Tanggal</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">Pasien</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">Petugas</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">SBP</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">DBP</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">BPM</th>
                                        <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">MAP</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filtered.map((item, index) => (
                                        <tr
                                            key={`${item.patientId}-${item.id ?? index}`}
                                            className="border-t border-brand-gray-border hover:bg-brand-yellow1/5 transition"
                                        >
                                            <td className="px-5 py-4 text-brand-navy/60 font-medium">
                                                {item.datetime}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-brand-navy">
                                                {item.patientName}
                                            </td>
                                            <td className="px-5 py-4 text-brand-navy/60">
                                                {item.nurseName}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-brand-navy">
                                                {item.sbp}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-brand-navy">
                                                {item.dbp}
                                            </td>
                                            <td className="px-5 py-4 text-brand-navy/70">
                                                {item.bpm}
                                            </td>
                                            <td className="px-5 py-4 text-brand-navy/70">
                                                {item.map}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="md:hidden divide-y divide-brand-gray-border">
                            {filtered.map((item, index) => (
                                <div key={`${item.patientId}-${item.id ?? index}`} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-brand-navy">
                                                {item.patientName}
                                            </p>
                                            <p className="text-xs text-brand-navy/45 mt-0.5">
                                                {item.nurseName} · {item.datetime}
                                            </p>
                                        </div>

                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand-yellow1/20 text-brand-navy">
                                            {item.sbp}/{item.dbp}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        <div className="bg-brand-gray-soft rounded-xl p-3">
                                            <p className="text-[10px] uppercase text-brand-navy/40 font-bold">
                                                BPM
                                            </p>
                                            <p className="font-bold text-brand-navy mt-1">
                                                {item.bpm}
                                            </p>
                                        </div>

                                        <div className="bg-brand-gray-soft rounded-xl p-3">
                                            <p className="text-[10px] uppercase text-brand-navy/40 font-bold">
                                                MAP
                                            </p>
                                            <p className="font-bold text-brand-navy mt-1">
                                                {item.map}
                                            </p>
                                        </div>

                                        <div className="bg-brand-gray-soft rounded-xl p-3">
                                            <p className="text-[10px] uppercase text-brand-navy/40 font-bold">
                                                DBP
                                            </p>
                                            <p className="font-bold text-brand-navy mt-1">
                                                {item.dbp}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}