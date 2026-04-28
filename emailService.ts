import { dispatchGlobalSupport } from '../Support Logic'; // Adjust path if needed

// Inside your Globe component:
onGlobeClick={({ lat, lng }) => {
  dispatchGlobalSupport(lat, lng);
  alert(`Support Alert Sent for Location: ${lat}, ${lng}`);
}}
