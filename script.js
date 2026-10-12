const params = new URLSearchParams(window.location.search);
const requestedCity = (params.get("city") || "").trim();

const el = (id) => document.getElementById(id);

function setError(message) {
  el("loading").hidden = true;
  el("dashboard").hidden = true;
  el("errorPanel").hidden = false;
  el("errorMessage").textContent = message;
}

function aqiCategory(value) {
  if (value <= 50) return {
    label: "Good",
    headline: "Air quality is good",
    description: "Air pollution poses little or no risk for most people.",
    healthTitle: "Enjoy your usual activities",
    healthMessage: "Air quality is in the good range. Continue to pay attention to local updates if conditions change.",
    color: "#8ed5a6"
  };
  if (value <= 100) return {
    label: "Moderate",
    headline: "Air quality is acceptable",
    description: "Some pollutants may be a concern for a small number of unusually sensitive people.",
    healthTitle: "Be aware of your sensitivity",
    healthMessage: "Most people can continue normal activities. People who are unusually sensitive to air pollution may want to reduce prolonged, heavy outdoor exertion if they notice symptoms.",
    color: "#f0d46e"
  };
  if (value <= 150) return {
    label: "Unhealthy for sensitive groups",
    headline: "Some people may be affected",
    description: "Sensitive groups may experience health effects; the general public is less likely to be affected.",
    healthTitle: "Sensitive groups should take care",
    healthMessage: "Children, older adults, and people with heart or lung conditions may want to reduce prolonged or heavy outdoor exertion.",
    color: "#f2aa70"
  };
  if (value <= 200) return {
    label: "Unhealthy",
    headline: "Health effects are possible",
    description: "Some members of the public may experience health effects, with greater concern for sensitive groups.",
    healthTitle: "Consider reducing outdoor exertion",
    healthMessage: "Consider shorter or less strenuous outdoor activity. Sensitive groups should avoid prolonged or heavy exertion outdoors and follow local guidance.",
    color: "#e98b83"
  };
  if (value <= 300) return {
    label: "Very unhealthy",
    headline: "Health alert",
    description: "The risk of health effects is increased for everyone, especially sensitive groups.",
    healthTitle: "Limit outdoor exposure",
    healthMessage: "Reduce outdoor activity and follow public-health guidance. If you must be outside, consider keeping the activity brief and less strenuous.",
    color: "#bda1d8"
  };
  return {
    label: "Hazardous",
    headline: "Serious health concern",
    description: "Health alert conditions: everyone may be more likely to experience health effects.",
    healthTitle: "Avoid outdoor exertion",
    healthMessage: "Stay indoors where possible, reduce exposure to outdoor air, and follow official local emergency and public-health advice.",
    color: "#9c4242"
  };
}

function formatPollutant(value) {
  return value === null || value === undefined || !Number.isFinite(Number(value))
    ? "N/A"
    : Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

async function getCoordinates(city) {
  const url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(city) + "&count=1&language=en&format=json";
  const response = await fetch(url);
  if (!response.ok) throw new Error("The city search service is temporarily unavailable. Please try again.");
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("We couldn't find that city. Check the spelling or try a nearby larger city.");
  }
  return data.results[0];
}

async function getAirQuality(latitude, longitude) {
  const query = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    hourly: "us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
    timezone: "auto",
    forecast_days: "1"
  });
  const response = await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?" + query.toString());
  if (!response.ok) throw new Error("The air-quality service is temporarily unavailable. Please try again later.");
  const data = await response.json();
  if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) {
    throw new Error("No air-quality readings are currently available for this location.");
  }
  const times = data.hourly.time;
  const now = new Date();
  let chosen = 0;
  let smallestDifference = Infinity;
  times.forEach((time, index) => {
    const difference = Math.abs(new Date(time).getTime() - now.getTime());
    if (Number.isFinite(difference) && difference < smallestDifference) {
      smallestDifference = difference;
      chosen = index;
    }
  });
  const read = (key) => data.hourly[key] ? data.hourly[key][chosen] : null;
  return {
    time: times[chosen],
    aqi: read("us_aqi"),
    pm25: read("pm2_5"),
    pm10: read("pm10"),
    co: read("carbon_monoxide"),
    no2: read("nitrogen_dioxide"),
    so2: read("sulphur_dioxide"),
    o3: read("ozone")
  };
}

function displayReport(place, air) {
  el("cityTitle").textContent = place.name + (place.admin1 ? ", " + place.admin1 : "");
  el("locationSubtitle").textContent = [place.country, place.latitude.toFixed(2) + "°, " + place.longitude.toFixed(2) + "°"].filter(Boolean).join(" · ");
  el("updatedAt").textContent = "Reading time: " + new Date(air.time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const aqi = Number(air.aqi);
  if (!Number.isFinite(aqi)) {
    el("aqiValue").textContent = "N/A";
    el("aqiStatus").textContent = "AQI unavailable";
    el("aqiHeadline").textContent = "No AQI value for this time";
    el("aqiDescription").textContent = "Pollutant readings may still be available below. Try again later for an AQI value.";
    el("healthTitle").textContent = "Check local air-quality advice";
    el("healthMessage").textContent = "An AQI value was not supplied for the selected time. Consult your local environmental authority for current guidance.";
    el("aqiRing").style.background = "conic-gradient(#b7c8be 0 75%, #ffffff20 75% 100%)";
  } else {
    const category = aqiCategory(aqi);
    el("aqiValue").textContent = Math.round(aqi);
    el("aqiStatus").textContent = category.label;
    el("aqiHeadline").textContent = category.headline;
    el("aqiDescription").textContent = category.description;
    el("healthTitle").textContent = category.healthTitle;
    el("healthMessage").textContent = category.healthMessage;
    el("aqiRing").style.background = "conic-gradient(" + category.color + " 0 75%, #ffffff20 75% 100%)";
    el("aqiStatus").style.color = category.color;
  }

  el("pm25").textContent = formatPollutant(air.pm25);
  el("pm10").textContent = formatPollutant(air.pm10);
  el("co").textContent = formatPollutant(air.co);
  el("no2").textContent = formatPollutant(air.no2);
  el("so2").textContent = formatPollutant(air.so2);
  el("o3").textContent = formatPollutant(air.o3);

  el("loading").hidden = true;
  el("errorPanel").hidden = true;
  el("dashboard").hidden = false;
}

async function loadDashboard() {
  if (!requestedCity) {
    setError("No city was provided. Return to the search page and enter a city name.");
    el("cityTitle").textContent = "Choose a city";
    el("locationSubtitle").textContent = "Search for a city to view its air-quality dashboard.";
    return;
  }

  el("cityTitle").textContent = requestedCity;
  document.title = "AirWatch | " + requestedCity + " AQI";
  try {
    const place = await getCoordinates(requestedCity);
    const air = await getAirQuality(place.latitude, place.longitude);
    displayReport(place, air);
  } catch (error) {
    setError(error.message || "Something went wrong while loading the report.");
  }
}

loadDashboard();
