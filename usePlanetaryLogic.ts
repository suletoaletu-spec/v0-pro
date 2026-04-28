useEffect(() => {
  if (alerts.length > 0 && isLive) {
    // If the AI finds a 'CRITICAL' alert in the data, it dispatches automatically
    const criticalAlert = alerts.find(a => a.status === 'CRITICAL');
    
    if (criticalAlert) {
      console.log("🤖 AI Sentinel: High-priority crisis detected. Automating support...");
      dispatchFreeSupport({ 
        lat: criticalAlert.lat, 
        lng: criticalAlert.lng 
      });
    }
  }
}, [alerts]);
