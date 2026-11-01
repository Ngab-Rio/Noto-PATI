"use client";

import { Landmark, MapPin, Waves, Building2, TreePine, Home } from "lucide-react";
import { useEffect, useRef } from "react";

export function PatiHeroVisual() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;

      scene.style.setProperty("--mouse-x", `${x}deg`);
      scene.style.setProperty("--mouse-y", `${y}deg`);
    };

    scene.addEventListener("mousemove", handleMouseMove);
    return () => scene.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={sceneRef}
      className="pati-hero-visual-3d" 
      role="img" 
      aria-label="Visualisasi 3D Kabupaten Pati dengan landmark dan infrastruktur"
    >
      {/* Background gradient orbs */}
      <div className="pati-3d-orb pati-3d-orb-one" />
      <div className="pati-3d-orb pati-3d-orb-two" />
      <div className="pati-3d-orb pati-3d-orb-three" />

      {/* 3D Scene Container */}
      <div className="pati-3d-scene">
        {/* Base Platform */}
        <div className="pati-3d-platform">
          {/* Grid pattern */}
          <div className="pati-3d-grid" />
          
          {/* Main landmass representing Pati region */}
          <div className="pati-3d-land">
            {/* Rice fields */}
            <div className="pati-rice-field pati-rice-1" />
            <div className="pati-rice-field pati-rice-2" />
            <div className="pati-rice-field pati-rice-3" />
            <div className="pati-rice-field pati-rice-4" />
          </div>

          {/* Roads network */}
          <div className="pati-3d-road pati-road-h" />
          <div className="pati-3d-road pati-road-v" />

          {/* Buildings and landmarks */}
          <div className="pati-3d-building pati-building-1">
            <Building2 className="pati-building-icon" />
          </div>
          <div className="pati-3d-building pati-building-2">
            <Landmark className="pati-building-icon" />
          </div>
          <div className="pati-3d-building pati-building-3">
            <Home className="pati-building-icon" />
          </div>

          {/* Trees */}
          <div className="pati-3d-tree pati-tree-1">
            <TreePine className="pati-tree-icon" />
          </div>
          <div className="pati-3d-tree pati-tree-2">
            <TreePine className="pati-tree-icon" />
          </div>
          <div className="pati-3d-tree pati-tree-3">
            <TreePine className="pati-tree-icon" />
          </div>

          {/* Report markers (animated pins) */}
          <div className="pati-3d-marker pati-marker-1">
            <div className="pati-marker-pin" />
            <div className="pati-marker-pulse" />
          </div>
          <div className="pati-3d-marker pati-marker-2">
            <div className="pati-marker-pin" />
            <div className="pati-marker-pulse" />
          </div>
          <div className="pati-3d-marker pati-marker-3">
            <div className="pati-marker-pin" />
            <div className="pati-marker-pulse" />
          </div>
        </div>
      </div>

      {/* Floating info labels */}
      <div className="pati-3d-label pati-label-reports">
        <div className="pati-label-icon">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="pati-label-content">
          <div className="pati-label-title">1.248</div>
          <div className="pati-label-subtitle">Laporan Warga</div>
        </div>
      </div>

      <div className="pati-3d-label pati-label-budget">
        <div className="pati-label-icon">
          <Landmark className="h-4 w-4" />
        </div>
        <div className="pati-label-content">
          <div className="pati-label-title">APBD</div>
          <div className="pati-label-subtitle">Lebih Terbuka</div>
        </div>
      </div>

      <div className="pati-3d-label pati-label-location">
        <div className="pati-label-icon">
          <Waves className="h-4 w-4" />
        </div>
        <div className="pati-label-content">
          <div className="pati-label-title">Pati</div>
          <div className="pati-label-subtitle">Jawa Tengah</div>
        </div>
      </div>

      {/* Bottom caption */}
      <div className="pati-3d-caption">
        <span className="pati-caption-dot" />
        <span>Ruang Warga Kabupaten Pati</span>
      </div>
    </div>
  );
}
