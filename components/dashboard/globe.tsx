"use client"

import React, { useEffect, useState, useRef } from 'react'
import Globe from 'react-globe.gl'

// Mock Data: In a real app, this would come from your "usePlanetaryLogic" hook
const supportTransfers = [
  { startLat: 40.7128, startLng: -74.0060, endLat: -1.2921, endLng: 36.8219, color: '#00ff41', label: 'Medical Supplies: NY → Nairobi' },
  { startLat: 48.8566, startLng: 2.3522, endLat: 30.0444, endLng: 31.2357, color: '#00ff41', label: 'Water Rights: Paris → Cairo' },
  { startLat: 35.6762, startLng: 139.6503, endLat: 19.0760, endLng: 72.8777, color: '#00ff41', label: 'Tech Aid: Tokyo → Mumbai' }
]

export const ThreeGlobe = () => {
  const globeRef = useRef<any>()

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate the globe slowly
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
      
      // Position the camera
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
    }
  }, [])

  return (
    <div className="w-full h-full">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)" // Transparent to show your dashboard background
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // --- ARC SETTINGS (The Transfers) ---
        arcsData={supportTransfers}
        arcColor={'color'}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={2000} // This makes the lines "move"
        arcStroke={0.5}
        
        // --- LABEL SETTINGS (The Info) ---
        labelsData={supportTransfers}
        labelLat={d => (d as any).endLat}
        labelLng={d => (d as any).endLng}
        labelText={d => (d as any).label}
        labelSize={0.5}
        labelDotRadius={0.3}
        labelColor={() => '#00ff41'}
        labelResolution={2}

        // --- STYLING ---
        hexBinPointsData={[]} // You can add population density data here later
        hexBinPointWeight="pop"
        hexAltitude={0.1}
        hexTopColor={() => '#00ff41'}
        hexSideColor={() => '#00ff4133'}
      />
    </div>
  )
}
