// Inside your Dashboard() function
const [activeMissions, setActiveMissions] = useState<any[]>([]);

const handleManualSupport = (lat: number, lng: number) => {
  const newMission = {
    id: Date.now(),
    lat,
    lng,
    label: "FREE AID DEPLOYED",
    timestamp: new Date().toLocaleTimeString()
  };

  // 1. Add to the active missions list
  setActiveMissions(prev => [newMission, ...prev]);

  // 2. Alert the user (or play a sound effect)
  console.log(`PRO Protocol: Free Support triggered at ${lat}, ${lng}`);
  
  // 3. Optional: Trigger a "Success" toast notification
  // toast.success("Humanitarian Override: Resources Released");
};
import emailjs from '@emailjs/browser';

export const dispatchGlobalSupport = async (lat: number, lng: number) => {
  try {
    await emailjs.send(
      'service_vu9cngf',   // Your Service ID
      'template_eg61rrv',  // Your Template ID
      {
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        subject: "PLANETARY SYSTEM ALERT",
        message: "PROTOCOL: FREE SUPPORT. Aid dispatch initialized from PRO Dashboard."
      },
      'vt4gWVLV_Aa9rP6fE'   // Your Public Key
    );
    return true;
  } catch (error) {
    console.error("Support Dispatch Failed:", error);
    return false;
  }
};
