// Inside your ThreeGlobe component
const [liveTransfers, setLiveTransfers] = useState([]);

useEffect(() => {
  const syncWithSatellite = async () => {
    const data = await fetchSatelliteData();
    setLiveTransfers(data);
  };

  syncWithSatellite();
  const interval = setInterval(syncWithSatellite, 60000); // Sync every minute
  return () => clearInterval(interval);
}, []);

// Then in your <Globe /> component:
// arcsData={liveTransfers}

// 1. Add a callback prop to the component
export const ThreeGlobe = ({ onTriggerSupport }: { onTriggerSupport: (lat: number, lng: number) => void }) => {
  
  return (
    <Globe
      // ... your previous settings ...
      onGlobeClick={({ lat, lng }) => {
        // Trigger the "Free Support" protocol at these coordinates
        onTriggerSupport(lat, lng);
      }}
      // Change cursor to crosshair to show it's an action zone
      onGlobePointerOver={() => {
        document.body.style.cursor = 'crosshair';
      }}
      onGlobePointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    />
  );
}

const handleGlobeAction = async (lat: number, lng: number) => {
  // 1. Show immediate UI feedback
  console.log(`AI Sentinel: Deploying aid to ${lat}, ${lng}`);
  
  // 2. Trigger the Real-World Email
  const success = await dispatchFreeSupport(lat, lng);

  if (success) {
    // If you use a toast library like Sonner
    // toast.success("REAL AID DISPATCHED");
    alert(`MISSION SUCCESS: Support dispatched to ${lat.toFixed(2)}, ${lng.toFixed(2)}`);
  }
};
