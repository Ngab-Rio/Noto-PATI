import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_BG_COLORS,
  STATUS_LABELS,
} from "./map-constants";
import { escapeHtml, getSafePhotoUrl } from "./map-utils";
import type { ReportProperties } from "./map-types";

/**
 * Builds safe HTML markup for report marker popups in MapLibre.
 * Never includes reporter personal identity data (privacy compliance).
 */
export function buildPopupHTML(
  properties: ReportProperties,
  { adminMode = false }: { adminMode?: boolean } = {}
): string {
  const status = String(properties.status ?? "");
  const statusColor = STATUS_COLORS[status] ?? "#4B5563";
  const statusBg = STATUS_BG_COLORS[status] ?? "#F3F4F6";
  const statusLabel = STATUS_LABELS[status] ?? status;

  const category = String(properties.category ?? "");
  const categoryLabel = CATEGORY_LABELS[category] ?? category ?? "Lainnya";

  const photoUrl = getSafePhotoUrl(properties.photoUrl);
  const reportId = encodeURIComponent(String(properties.id ?? ""));
  const actionHref = adminMode ? `/admin/reports/${reportId}` : `/reports/${reportId}`;
  const actionLabel = adminMode ? "Kelola & Tinjau →" : "Lihat Detail Laporan →";
  const ticketNumber = escapeHtml(properties.ticketNumber);
  const title = escapeHtml(properties.title);
  const detailLocation = escapeHtml(properties.detailLocation);

  const photoSection = photoUrl
    ? `
      <div style="width:calc(100% + 24px);height:120px;overflow:hidden;border-radius:8px 8px 0 0;margin:-12px -12px 8px -12px;">
        <img
          src="${photoUrl}"
          alt="Foto laporan"
          style="width:100%;height:120px;object-fit:cover;display:block;"
          loading="lazy"
          onerror="this.parentElement.style.display='none'"
        />
      </div>
    `
    : "";

  return `
    <div style="min-width:240px;max-width:280px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      ${photoSection}
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <span style="font-size:11px;font-weight:600;color:#64748B;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
            ${ticketNumber}
          </span>
          <span style="font-size:10px;font-weight:700;color:${statusColor};background:${statusBg};padding:2px 8px;border-radius:12px;white-space:nowrap;text-transform:capitalize;">
            ${escapeHtml(statusLabel)}
          </span>
        </div>

        <h3 style="font-size:14px;font-weight:700;color:#0F172A;margin:0;line-height:1.35;">
          ${title}
        </h3>

        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
          <span style="font-size:10px;font-weight:600;color:#1E40AF;background:#DBEAFE;padding:2px 8px;border-radius:6px;">
            ${escapeHtml(categoryLabel)}
          </span>
        </div>

        <div style="display:flex;align-items:flex-start;gap:4px;font-size:11px;color:#64748B;">
          <svg width="12" height="12" viewBox="0 0 256 256" fill="none" style="margin-top:2px;flex-shrink:0;">
            <path d="M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.2 83.4 134.3a8 8 0 0 0 9.2 0C136 236.2 216 179.3 216 104a88.1 88.1 0 0 0-88-88Zm0 56a32 32 0 1 1-32 32 32 32 0 0 1 32-32Z" fill="#DC2626"/>
          </svg>
          <span style="line-height:1.35;word-break:break-word;">
            ${detailLocation}
          </span>
        </div>

        <a
          href="${actionHref}"
          style="display:block;text-align:center;margin-top:6px;padding:7px 12px;background:#2563EB;color:#FFFFFF;font-size:12px;font-weight:600;border-radius:8px;text-decoration:none;transition:background 0.2s;"
          onmouseover="this.style.background='#1D4ED8'"
          onmouseout="this.style.background='#2563EB'"
        >
          ${actionLabel}
        </a>
      </div>
    </div>
  `;
}
