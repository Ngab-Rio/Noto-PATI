import { requireUser } from "@/lib/auth/guards";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe,
  Eye,
  Mail,
  Smartphone,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  // Require authentication
  await requireUser("/profile/settings");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
          <Settings className="h-3.5 w-3.5" />
          <span>Pengaturan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Pengaturan Akun
        </h1>
        <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
          Kelola preferensi notifikasi, privasi, dan keamanan akun Anda
        </p>
      </div>

      {/* Notification Settings */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Notifikasi</h2>
            <p className="text-xs text-text-muted">Atur cara kami mengirim pembaruan kepada Anda</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Notifikasi Email</h3>
                <p className="text-xs text-text-muted mt-1">
                  Terima pembaruan status laporan via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* WhatsApp Notifications (Future) */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Notifikasi WhatsApp</h3>
                <p className="text-xs text-text-muted mt-1">
                  Terima notifikasi penting via WhatsApp
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium mt-2">
                  Segera Hadir
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
            </label>
          </div>

          {/* Status Updates */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Update Status Laporan</h3>
                <p className="text-xs text-text-muted mt-1">
                  Notifikasi saat status laporan berubah
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
            <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Privasi</h2>
            <p className="text-xs text-text-muted">Kontrol siapa yang dapat melihat informasi Anda</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Show Profile in Leaderboard */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Tampil di Papan Peringkat</h3>
                <p className="text-xs text-text-muted mt-1">
                  Izinkan nama Anda muncul di papan peringkat publik
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Anonymous Reporting */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Laporan Anonim</h3>
                <p className="text-xs text-text-muted mt-1">
                  Sembunyikan identitas pada laporan publik
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium mt-2">
                  Segera Hadir
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
              <input type="checkbox" className="sr-only peer" disabled />
              <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Keamanan</h2>
            <p className="text-xs text-text-muted">Lindungi akun Anda</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Ubah Password</h3>
                <p className="text-xs text-text-muted mt-1">
                  Perbarui password Anda secara berkala
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Ubah
            </Button>
          </div>

          {/* Two-Factor Auth */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-text">Autentikasi 2 Faktor</h3>
                <p className="text-xs text-text-muted mt-1">
                  Tambah lapisan keamanan ekstra ke akun Anda
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium mt-2">
                  Segera Hadir
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Aktifkan
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
          Zona Berbahaya
        </h2>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Tindakan berikut bersifat permanen dan tidak dapat dibatalkan
        </p>
        
        <Button variant="destructive" size="sm">
          Hapus Akun
        </Button>
      </div>

      {/* Info Notice */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>💡 Catatan:</strong> Beberapa fitur masih dalam pengembangan dan akan segera tersedia. 
          Kami terus meningkatkan pengalaman Anda di Noto PATI.
        </p>
      </div>
    </div>
  );
}
