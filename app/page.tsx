"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Line, Html, Stars } from "@react-three/drei"
import * as THREE from "three"

// Resource flow data - connections between providers and demand locations
const resourceFlows = [
  {
    id: "flow-1",
    from: { lat: 51.92, lng: 4.48, name: "Rotterdam" },
    to: { lat: 23.81, lng: 90.41, name: "Dhaka" },
    resource: "Wheat Grain",
    quantity: 12500,
    status: "active",
  },
  {
    id: "flow-2",
    from: { lat: 47.38, lng: 8.54, name: "Geneva" },
    to: { lat: 15.37, lng: 44.19, name: "Sanaa" },
    resource: "Vaccines",
    quantity: 500000,
    status: "pending",
  },
  {
    id: "flow-3",
    from: { lat: 37.57, lng: 126.98, name: "Seoul" },
    to: { lat: 33.89, lng: 35.5, name: "Beirut" },
    resource: "Battery Storage",
    quantity: 2500,
    status: "active",
  },
  {
    id: "flow-4",
    from: { lat: 35.68, lng: 139.65, name: "Tokyo" },
    to: { lat: 6.52, lng: 3.38, name: "Lagos" },
    resource: "Rice",
    quantity: 8000,
    status: "active",
  },
  {
    id: "flow-5",
    from: { lat: 41.88, lng: -87.63, name: "Chicago" },
    to: { lat: 19.08, lng: 72.88, name: "Mumbai" },
    resource: "Wheat Grain",
    quantity: 15000,
    status: "pending",
  },
]

// Demand hotspots
const demandHotspots = [
  { lat: 23.81, lng: 90.41, name: "Dhaka", priority: "critical", population: 21.7 },
  { lat: 15.37, lng: 44.19, name: "Sanaa", priority: "critical", population: 2.9 },
  { lat: 33.89, lng: 35.5, name: "Beirut", priority: "critical", population: 2.4 },
  { lat: 6.52, lng: 3.38, name: "Lagos", priority: "high", population: 15.4 },
  { lat: 19.08, lng: 72.88, name: "Mumbai", priority: "high", population: 20.4 },
  { lat: -6.21, lng: 106.85, name: "Jakarta", priority: "medium", population: 10.6 },
]

// Continental resource hotspots
const continentalHotspots = [
  {
    id: "africa",
    name: "East Africa",
    lat: 1.29,
    lng: 36.82,
    data: {
      status: "Surplus Detected",
      resource: "Wheat",
      percentage: 15,
      trend: "increasing",
      lastUpdate: "2 min ago",
    },
  },
  {
    id: "asia-south",
    name: "South Asia",
    lat: 20.59,
    lng: 78.96,
    data: {
      status: "High Demand",
      resource: "Rice",
      percentage: -8,
      trend: "critical",
      lastUpdate: "5 min ago",
    },
  },
  {
    id: "europe",
    name: "Western Europe",
    lat: 48.86,
    lng: 2.35,
    data: {
      status: "Surplus Available",
      resource: "Medicine",
      percentage: 22,
      trend: "stable",
      lastUpdate: "1 min ago",
    },
  },
  {
    id: "americas",
    name: "North America",
    lat: 39.83,
    lng: -98.58,
    data: {
      status: "Export Ready",
      resource: "Grain",
      percentage: 31,
      trend: "increasing",
      lastUpdate: "3 min ago",
    },
  },
  {
    id: "asia-east",
    name: "East Asia",
    lat: 35.86,
    lng: 104.2,
    data: {
      status: "Balanced",
      resource: "Energy",
      percentage: 3,
      trend: "stable",
      lastUpdate: "4 min ago",
    },
  },
  {
    id: "oceania",
    name: "Oceania",
    lat: -25.27,
    lng: 133.78,
    data: {
      status: "Surplus Detected",
      resource: "Water",
      percentage: 18,
      trend: "increasing",
      lastUpdate: "6 min ago",
    },
  },
]

// Convert lat/lng to 3D coordinates
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

