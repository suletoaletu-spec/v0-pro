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
