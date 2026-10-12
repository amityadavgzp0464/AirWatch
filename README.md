# AirWatch – Air Quality Monitoring

AirWatch is a lightweight, browser-based web application that helps users check the latest available air-quality information for a city. It presents the US Air Quality Index (AQI), common pollutant readings, and general health guidance in a clear dashboard.

## Features

- **City search:** Enter a city name to open its air-quality dashboard.
- **AQI overview:** Displays the available US AQI value and its category.
- **Pollutant readings:** Shows PM2.5, PM10, ozone (O₃), nitrogen dioxide (NO₂), sulphur dioxide (SO₂), and carbon monoxide (CO), when available.
- **Health guidance:** Provides general suggestions based on the AQI category.
- **Responsive interface:** Uses a clean layout designed for different screen sizes.
- **Error handling:** Displays helpful messages if a city cannot be found or data services are unavailable.

## Technologies Used

- **HTML5** – page structure
- **CSS3** – layout, styling, and responsive design
- **JavaScript** – city search, API requests, AQI categorisation, and dashboard updates
- **Open-Meteo Geocoding API** – converts city names into geographic coordinates
- **Open-Meteo Air Quality API** – supplies air-quality and pollutant data

No package manager or build step is required for the current project.

## Project Structure

```text
AirWatch/
├── index.html    # Home page and city search form
├── result.html   # Air-quality dashboard
├── script.js     # API requests and dashboard logic
├── style.css     # Shared styles and responsive layout
└── README.md     # Project documentation
```

## Getting Started

### Requirements

- A modern web browser
- An internet connection, because the application requests data from the Open-Meteo APIs and loads web fonts

### Run the project

1. Download and extract the project ZIP file.
2. Open the `AirWatch` folder.
3. Open `index.html` in a web browser.
4. Enter a city name, such as `Delhi`, `Mumbai`, `Jaipur`, or `Pune`.
5. Select **Check AQI** to view the dashboard.

If your browser restricts requests when pages are opened directly from the filesystem, run a simple local web server from the project folder. For example, if Python is installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` and navigate to the `AirWatch/` folder if needed.

## How It Works

1. The user enters a city name on the home page.
2. The application passes the city name to the Open-Meteo Geocoding API.
3. The returned latitude and longitude are used to request air-quality data.
4. The JavaScript selects the available hourly reading closest to the current time.
5. The dashboard displays the AQI, pollutant values, reading time, and relevant general guidance.

## AQI Categories

AirWatch uses the **US AQI scale** supplied by the data source.

| US AQI | Category |
|---:|---|
| 0–50 | Good |
| 51–100 | Moderate |
| 101–150 | Unhealthy for Sensitive Groups |
| 151–200 | Unhealthy |
| 201–300 | Very Unhealthy |
| 301+ | Hazardous |

## Data and Important Notes

- Readings are provided by external Open-Meteo services and depend on data availability for the selected location and time.
- The displayed reading is the available hourly value closest to the browser's current time; it should not be interpreted as a direct real-time sensor measurement.
- Pollutant values may be unavailable and are then displayed as `N/A`.
- The dashboard uses the US AQI scale. Local environmental authorities may use different index systems and thresholds.
- Health messages are general information, not medical advice. Follow official local public-health guidance during pollution events.

## Limitations

- The project requires an internet connection to retrieve data.
- Results depend on the city search and coverage of the external data source.
- It does not use its own air-quality sensors or store historical readings.
- It does not include user accounts, a database, or a historical trend analysis feature.

## Troubleshooting

- **City not found:** Check the spelling or try a larger nearby city.
- **Data service unavailable:** Try again later and verify your internet connection.
- **Values show `N/A`:** The source may not provide a value for that pollutant or time.
- **Dashboard does not load:** Try serving the files through a local web server rather than opening them directly.

## License

No license is specified in the supplied project files. Add a `LICENSE` file if you intend to publish or redistribute the project and want to define reuse terms.
