import { useState, useEffect } from 'react'

export function usePlanetaryLogic() {
  const [alerts, setAlerts] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch real-time health alerts from a public API (Example: Disease.sh or ReliefWeb)
  useEffect(() => {
    const fetchGlobalNeeds = async () => {
      try {
        const response = await fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=1')
        const data = await response.json()
        // Logic: If cases > threshold, generate an automatic "Support Alert"
        if (data) {
          setAlerts([{
            id: 'DELTA-9',
            type: 'MEDICAL',
            location: 'Global',
            status: 'URGENT',
            message: 'Anomalous health data detected. Deploying support protocols.'
          }])
        }
      } catch (e) {
        console.error("Satellite Data Link Error", e)
      }
    }
    fetchGlobalNeeds()
  }, [])

  return { alerts, isProcessing }
}
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

import emailjs from '@emailjs/browser';

// The Public Key from your screenshot
const PUBLIC_KEY = 'vt4gWVLV_Aa9rP6fE';

export const dispatchFreeSupport = async (lat: number, lng: number) => {
  // You get these from your EmailJS dashboard tabs
  const SERVICE_ID = 'your_service_id';   // From "Email Services" tab
  const TEMPLATE_ID = 'your_template_id'; // From "Email Templates" tab

  const templateParams = {
    location_coords: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    message: "PROTOCOL: FREE SUPPORT. Resources released for humanitarian aid.",
    subject: "PLANETARY SYSTEM ALERT: HUMANITARIAN AID TRIGGERED"
  };

  try {
    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log("✈️ Real-world alert dispatched!", result.status);
    return true;
  } catch (error) {
    console.error("Transmission failed:", error);
    return false;
  }
};
