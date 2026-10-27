import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminQueueTable } from "@/features/admin/components/admin-queue-table";
import {
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_ACTIVITIES,
} from "@/features/admin/mock-data";

export const metadata: Metadata = {
  title: "Dashboard Admin · Noto PATI",
  description: "Panel pengelolaan dan verifikasi laporan infrastruktur warga Kabupaten Pati.",
  robots: { index: false, follow: false },
};

const STATUS_DISTRIBUTION = [
  { label: "Diterima", count: 18, bg: "bg-status-diterima-bg", text: "text-status-diterima-text", pct: 12 },
  { label: "Diverifikasi", count: 24, bg: "bg-status-diverifikasi-bg", text: "text-status-diverifikasi-text", pct: 15 },
  { label: "Diproses", count: 42, bg: "bg-status-diproses-bg", text: "text-status-diproses-text", pct: 27 },
  { label: "Selesai", count: 61, bg: "bg-status-selesai-bg", text: "text-status-selesai-text", pct: 39 },
  { label: "Ditolak", count: 8, bg: "bg-status-ditolak-bg", text: "text-status-ditolak-text", pct: 5 },
  { label: "Digabung", count: 3, bg: "bg-status-digabung-bg", text: "text-status-digabung-text", pct: 2 },
];

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconBg,
  iconColor,
  hasTrend,
  trendValue,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  hasTrend?: boolean;
  trendValue?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {hasTrend && trendValue !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trendValue >= 0 ? "text-status-selesai-text" : "text-status-ditolak-text"
            }`}
          >
            <TrendingUp className={`h-3.5 w-3.5 ${trendValue < 0 ? "rotate-180" : ""}`} />
            <span>
              {trendValue > 0 ? "+" : ""}
              {trendValue}% bln ini
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-text tracking-tight">{value}</div>
        <div className="text-sm font-semibold text-text mt-0.5">{label}</div>
        {sublabel && <div className="text-xs text-text-muted mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const overdueCount = MOCK_ADMIN_REPORTS.filter((r) => r.isOverdue).length;
  const pendingCount = MOCK_ADMIN_REPORTS.filter((r) => r.status === "diterima").length;
  const inProgressCount = MOCK_ADMIN_REPORTS.filter(
    (r) => r.status === "diverifikasi" || r.status === "diproses"
  ).length;

  return (
    <div className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-2.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Pusat Kendali Administrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Dashboard Pengelolaan Infrastruktur
            </h1>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              Pantau laporan masuk, verifikasi berkas warga, dan pantau pemenuhan SLA 24 jam di Kabupaten Pati.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/admin/reports">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ClipboardList className="h-4 w-4" />
                <span>Semua Laporan</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ── SLA Warning Banner ── */}
        {overdueCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-status-ditolak-text/25 bg-status-ditolak-bg/50 p-4 sm:px-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-status-ditolak-text shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-status-ditolak-text">
                  Perhatian: {overdueCount} laporan telah melewati batas waktu SLA verifikasi (24 jam)
                </p>
                <p className="text-xs text-status-ditolak-text/85 mt-0.5">
                  Segera tinjau laporan yang ditandai merah agar tidak melanggar standar komitmen pelayanan publik.
                </p>
              </div>
            </div>
            <a href="#queue" className="shrink-0">
              <Button size="sm" variant="destructive" className="gap-1.5 text-xs w-full sm:w-auto">
                Lihat Laporan Terlambat
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Laporan"
            value={156}
            sublabel="Sejak platform diluncurkan"
            icon={ClipboardList}
            iconBg="bg-primary-soft"
            iconColor="text-primary"
            hasTrend
            trendValue={14}
          />
          <StatCard
            label="Menunggu Verifikasi"
            value={pendingCount}
            sublabel="Batas SLA 24 jam kalender"
            icon={Clock}
            iconBg="bg-status-diterima-bg"
            iconColor="text-status-diterima-text"
          />
          <StatCard
            label="Sedang Dikerjakan"
            value={inProgressCount}
            sublabel="Dalam tahap perbaikan lapangan"
            icon={Activity}
            iconBg="bg-status-diproses-bg"
            iconColor="text-status-diproses-text"
          />
          <StatCard
            label="Berhasil Diselesaikan"
            value={98}
            sublabel="Rasio tuntas 62.8%"
            icon={CheckCircle2}
            iconBg="bg-status-selesai-bg"
            iconColor="text-status-selesai-text"
            hasTrend
            trendValue={8}
          />
        </div>

        {/* ── Main Section: Interactive Queue + Side Panels ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* ── Left 2 Columns: Queue Table ── */}
          <div className="xl:col-span-2 space-y-4" id="queue">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text">Antrean Laporan Aktif</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Laporan masyarakat yang membutuhkan peninjauan dan tindakan dari dinas
                </p>
              </div>
              <Link href="/admin/reports">
                <Button variant="ghost" size="sm" className="gap-1 text-primary text-xs hover:text-primary-dark">
                  <span>Lihat semua</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {/* Interactive Client Queue Table */}
            <AdminQueueTable initialReports={MOCK_ADMIN_REPORTS} />
          </div>

          {/* ── Right Column: Sidebar Panels ── */}
          <div className="space-y-5">
            {/* 1. Status Distribution */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text">Distribusi Status Laporan</h3>
                <span className="text-xs text-text-muted font-medium">156 Total</span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="h-3 rounded-full overflow-hidden flex gap-0.5 mb-3.5 bg-background">
                {STATUS_DISTRIBUTION.map((d) => (
                  <div
                    key={d.label}
                    title={`${d.label}: ${d.count} laporan (${d.pct}%)`}
                    style={{ width: `${d.pct}%` }}
                    className={`${d.bg} transition-all`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {STATUS_DISTRIBUTION.map((d) => (
                  <div key={d.label} className="flex items-center justify-between p-1.5 rounded hover:bg-background/60">
                    <div className="flex items-center gap-2 truncate">
                      <div className={`h-2.5 w-2.5 rounded-sm shrink-0 ${d.bg}`} />
                      <span className="text-text-muted truncate">{d.label}</span>
                    </div>
                    <span className={`font-semibold ml-2 ${d.text}`}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Quick Action Shortcuts */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <h3 className="text-sm font-bold text-text mb-3">Pintasan Tindakan</h3>
              <div className="space-y-1.5">
                {[
                  {
                    href: "/admin/reports?status=diterima",
                    icon: Clock,
                    iconBg: "bg-status-diterima-bg",
                    iconColor: "text-status-diterima-text",
                    label: "Verifikasi Laporan Baru",
                    count: pendingCount,
                    countBg: "bg-status-diterima-bg",
                    countColor: "text-status-diterima-text",
                  },
                  {
                    href: "/admin/reports?status=diverifikasi",
                    icon: Activity,
                    iconBg: "bg-status-diverifikasi-bg",
                    iconColor: "text-status-diverifikasi-text",
                    label: "Tindak Lanjut Lapangan",
                    count: inProgressCount,
                    countBg: "bg-status-diverifikasi-bg",
                    countColor: "text-status-diverifikasi-text",
                  },
                  {
                    href: "/admin/reports?overdue=true",
                    icon: AlertTriangle,
                    iconBg: "bg-status-ditolak-bg",
                    iconColor: "text-status-ditolak-text",
                    label: "Laporan Kritis SLA",
                    count: overdueCount,
                    countBg: "bg-status-ditolak-bg",
                    countColor: "text-status-ditolak-text",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-primary-soft/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center ${item.iconBg}`}>
                        <item.icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                      </div>
                      <span className="text-xs font-semibold text-text">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${item.countBg} ${item.countColor}`}>
                        {item.count}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-text transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. SLA Service Standard Guide */}
            <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-primary">Standar SLA Layanan Demo</h4>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    • <strong>Verifikasi Laporan:</strong> Maks. 24 jam kalender setelah dikirimkan warga.<br />
                    • <strong>Penanganan:</strong> Target 7 hari kalender setelah status diverifikasi.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Recent Admin Activity Log */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-bold text-text">Log Tindakan Terakhir</h3>
                <span className="text-[11px] text-text-muted">Audit trail</span>
              </div>

              <div className="space-y-3.5">
                {MOCK_ADMIN_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex gap-2.5 items-start">
                    <div className="h-6 w-6 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text leading-snug">
                        <span className="font-semibold">{act.actor}</span>{" "}
                        <span className="text-text-muted">{act.action}</span>
                      </p>
                      <p className="text-[11px] text-text font-medium truncate mt-0.5">{act.note}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-muted font-mono">{act.reportId}</span>
                        <span className="text-[10px] text-text-muted">· {act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}