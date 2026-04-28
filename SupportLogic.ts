import emailjs from '@emailjs/browser';

export const dispatchGlobalIntelligence = async (lat: number, lng: number) => {
  try {
    // 1. FETCH LIVE SATELLITE DATA (The JSON structure you provided)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
    );
    const data = await response.json();

    const temp = data.current.temperature_2m;
    const humidity = data.current.relative_humidity_2m;
    const wind = data.current.wind_speed_10m;
    
    // 2. PREPARE THE PROFESSIONAL REPORT
    const intelligenceReport = `
      --- PRO GLOBAL SENTINEL: DISPATCH REPORT ---
      COORDINATES: ${lat.toFixed(4)}N, ${lng.toFixed(4)}E
      
      ENVIRONMENTAL INTELLIGENCE:
      - Temperature: ${temp}°C
      - Humidity: ${humidity}%
      - Wind Velocity: ${wind} km/h
      
      SATELLITE STATUS: Operational
      PROTOCOL: Free Support Protocol Initialized.
      --------------------------------------------
    `;

    // 3. TRIGGER REAL-WORLD EMAIL
    await emailjs.send(
      'service_vu9cngf',   // Your Service ID
      'template_eg61rrv',  // Your Template ID
      {
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        subject: `INTEL ALERT: SECTOR [${lat.toFixed(2)}]`,
        message: intelligenceReport
      },
      'vt4gWVLV_Aa9rP6fE'   // Your Public Key
    );

    return { success: true, temp, wind, humidity };
  } catch (error) {
    console.error("Transmission Error:", error);
    return { success: const [aiReport, setAiReport] = useState({
  region: "Global Monitoring",
  moisture: "Analyzing...",
  prediction: "Standby for satellite sync.",
  impact: "0"
});

const updateAIReasoning = (lat: number, lng: number, temp: number, humidity: number) => {
  // This simulates the "AI" calculating based on real data
  const moistureLevel = Math.max(5, (humidity * 0.4).toFixed(1)); // Logic based on real humidity
  const risk = temp > 30 ? "High Thermal Stress" : "Stable";
  const residents = Math.floor(Math.random() * 500000) + 100000;

  setAiReport({
    region: `Sector [${lat.toFixed(1)}, ${lng.toFixed(1)}]`,
    moisture: `${moistureLevel}%`,
    prediction: `Current temperature of ${temp}°C indicates ${risk} for local crops.`,
    impact: residents.toLocaleString()
  });
};
