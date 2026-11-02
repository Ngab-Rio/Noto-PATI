import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.");
}

const geojson = JSON.parse(await readFile("pati.geojson", "utf8"));
const feature = geojson.features?.[0];

if (
  geojson.type !== "FeatureCollection"
  || geojson.features?.length !== 1
  || feature?.geometry?.type !== "Polygon"
  || feature?.properties?.namobj !== "Pati"
  || Number(feature?.properties?.srs_id) !== 4326
) {
  throw new Error("pati.geojson harus berupa satu Feature Polygon Pati dengan CRS EPSG:4326.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase.rpc("upsert_pati_region", {
  p_boundary_geojson: feature.geometry,
  p_source: "pati.geojson",
  p_source_feature_id: String(feature.id ?? feature.properties.objectid),
  p_verified_at: new Date().toISOString().slice(0, 10),
});

if (error) {
  throw new Error(`Gagal menyimpan polygon Kabupaten Pati: ${error.message}`);
}

console.log("Polygon Kabupaten Pati berhasil disimpan dan divalidasi.");