// Generate arc points between two locations
function generateArcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments: number = 50,
  arcHeight: number = 0.3
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  mid.normalize().multiplyScalar(start.length() + arcHeight)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const t1 = (1 - t) * (1 - t)
    const t2 = 2 * (1 - t) * t
    const t3 = t * t

    const p = new THREE.Vector3(
      t1 * start.x + t2 * mid.x + t3 * end.x,
      t1 * start.y + t2 * mid.y + t3 * end.y,
      t1 * start.z + t2 * mid.z + t3 * end.z
    )
    points.push(p)
  }

  return points
}

// Grid lines for atmosphere effect
function GridSphere() {
  return (
    <group>
      {/* Latitude lines */}
      {[-60, -30, 0, 30, 60].map((lat) => {
        const points: THREE.Vector3[] = []
        for (let lng = 0; lng <= 360; lng += 5) {
          points.push(latLngToVector3(lat, lng, 2.05))
        }
        return (
          <Line
            key={`lat-${lat}`}
            points={points}
            color="#00DCDC"
            lineWidth={0.5}
            transparent
            opacity={0.08}
          />
        )
      })}
      {/* Longitude lines */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((lng) => {
        const points: THREE.Vector3[] = []
        for (let lat = -90; lat <= 90; lat += 5) {
          points.push(latLngToVector3(lat, lng, 2.05))
        }
        return (
          <Line
            key={`lng-${lng}`}
            points={points}
            color="#00DCDC"
            lineWidth={0.5}
            transparent
            opacity={0.08}
          />
        )
      })}
    </group>
  )
}

// Animated flow line component
function FlowLine({
  from,
  to,
  status,
}: {
  from: { lat: number; lng: number }
  to: { lat: number; lng: number }
  status: string
}) {
  const [dashOffset, setDashOffset] = useState(0)

  const points = useMemo(() => {
    const startPos = latLngToVector3(from.lat, from.lng, 2)
    const endPos = latLngToVector3(to.lat, to.lng, 2)
    return generateArcPoints(startPos, endPos, 50, 0.4)
  }, [from, to])

  useFrame((state) => {
    setDashOffset(state.clock.elapsedTime * 0.5)
  })

  const color = status === "active" ? "#00DCDC" : "#FFC832"

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed
      dashSize={0.05}
      dashOffset={-dashOffset}
      transparent
      opacity={0.8}
    />
  )
}

// Continental hotspot with glow effect
function ContinentalHotspot({
  name,
  lat,
  lng,
  data,
}: {
  name: string
  lat: number
  lng: number
  data: {
    status: string
    resource: string
    percentage: number
    trend: string
    lastUpdate: string
  }
}) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.03), [lat, lng])
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)

  const baseColor =
    data.trend === "critical"
      ? "#FF4444"
      : data.trend === "increasing"
        ? "#00DCDC"
        : "#FFC832"

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      meshRef.current.scale.setScalar(scale)
    }
    if (glowRef.current) {
      const glowScale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      glowRef.current.scale.setScalar(glowScale)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }
    if (outerGlowRef.current) {
      const outerScale = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.4
      outerGlowRef.current.scale.setScalar(outerScale)
      const mat = outerGlowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    }
  })

  const trendIcon = data.percentage > 0 ? "+" : ""
  const trendColor =
    data.trend === "critical"
      ? "#FF4444"
      : data.percentage > 0
        ? "#00FF88"
        : data.percentage < 0
          ? "#FF4444"
          : "#FFC832"

  return (
    <group position={position}>
      {/* Outer glow ring */}
      <mesh ref={outerGlowRef}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Middle glow ring */}
      <mesh ref={glowRef}>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Core hotspot */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.95} />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="bg-obsidian/95 border border-primary/40 px-4 py-3 rounded-lg text-xs whitespace-nowrap shadow-lg shadow-primary/20 backdrop-blur-sm min-w-[180px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
              <span className="font-mono text-foreground font-bold">{name}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                style={{ backgroundColor: `${baseColor}20`, color: baseColor }}
              >
                {data.trend.toUpperCase()}
              </span>
            </div>

            {/* Status */}
            <div className="mb-2">
              <div className="text-[10px] text-muted-foreground mb-0.5">STATUS</div>
              <div className="text-foreground font-medium">{data.status}</div>
            </div>

            {/* Resource */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">RESOURCE</div>
                <div className="text-foreground">{data.resource}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground mb-0.5">CHANGE</div>
                <div className="font-mono font-bold" style={{ color: trendColor }}>
                  {trendIcon}
                  {data.percentage}%
                </div>
              </div>
            </div>

            {/* Last update */}
            <div className="text-[9px] text-muted-foreground/70 pt-2 border-t border-border/30">
              Updated {data.lastUpdate}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Hotspot marker component
function HotspotMarker({
  lat,
  lng,
  name,
  priority,
  population,
}: {
  lat: number
  lng: number
  name: string
  priority: string
  population: number
}) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.02), [lat, lng])
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  const color =
    priority === "critical" ? "#FF4444" : priority === "high" ? "#FFC832" : "#00DCDC"

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.03, 0.045, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html distanceFactor={8}>
          <div className="bg-obsidian/90 border border-border px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            <div className="font-mono text-foreground font-semibold">{name}</div>
            <div className="text-muted-foreground">Pop: {population}M</div>
            <div className="font-mono uppercase text-[10px]" style={{ color }}>
              {priority}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Provider marker component
