import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.");
}

// Polygon global yang mencakup seluruh koordinat bumi untuk keperluan testing di luar wilayah Pati
const worldPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [-179.99, -89.99],
      [179.99, -89.99],
      [179.99, 89.99],
      [-179.99, 89.99],
      [-179.99, -89.99],
    ],
  ],
};

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase.rpc("upsert_pati_region", {
  p_boundary_geojson: worldPolygon,
  p_source: "testing_disabled_boundary",
  p_source_feature_id: "test_mode",
  p_verified_at: new Date().toISOString().slice(0, 10),
});

if (error) {
  throw new Error(`Gagal menonaktifkan pembatasan wilayah Pati: ${error.message}`);
}

console.log("✅ Pembatasan wilayah Kabupaten Pati berhasil dinonaktifkan untuk testing. Laporan dari luar wilayah Pati sekarang diizinkan.");
