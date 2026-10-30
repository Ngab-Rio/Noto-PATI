# Public Map & Report Discovery

Documentation for the public map feature that displays infrastructure reports on an interactive map.

## Overview

The Public Map is an interactive visualization that allows citizens to explore and discover infrastructure reports across Kabupaten Pati. It provides geographical context for submitted reports and helps identify areas with high concentrations of issues.

## Tech Stack

- **Map Library**: MapLibre GL JS v4.x
- **Basemap**: OpenStreetMap tiles
- **Data Format**: GeoJSON
- **Rendering**: Client-side with Server API
- **Styling**: Tailwind CSS + Custom Map Styles

## Features Implemented

### ✅ Phase 1: Basic Map Interface

1. **Interactive Map**
   - OpenStreetMap basemap
   - Center: Kabupaten Pati (111.0379°E, -6.7558°S)
   - Zoom levels: 8-18
   - Pan and zoom controls
   - Geolocate control

2. **Report Markers**
   - Circle markers for each report
   - Color-coded by status:
     - 🔵 Blue: `diterima` (Received)
     - 🟣 Purple: `diverifikasi` (Verified)
     - 🟡 Amber: `diproses` (In Progress)
     - 🟢 Green: `selesai` (Completed)
     - 🔴 Red: `ditolak` (Rejected)
   - Hover effect with pointer cursor

3. **Interactive Popups**
   - Click marker to show popup
   - Display: ticket number, title, category, status
   - "Lihat Detail" button to view full report
   - Auto-close on outside click

4. **Status Filters**
   - Multi-select status filters
   - Real-time map updates
   - Reset filters button
   - Visual legend

5. **Loading & Error States**
   - Loading spinner during initialization
   - Error fallback with reload button
   - Report count badge

## API Endpoints

### GET `/api/reports/map`

Fetch reports for map display in GeoJSON format.

**Query Parameters:**
- `categories` (optional): Comma-separated list of categories
- `statuses` (optional): Comma-separated list of statuses
- `kecamatan` (optional): Filter by district
- `dateFrom` (optional): ISO date string
- `dateTo` (optional): ISO date string

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [111.0379, -6.7558]
      },
      "properties": {
        "id": "uuid",
        "ticketNumber": "NP-2026-000001",
        "title": "Jalan berlubang...",
        "category": "jalan",
        "status": "diterima",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    }
  ]
}
```

**Limits:**
- Maximum 1000 reports per request
- Only reports with valid coordinates

## Components

### `PublicReportsMap`

Main map component using MapLibre GL JS.

**Props:**
```typescript
interface PublicReportsMapProps {
  onMarkerClick?: (reportId: string) => void;
  filters?: {
    categories?: string[];
    statuses?: string[];
    kecamatan?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}
```

**Features:**
- Automatic map initialization
- Dynamic marker loading based on filters
- Popup interaction
- Reset view button
- Report count display

### `MapPageClient`

Client-side page component with filter controls.

**Features:**
- Status filter buttons
- Filter state management
- Map integration
- Responsive layout

## Data Privacy

The map only displays **public-safe** report information:

✅ **Included:**
- Report ID and ticket number
- Title, category, status
- Geographic coordinates
- Creation timestamp

❌ **Excluded:**
- Reporter identity (name, email, phone)
- Personal information
- Private notes
- Admin internal data

## Performance Considerations

1. **Query Limits**
   - 1000 reports maximum per request
   - Server-side filtering
   - Only reports with coordinates

2. **Client-side Optimization**
   - GeoJSON source caching
   - Efficient circle rendering
   - Conditional layer updates

3. **Network**
   - OSM tile caching by browser
   - Compressed GeoJSON responses
   - Lazy marker loading

## Future Enhancements

### 🚧 Phase 2: Advanced Features (Not Yet Implemented)

1. **Marker Clustering**
   - Automatic grouping of nearby reports
   - Cluster size indicators
   - Progressive zoom expansion

2. **Heatmap Visualization**
   - Density-based coloring
   - Toggle between markers and heatmap
   - Intensity adjustment

3. **Advanced Filters**
   - Category multi-select
   - Date range picker
   - District/kecamatan filter
   - Search by location

4. **Report List View**
   - Alternative to map visualization
   - Pagination
   - Sorting options

5. **Map Statistics**
   - Total reports by status
   - Reports by category
   - Hot spots identification

6. **Viewport-based Loading**
   - Load reports within visible area
   - Dynamic loading on pan/zoom
   - PostGIS spatial queries

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:3000/map
```

### Testing

```bash
# Type check
npm run typecheck

# Build
npm run build

# Lint
npm run lint
```

### Adding Test Data

Use the report submission form at `/report/new` to create test reports with coordinates. Make sure to enable location permissions in your browser.

## Troubleshooting

### Map Not Loading

1. Check browser console for errors
2. Verify network connection (OSM tiles)
3. Check if coordinates are valid
4. Confirm Supabase connection

### Markers Not Showing

1. Verify reports have `latitude` and `longitude`
2. Check API response in Network tab
3. Confirm reports are within Pati region
4. Check filter settings

### Performance Issues

1. Reduce visible reports with filters
2. Check network throttling
3. Verify browser WebGL support
4. Clear browser cache

## References

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [GeoJSON Specification](https://geojson.org/)
- [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [Issue #6: Public Map & Report Discovery](../docs/issues/)

## Contributors

Built with ❤️ for Noto PATI civic reporting platform.
