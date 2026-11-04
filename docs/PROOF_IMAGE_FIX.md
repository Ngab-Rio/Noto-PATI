# Perbaikan Gambar Bukti Penyelesaian di Admin Timeline

## Masalah
Gambar bukti penyelesaian (completion proof) yang diupload oleh admin tidak tampil di timeline detail laporan admin. Hanya menampilkan alt text, dan ketika diklik mengarah ke halaman 404.

## Akar Penyebab
Admin timeline menggunakan URL mentah dari database (`proof_image_url`), sedangkan citizen timeline menggunakan signed URLs yang di-generate oleh Supabase Storage.

### Perbandingan Implementasi

**Citizen View (Bekerja dengan Baik):**
```typescript
// src/app/(public)/reports/[id]/page.tsx
const proofPaths = history
  .map((entry) => entry.proof_image_url)
  .filter((path): path is string => Boolean(path));
const proofUrls = await getSignedCompletionEvidenceUrls(proofPaths);
```

**Admin View (Sebelum Perbaikan):**
```typescript
// src/features/admin/server-data.ts
timeline: history.map((entry) => ({
  proofImage: entry.proof_image_url ?? undefined, // URL mentah dari database
}))
```

## Solusi
Menambahkan signed URL generation di `src/features/admin/server-data.ts`:

### 1. Import Fungsi Signed URL
```typescript
import { 
  getSignedPhotoUrls, 
  getSignedCompletionEvidenceUrls 
} from "@/lib/reports/signed-urls";
```

### 2. Generate Signed URLs untuk Proof Images
```typescript
export async function getAdminReports(): Promise<AdminReportItem[]> {
  // ... existing code ...
  
  // Generate signed URLs untuk foto laporan
  const signedUrls = await getSignedPhotoUrls(
    photoRows.map((photo) => photo.storage_path)
  );
  
  // Generate signed URLs untuk proof completion evidence
  const proofPaths = historyRows
    .map((entry) => entry.proof_image_url)
    .filter((path): path is string => Boolean(path));
  const proofSignedUrls = await getSignedCompletionEvidenceUrls(proofPaths);
  
  // ... rest of code ...
}
```

### 3. Update Timeline Mapping
```typescript
function toReportItem(
  report: ReportRow,
  profile: ProfileRow | undefined,
  photos: PhotoRow[],
  history: HistoryRow[],
  signedUrls: Map<string, string>,
  proofSignedUrls: Map<string, string>, // Parameter baru
): AdminReportItem {
  // ...
  timeline: history.map((entry) => ({
    id: entry.id,
    status: normalizeReportStatus(entry.status),
    actor: entry.changed_by ? "Pengguna terautentikasi" : "Sistem",
    role: entry.changed_by ? "warga" : "sistem",
    note: entry.note ?? undefined,
    proofImage: entry.proof_image_url 
      ? proofSignedUrls.get(entry.proof_image_url) // Gunakan signed URL
      : undefined,
    timestamp: formatDate(entry.created_at),
  }))
}
```

## Detail Teknis

### Signed URL Configuration
- **Bucket:** `completion-evidence`
- **TTL:** 600 detik (10 menit)
- **Public Access:** Ya (bucket setting)
- **Cache:** Tidak di-cache (berbeda dengan report photos)

### Fungsi getSignedCompletionEvidenceUrls
```typescript
export async function getSignedCompletionEvidenceUrls(
  paths: string[]
): Promise<Map<string, string>> {
  const { data } = await createAdminClient()
    .storage.from("completion-evidence")
    .createSignedUrls([...new Set(paths)], SIGNED_URL_TTL_SECONDS);
  
  const signed = new Map<string, string>();
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) {
      signed.set(item.path, item.signedUrl);
    }
  }
  return signed;
}
```

## Testing
1. Login sebagai admin
2. Buka detail laporan yang memiliki status "Selesai"
3. Verifikasi gambar bukti penyelesaian tampil di timeline
4. Klik gambar, seharusnya membuka image viewer atau tab baru dengan gambar
5. Tidak ada error 404

## Files Modified
- `src/features/admin/server-data.ts`
  - Import `getSignedCompletionEvidenceUrls`
  - Generate signed URLs untuk proof images
  - Update `toReportItem` untuk menerima `proofSignedUrls` parameter
  - Map signed URLs ke timeline items

## Related Issues
- Issue #08: Admin Dashboard - Real Reports & Map
- Subtask: Display completion proof in admin timeline

## Commit
- Branch: `feat/admin-dashboard-real-reports-map`
- Fixes: Completion proof images not displaying in admin timeline
