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
