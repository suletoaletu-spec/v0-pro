"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei"
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
    to: { lat: 33.89, lng: 35.50, name: "Beirut" },
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
  { lat: 33.89, lng: 35.50, name: "Beirut", priority: "critical", population: 2.4 },
  { lat: 6.52, lng: 3.38, name: "Lagos", priority: "high", population: 15.4 },
  { lat: 19.08, lng: 72.88, name: "Mumbai", priority: "high", population: 20.4 },
  { lat: -6.21, lng: 106.85, name: "Jakarta", priority: "medium", population: 10.6 },
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
    const p = new THREE.Vector3()

    // Quadratic bezier curve
    const t1 = (1 - t) * (1 - t)
    const t2 = 2 * (1 - t) * t
    const t3 = t * t

    p.x = t1 * start.x + t2 * mid.x + t3 * end.x
    p.y = t1 * start.y + t2 * mid.y + t3 * end.y
    p.z = t1 * start.z + t2 * mid.z + t3 * end.z

    points.push(p)
  }

  return points
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
  const lineRef = useRef<THREE.Line>(null)
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
      ref={lineRef}
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
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* Glow ring */}
      <mesh>
        <ringGeometry args={[0.04, 0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {hovered && (
        <Html distanceFactor={8}>
          <div className="bg-obsidian/90 border border-border px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            <div className="font-mono text-foreground font-semibold">{name}</div>
            <div className="text-muted-foreground">Pop: {population}M</div>
            <div
              className="font-mono uppercase text-[10px]"
              style={{ color }}
            >
              {priority}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Provider marker component
function ProviderMarker({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const position = useMemo(() => latLngToVector3(lat, lng, 2.02), [lat, lng])

  return (
    <mesh position={position}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshBasicMaterial color="#00DCDC" transparent opacity={0.9} />
    </mesh>
  )
}

// Globe mesh component
function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={meshRef}>
      {/* Globe surface */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.7}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[2.01, 32, 32]}>
        <meshBasicMaterial color="#00DCDC" wireframe transparent opacity={0.1} />
      </Sphere>

      {/* Resource flow lines */}
      {resourceFlows.map((flow) => (
        <FlowLine key={flow.id} from={flow.from} to={flow.to} status={flow.status} />
      ))}

      {/* Demand hotspots */}
      {demandHotspots.map((spot) => (
        <HotspotMarker key={spot.name} {...spot} />
      ))}

      {/* Provider locations */}
      {resourceFlows.map((flow) => (
        <ProviderMarker
          key={`provider-${flow.id}`}
          lat={flow.from.lat}
          lng={flow.from.lng}
          name={flow.from.name}
        />
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00DCDC" />

        <GlobeMesh />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
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
        <div className="font-mono text-muted-foreground mt-3 mb-2">PRIORITY</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#FF4444]" />
          <span className="text-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-foreground">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-foreground">Medium</span>
        </div>
      </div>
    </div>
  )
}
