'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import {
    listenPatients,
    listenMeasurements,
    type Patient,
    type Measurement,
} from '@/lib/firebase';
import {
    Search,
    ArrowUpDown,
    CalendarDays,
    Filter,
    ClipboardList,
    Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

type SortBy = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

type HistoryItem = Measurement & {
    patientName: string;
    nurseName: string;
};

const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function getItemDate(item: HistoryItem) {
    if (item.timestamp_ms && item.timestamp_ms > 1000000000000) {
        return new Date(item.timestamp_ms);
    }

    if (item.datetime) {
        return new Date(item.datetime.replace(' ', 'T'));
    }

    return new Date(0);
}

function classifyBP(sbp: number, dbp: number) {
    if (sbp >= 160 || dbp >= 110) return 'Berat';
    if (sbp >= 140 || dbp >= 90) return 'Tinggi';
    if (sbp >= 130 || dbp >= 80) return 'Waspada';
    return 'Normal';
}

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
            const year = getItemDate(item).getFullYear();
            if (year > 2000) years.add(year);
        });

        return Array.from(years).sort((a, b) => b - a);
    }, [items]);

    const filtered = useMemo(() => {
        const keyword = search.toLowerCase();

        const result = items.filter((item) => {
            const date = getItemDate(item);

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
            const dateA = getItemDate(a).getTime();
            const dateB = getItemDate(b).getTime();

            if (sortBy === 'date_desc') return dateB - dateA;
            if (sortBy === 'date_asc') return dateA - dateB;
            if (sortBy === 'name_asc') return a.patientName.localeCompare(b.patientName);
            if (sortBy === 'name_desc') return b.patientName.localeCompare(a.patientName);
            return 0;
        });

        return result;
    }, [items, search, sortBy, monthFilter, yearFilter]);

    const handleExportExcel = () => {
        const rows = filtered.map((item, index) => ({
            No: index + 1,
            Tanggal: item.datetime,
            'Nama Pasien': item.patientName,
            Petugas: item.nurseName,
            SBP: item.sbp,
            DBP: item.dbp,
            BPM: item.bpm,
            MAP: item.map,
            'Status Tekanan Darah': classifyBP(item.sbp, item.dbp),
            'Patient ID': item.patientId,
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 22 },
            { wch: 22 },
            { wch: 18 },
            { wch: 8 },
            { wch: 8 },
            { wch: 8 },
            { wch: 8 },
            { wch: 22 },
            { wch: 28 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Pengukuran');

        const monthName =
            monthFilter === 'all' ? 'semua-bulan' : months[Number(monthFilter)];
        const yearName = yearFilter === 'all' ? 'semua-tahun' : yearFilter;

        XLSX.writeFile(
            workbook,
            `riwayat-pengukuran-${monthName}-${yearName}.xlsx`
        );
    };

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

                    <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-yellow1/20 text-brand-navy">
                                Total: {items.length}
                            </span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                Tampil: {filtered.length}
                            </span>
                        </div>

                        <button
                            onClick={handleExportExcel}
                            disabled={filtered.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-yellow2 text-brand-navy text-xs font-bold hover:bg-brand-yellow1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={15} />
                            Export Excel
                        </button>
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
                    <div className="overflow-x-auto">
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
                                    <th className="text-left px-5 py-3 font-bold uppercase text-[11px]">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((item, index) => (
                                    <tr
                                        key={`${item.patientId}-${item.id ?? index}`}
                                        className="border-t border-brand-gray-border hover:bg-brand-yellow1/5 transition"
                                    >
                                        <td className="px-5 py-4 text-brand-navy/60 font-medium whitespace-nowrap">
                                            {item.datetime}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-brand-navy">
                                            {item.patientName}
                                        </td>
                                        <td className="px-5 py-4 text-brand-navy/60">
                                            {item.nurseName}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-brand-navy">{item.sbp}</td>
                                        <td className="px-5 py-4 font-bold text-brand-navy">{item.dbp}</td>
                                        <td className="px-5 py-4 text-brand-navy/70">{item.bpm}</td>
                                        <td className="px-5 py-4 text-brand-navy/70">{item.map}</td>
                                        <td className="px-5 py-4 font-bold text-brand-navy/70">
                                            {classifyBP(item.sbp, item.dbp)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppShell>
    );
}