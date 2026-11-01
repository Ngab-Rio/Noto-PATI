"use client";

import Image from "next/image";

export function PatiHeroVisual() {
  return (
    <div 
      className="pati-minimal-hero" 
      role="img" 
      aria-label="Peta Kabupaten Pati"
    >
      <div className="pati-map-layer">
        <Image
          src="/images/illustrations/map_pati.svg"
          alt="Peta Kabupaten Pati"
          width={912}
          height={1146}
          className="pati-map-image"
          priority
          quality={90}
        />
      </div>
      
      {/* 
      <div className="bandeng-statue-full">
        <Image
          src="/images/photos/pati_bandeng_state.avif"
          alt="Patung Ikan Bandeng - Landmark Ikonik Kabupaten Pati"
          width={2000}
          height={2200}
          className="bandeng-statue-hero"
          priority
          quality={95}
        />
      </div>
      */}
    </div>
  );
}
