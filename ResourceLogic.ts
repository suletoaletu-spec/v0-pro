import emailjs from '@emailjs/browser';

export const dispatchPlanetarySupport = async (lat: number, lng: number) => {
  try {
    // 1. Fetch REAL-TIME Weather Intelligence (Free API)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const weatherData = await weatherRes.json();
    const temp = weatherData.current_weather.temperature;
    const wind = weatherData.current_weather.windspeed;

    // 2. Prepare the Intelligence Report
    const intelligenceReport = `
      CRITICAL DISPATCH INITIATED.
      Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
      Local Temperature: ${temp}°C
      Wind Velocity: ${wind} km/h
      Status: EMERGENCY AID AUTHORIZED.
    `;

    // 3. Send the REAL-WORLD Email
    await emailjs.send(
      'service_vu9cngf',   // Your Service ID
      'template_eg61rrv',  // Your Template ID
      {
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        subject: `🚨 PRIORITY ALERT: SECTOR [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
        message: intelligenceReport
      },
      'vt4gWVLV_Aa9rP6fE'   // Your Public Key
    );

    return { success: true, temp, wind };
  } catch (error) {
    console.error("Global Dispatch Failed:", error);
    return { success: false };
  }
};
