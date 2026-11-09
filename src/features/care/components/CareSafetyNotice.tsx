import { IconShieldWarning, IconInfo } from "@/components/shared/icons";

interface CareSafetyNoticeProps {
  customMessage?: string;
}

export function CareSafetyNotice({ customMessage }: CareSafetyNoticeProps) {
  return (
    <div className="rounded-xl border border-amber-300/80 bg-amber-50/80 p-4 sm:p-5 text-amber-950 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 text-amber-800">
          <IconShieldWarning className="h-4 w-4" weight="bold" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-950">
            Prinsip Keselamatan Utama Warga
          </h4>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            {customMessage ??
              "Materi ini untuk keselamatan awal, bukan panduan perbaikan teknis. Jangan menyentuh kabel, bagian tajam, atau bahan yang tidak dikenal; jangan masuk gorong-gorong, mendekati tanggul yang retak atau tergerus, maupun memanjat jembatan. Menjauhlah dari bahaya, ikuti arahan petugas, dan laporkan melalui Noto PATI."}
          </p>
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-800/80 font-medium">
            <IconInfo className="h-3 w-3 shrink-0" />
            <span>Kewenangan perbaikan konstruksi fisik berada pada Dinas Teknis Pemerintah Kabupaten Pati.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
