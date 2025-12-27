exports.handler = async () => {
  try {
    const MAP_ID = "1WDMDOholPxRUjCSK3mbX5NdMuQKWYtc";

    const kmz = await fetch(
      `https://www.google.com/maps/d/u/0/kml?mid=${MAP_ID}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then(r => r.arrayBuffer());

    // unzip
    const zip = require("jszip");
    const data = await zip.loadAsync(kmz);
    const kml = await data.file(/.kml/)[0].async("string");

    // find the Current Location pin
    const part = kml.split("<Placemark").find(p => p.includes("Current Location"));
    const coords = part.match(/<coordinates>([^<]+)<\/coordinates>/)[1].split(",");

    const lon = coords[0];
    const lat = coords[1];

    // translate into city/state
    const place = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { "User-Agent": "monks-tracker" } }
    ).then(r => r.json());

    return {
      statusCode: 200,
      body: JSON.stringify({
        city: place.address.city || place.address.town || place.address.village,
        state: place.address.state,
        lat,
        lon
      })
    };
  } catch (e) {
    return { statusCode: 500, body: e.toString() };
  }
};