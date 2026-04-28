// You can use EmailJS for a free, quick setup
import emailjs from '@emailjs/browser';

export const dispatchFreeSupport = async (locationData: { lat: number, lng: number, city?: string }) => {
  const templateParams = {
    subject: "PRO SYSTEM: EMERGENCY RESOURCE REQUEST",
    location: `${locationData.lat}, ${locationData.lng}`,
    message: "The Planetary Resource Orchestration system has identified a critical need. This request is flagged under the 'FREE TO SUPPORT PEOPLE' protocol. Please mobilize local resources.",
    timestamp: new Date().toISOString()
  };

  try {
    // Replace with your real EmailJS IDs
    await emailjs.send(
      'YOUR_SERVICE_ID', 
      'YOUR_TEMPLATE_ID', 
      templateParams, 
      'YOUR_PUBLIC_KEY'
    );
    console.log("✈️ Real-world alert dispatched to humanitarian partners!");
    return true;
  } catch (error) {
    console.error("Dispatch Failed:", error);
    return false;
  }
};