function ProviderMarker({ lat, lng }: { lat: number; lng: number }) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.02), [lat, lng])

  return (
    <mesh position={position}>
      <boxGeometry args={[0.03, 0.03, 0.03]} />
      <meshBasicMaterial color="#00DCDC" transparent opacity={0.9} />
    </mesh>
  )
}

// Globe mesh component
function GlobeMesh() {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <group ref={meshRef}>
      {/* Globe surface */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#0d0d1a" metalness={0.4} roughness={0.6} />
      </Sphere>

      {/* Grid overlay for atmosphere */}
      <GridSphere />

      {/* Atmosphere glow */}
      <Sphere args={[2.08, 64, 64]}>
        <meshBasicMaterial color="#00DCDC" transparent opacity={0.03} side={THREE.BackSide} />
      </Sphere>

      {/* Outer atmosphere */}
      <Sphere args={[2.15, 32, 32]}>
        <meshBasicMaterial color="#00DCDC" transparent opacity={0.015} side={THREE.BackSide} />
      </Sphere>

      {/* Resource flow lines */}
      {resourceFlows.map((flow) => (
        <FlowLine key={flow.id} from={flow.from} to={flow.to} status={flow.status} />
      ))}

      {/* Continental hotspots */}
      {continentalHotspots.map((spot) => (
        <ContinentalHotspot key={spot.id} {...spot} />
      ))}

      {/* Demand hotspots */}
      {demandHotspots.map((spot) => (
        <HotspotMarker key={spot.name} {...spot} />
      ))}

      {/* Provider locations */}
      {resourceFlows.map((flow) => (
        <ProviderMarker key={`provider-${flow.id}`} lat={flow.from.lat} lng={flow.from.lng} />
      ))}
    </group>
  )
}

// Main Globe component
export function ThreeGlobe() {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Starfield background */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#00DCDC" />
        <pointLight position={[0, 10, 0]} intensity={0.3} color="#FFC832" />

        <GlobeMesh />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
        <div className="font-mono text-muted-foreground mb-2">FLOW STATUS</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-primary rounded" />
          <span className="text-foreground">Active Transfer</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-accent rounded" />
          <span className="text-foreground">Pending Approval</span>
        </div>
        <div className="font-mono text-muted-foreground mt-3 mb-2">REGIONAL STATUS</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,220,220,0.6)]" />
          <span className="text-foreground">Surplus</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(255,200,50,0.6)]" />
          <span className="text-foreground">Balanced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4444] shadow-[0_0_8px_rgba(255,68,68,0.6)]" />
          <span className="text-foreground">Critical</span>
        </div>
      </div>

      {/* Hotspot instruction */}
      <div className="absolute top-4 right-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 text-[10px] font-mono text-muted-foreground">
        Hover hotspots for regional data
      </div>
    </div>
  )
}
