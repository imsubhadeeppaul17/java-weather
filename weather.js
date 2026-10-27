(() => {
  function initWeatherApp() {
    const styles = `
      :root {
        color-scheme: dark;
        font-family: system-ui, "Segoe UI", sans-serif;
        color: #f4f7ff;
        background: #10192b;
        --muted: #aab6ca;
        --panel: rgba(255,255,255,.085);
        --border: rgba(255,255,255,.12);
      }

      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; background: #10192b; }
      button, input { font: inherit; }
      button { color: inherit; cursor: pointer; }

      .weather-scene {
        position: fixed;
        z-index: 0;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        perspective: 800px;
        background:
          radial-gradient(ellipse at 80% 3%, var(--sky-glow, rgba(90,131,212,.24)), transparent 38rem),
          radial-gradient(ellipse at 5% 70%, rgba(52,105,153,.16), transparent 35rem);
      }
      body.theme-clear { --sky-glow: rgba(255,174,69,.25); }
      body.theme-cloudy { --sky-glow: rgba(143,166,194,.24); }
      body.theme-rain { --sky-glow: rgba(77,137,185,.28); }
      body.theme-snow { --sky-glow: rgba(192,220,255,.3); }
      body.theme-storm { --sky-glow: rgba(125,101,173,.32); }
      body.theme-fog { --sky-glow: rgba(173,190,205,.24); }
      body.theme-night { --sky-glow: rgba(97,119,190,.23); }
      body.theme-overcast { --sky-glow: rgba(118,140,162,.3); }

      .stars, .cloud-bank, .wind-lines, .fog-layer, .snow-layer, .lightning {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity .7s ease;
      }
      .stars {
        background-image:
          radial-gradient(2px 2px at 12% 18%, #fff 60%, transparent),
          radial-gradient(1px 1px at 32% 12%, #fff 60%, transparent),
          radial-gradient(2px 2px at 55% 28%, #dbe8ff 60%, transparent),
          radial-gradient(1px 1px at 77% 13%, #fff 60%, transparent),
          radial-gradient(2px 2px at 90% 33%, #dbe8ff 60%, transparent);
        background-size: 420px 300px;
        animation: twinkle 4s ease-in-out infinite alternate;
      }
      .weather-scene.is-night .stars { opacity: .8; }

      .cloud-bank { z-index: 1; }
      .weather-scene.is-cloudy .cloud-bank { opacity: .82; }
      .cloud {
        position: absolute;
        top: 18%;
        left: -30%;
        width: clamp(180px, 28vw, 340px);
        height: 75px;
        border-radius: 80px;
        background: linear-gradient(180deg, rgba(239,246,255,.84), rgba(142,164,194,.63));
        filter: drop-shadow(0 15px 20px rgba(8,18,36,.15));
        animation: cloud-drift 48s linear infinite;
      }
      .cloud::before, .cloud::after {
        position: absolute;
        bottom: 20px;
        border-radius: 50%;
        background: inherit;
        content: "";
      }
      .cloud::before { left: 18%; width: 105px; height: 105px; }
      .cloud::after { left: 48%; width: 135px; height: 135px; }
      .cloud-two {
        top: 40%;
        left: -38%;
        opacity: .65;
        transform: scale(.78);
        animation-duration: 68s;
        animation-delay: -29s;
      }
      .cloud-three {
        top: 8%;
        left: -44%;
        opacity: .42;
        transform: scale(.58);
        animation-duration: 82s;
        animation-delay: -51s;
      }
      .weather-scene.is-night .cloud {
        background: linear-gradient(180deg, rgba(156,177,213,.62), rgba(62,79,111,.75));
      }
      .weather-scene.is-rainy .cloud,
      .weather-scene.is-stormy .cloud {
        background: linear-gradient(180deg, rgba(135,157,181,.78), rgba(59,77,102,.9));
      }
      .weather-scene.is-overcast .cloud {
        background: linear-gradient(180deg, rgba(174,190,204,.84), rgba(91,109,127,.92));
      }
      .weather-scene.is-windy .cloud {
        animation-name: cloud-gust;
        animation-duration: 15s;
      }

      .wind-lines {
        top: 20%;
        background: repeating-linear-gradient(
          172deg, transparent 0 72px, rgba(218,237,255,.3) 73px 75px, transparent 76px 125px
        );
        mask-image: linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent);
      }
      .weather-scene.is-windy .wind-lines {
        opacity: .75;
        animation: wind-sweep 1.8s linear infinite;
      }
      .fog-layer {
        background: linear-gradient(
          180deg, transparent 18%, rgba(199,213,224,.32) 42%,
          rgba(199,213,224,.16) 62%, transparent 82%
        );
        filter: blur(20px);
      }
      .weather-scene.is-foggy .fog-layer {
        opacity: .9;
        animation: fog-drift 12s ease-in-out infinite alternate;
      }
      .snow-layer {
        background-image:
          radial-gradient(3px 3px at 14% 18%, #fff 55%, transparent 60%),
          radial-gradient(2px 2px at 37% 67%, #fff 55%, transparent 60%),
          radial-gradient(4px 4px at 71% 33%, #eef7ff 55%, transparent 60%);
        background-size: 170px 190px, 230px 260px, 290px 310px;
      }
      .weather-scene.is-snowy .snow-layer {
        opacity: .9;
        animation: snow-fall 5s linear infinite;
      }
      .lightning { background: rgba(218,231,255,.8); mix-blend-mode: screen; }
      .weather-scene.is-stormy .lightning { animation: lightning-flash 8s linear infinite; }

      .celestial {
        position: absolute;
        right: max(5vw, calc((100vw - 1000px) / 2));
        bottom: -116px;
        width: clamp(190px, 27vw, 320px);
        aspect-ratio: 1;
        border-radius: 50%;
        opacity: 0;
        transform: translateY(75%) rotateX(-12deg);
        transition: opacity .8s ease;
      }
      .celestial::before {
        position: absolute;
        inset: -24%;
        border-radius: 50%;
        content: "";
        filter: blur(20px);
        opacity: .38;
      }
      .celestial::after {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        content: "";
      }
      .weather-scene.is-day .celestial {
        opacity: 1;
        background: radial-gradient(circle at 32% 27%, #fff9cd, #ffdf6a 25%, #ff9c37 65%, #e85b38);
        box-shadow: inset -22px -24px 38px rgba(171,66,30,.38),
          inset 9px 10px 24px rgba(255,255,236,.72), 0 0 48px rgba(255,168,64,.42);
        animation: rise 1.15s cubic-bezier(.2,.75,.25,1) both, float 6s 1.15s ease-in-out infinite;
      }
      .weather-scene.is-day .celestial::before { background: #ffae45; }
      .weather-scene.is-day .celestial::after {
        background: radial-gradient(ellipse at 35% 32%, rgba(255,255,255,.55), transparent 24%);
      }
      .weather-scene.is-night .celestial {
        opacity: 1;
        background: radial-gradient(circle at 32% 27%, #fff, #e4edff 40%, #9eb8e9);
        box-shadow: inset -25px -20px 38px rgba(65,86,139,.42),
          inset 9px 10px 24px rgba(255,255,255,.72), 0 0 52px rgba(167,196,255,.35);
        animation: rise 1.15s cubic-bezier(.2,.75,.25,1) both, float 7s 1.15s ease-in-out infinite;
      }
      .weather-scene.is-night .celestial::before { background: #9bbcff; }
      .weather-scene.is-night .celestial::after {
        background:
          radial-gradient(circle at 34% 40%, rgba(113,137,184,.28) 0 5%, transparent 6%),
          radial-gradient(circle at 64% 27%, rgba(113,137,184,.2) 0 8%, transparent 9%);
      }
      .weather-scene.is-cloudy .celestial { opacity: .5; }

      .rain-layer {
        position: fixed;
        z-index: 2;
        inset: -100px 0 0;
        overflow: hidden;
        pointer-events: none;
        opacity: 0;
        background-image:
          repeating-linear-gradient(106deg, transparent 0 25px, rgba(193,222,255,.34) 26px, transparent 27px 62px),
          repeating-linear-gradient(106deg, transparent 0 53px, rgba(193,222,255,.18) 54px, transparent 55px 112px);
        background-size: 180px 240px, 260px 320px;
        mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
      }
      .rain-layer.is-rainy { opacity: .48; animation: rain-fall .65s linear infinite; }

      .app { position: relative; z-index: 1; width: min(1000px, calc(100% - 32px)); margin: auto; padding: 28px 0 42px; }
      header, .row, .current-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      header { flex-wrap: wrap; margin-bottom: 28px; }
      .brand { font-size: 21px; font-weight: 750; }
      form { display: flex; gap: 8px; }
      input, button, .card, .panel, #map {
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--panel);
      }
      input { min-width: 0; padding: 10px 12px; color: white; }
      button { padding: 10px 13px; }
      button:hover { background: rgba(255,255,255,.16); }
      .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 14px; }
      .card, .panel { padding: 20px; backdrop-filter: blur(12px); }
      .current { min-height: 230px; background: linear-gradient(135deg, rgba(80,119,186,.38), rgba(255,255,255,.06)); }
      .muted, .label, .forecast-day { color: var(--muted); }
      h1 { margin: 6px 0; font-size: clamp(26px, 5vw, 40px); }
      h2 { margin: 28px 0 12px; font-size: 20px; }
      .current-row { margin-top: 20px; }
      .temp { font-size: clamp(65px, 12vw, 100px); line-height: 1; }
      .icon { font-size: 68px; }
      .details { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; overflow: hidden; padding: 0; }
      .detail { padding: 14px; background: rgba(255,255,255,.03); }
      .value { display: block; margin-top: 6px; font-size: 20px; font-weight: 650; }
      .forecast { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
      .forecast-day-card { min-height: 135px; text-align: center; }
      .forecast-icon { display: block; margin: 8px 0; font-size: 28px; }
      .rain { color: #a9d9ff; font-size: 13px; }
      .hourly { display: flex; gap: 8px; overflow-x: auto; }
      .hour { min-width: 82px; padding: 12px 8px; text-align: center; }
      #map { display: block; width: 100%; height: 300px; margin-top: 12px; }
      .message { min-height: 24px; color: var(--muted); }
      .error { color: #ffb5b5; }
      .results { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
      [hidden] { display: none !important; }

      @keyframes twinkle { from { filter: brightness(.65); } to { filter: brightness(1.25); } }
      @keyframes cloud-drift { from { translate: 0 0; } to { translate: 150vw 20px; } }
      @keyframes cloud-gust { from { translate: 0 0; } to { translate: 180vw -18px; } }
      @keyframes wind-sweep { to { background-position: 250px -65px; } }
      @keyframes fog-drift { from { transform: translateX(-4%) scale(1.05); } to { transform: translateX(5%) scale(1.08); } }
      @keyframes snow-fall { to { background-position: 80px 380px, -70px 520px, 100px 620px; } }
      @keyframes rain-fall { to { background-position: -42px 340px, -68px 460px; } }
      @keyframes rise { to { transform: translateY(0) rotateX(0); } }
      @keyframes float { 0%, 100% { margin-bottom: 0; } 50% { margin-bottom: 12px; } }
      @keyframes lightning-flash {
        0%, 34%, 36%, 38%, 70%, 72%, 100% { opacity: 0; }
        35%, 37%, 71% { opacity: .36; }
      }

      @media (max-width: 680px) {
        .grid { grid-template-columns: 1fr; }
        .forecast { grid-template-columns: repeat(5, 105px); overflow-x: auto; }
        header { align-items: flex-start; flex-direction: column; }
        form { width: 100%; }
        form input { flex: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
      }
    `;

    const style = document.createElement("style");
    style.textContent = styles;
    document.head.append(style);

    document.body.innerHTML = `
      <div class="weather-scene" id="weather-scene" aria-hidden="true">
        <div class="celestial"></div>
        <div class="stars"></div>
        <div class="cloud-bank">
          <div class="cloud"></div>
          <div class="cloud cloud-two"></div>
          <div class="cloud cloud-three"></div>
        </div>
        <div class="wind-lines"></div>
        <div class="fog-layer"></div>
        <div class="snow-layer"></div>
        <div class="lightning"></div>
      </div>
      <div class="rain-layer" id="rain-layer" aria-hidden="true"></div>

      <main class="app">
        <header>
          <div class="brand">☀ Skyline Weather</div>
          <form id="search-form">
            <input id="city-input" type="search" value="San Francisco"
              placeholder="Search a city" aria-label="City name" required>
            <button type="submit">Search</button>
            <button type="button" id="location-button" title="Use my location"
              aria-label="Use my location">◎</button>
          </form>
        </header>

        <div id="results" class="results" hidden></div>

        <section class="grid" aria-label="Current weather">
          <article class="card current">
            <div class="muted" id="day-label">Current weather</div>
            <h1 id="place">Loading...</h1>
            <div class="current-row">
              <div class="temp"><span id="temperature">--</span><span id="degree">°C</span></div>
              <div class="icon" id="icon" aria-hidden="true">🌤️</div>
            </div>
            <p id="condition">Loading forecast...</p>
          </article>

          <section class="panel details" aria-label="Weather details">
            <div class="detail"><span class="label">Feels like</span><span class="value" id="feels">--</span></div>
            <div class="detail"><span class="label">Humidity</span><span class="value" id="humidity">--</span></div>
            <div class="detail"><span class="label">Wind</span><span class="value" id="wind">--</span></div>
            <div class="detail"><span class="label">UV index</span><span class="value" id="uv">--</span></div>
            <div class="detail"><span class="label">Sunrise</span><span class="value" id="sunrise">--</span></div>
            <div class="detail"><span class="label">Sunset</span><span class="value" id="sunset">--</span></div>
          </section>
        </section>

        <div class="row">
          <h2>5-day forecast</h2>
          <div>
            <button type="button" data-unit="celsius" aria-pressed="true">°C</button>
            <button type="button" data-unit="fahrenheit" aria-pressed="false">°F</button>
          </div>
        </div>
        <section id="forecast" class="forecast" aria-label="Five day forecast"></section>

        <h2>Next 24 hours</h2>
        <section id="hourly" class="hourly" aria-label="Hourly forecast"></section>

        <h2>Explore on the map</h2>
        <iframe id="map" title="Map of selected location" loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"></iframe>

        <p id="message" class="message" role="status"></p>
        <footer class="muted">Weather data by Open-Meteo · Map data © OpenStreetMap contributors</footer>
      </main>
    `;

    const $ = (selector) => document.querySelector(selector);
    let unit = "celsius";
    let latestPlace = null;

    function weatherInfo(code) {
      if (code === 0) return ["Clear sky", "☀️"];
      if (code === 1) return ["Mostly clear", "🌤️"];
      if (code === 2) return ["Partly cloudy", "⛅"];
      if (code === 3) return ["Overcast", "☁️"];
      if ([45, 48].includes(code)) return ["Foggy", "🌫️"];
      if ([51, 53, 55, 56, 57].includes(code)) return ["Drizzle", "🌦️"];
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ["Rain", "🌧️"];
      if ([71, 73, 75, 77, 85, 86].includes(code)) return ["Snow", "❄️"];
      if ([95, 96, 99].includes(code)) return ["Thunderstorm", "⛈️"];
      return ["Weather conditions", "🌡️"];
    }

    function showMessage(text, isError = false) {
      $("#message").textContent = text;
      $("#message").classList.toggle("error", isError);
    }

    function formatTime(value) {
      const time = value.split("T")[1];
      return new Date(`2000-01-01T${time}:00Z`).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC"
      });
    }

    function placeLabel(place) {
      return [place.name, place.admin1, place.country]
        .filter((part, index, all) => part && all.indexOf(part) === index)
        .join(", ");
    }

    function updateWeatherScene(code, isDay, windSpeed) {
      const scene = $("#weather-scene");
      const rainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
      const stormy = [95, 96, 99].includes(code);
      const snowy = [71, 73, 75, 77, 85, 86].includes(code);
      const foggy = [45, 48].includes(code);
      const overcast = code === 3;
      const cloudy = [2, 3, 45, 48].includes(code) || rainy || snowy;
      const windy = windSpeed >= (unit === "celsius" ? 25 : 15.5);

      const theme = stormy ? "storm"
        : snowy ? "snow"
        : rainy ? "rain"
        : foggy ? "fog"
        : overcast ? "overcast"
        : [2, 3].includes(code) ? "cloudy"
        : "clear";

      document.body.className =
        `theme-${theme}${isDay ? "" : " theme-night"}`;

      scene.classList.toggle("is-day", Boolean(isDay));
      scene.classList.toggle("is-night", !isDay);
      scene.classList.toggle("is-cloudy", cloudy || windy);
      scene.classList.toggle("is-rainy", rainy);
      scene.classList.toggle("is-stormy", stormy);
      scene.classList.toggle("is-windy", windy);
      scene.classList.toggle("is-snowy", snowy);
      scene.classList.toggle("is-foggy", foggy);
      scene.classList.toggle("is-overcast", overcast);
      $("#rain-layer").classList.toggle("is-rainy", rainy);
    }

    async function searchCity(city) {
      showMessage("Searching for the city...");
      $("#results").hidden = true;

      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.search = new URLSearchParams({
        name: city,
        count: "8",
        language: "en",
        format: "json"
      });

      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not search for that city.");

      const data = await response.json();
      if (!data.results?.length) throw new Error(`No results found for "${city}".`);

      if (data.results.length === 1) {
        const place = data.results[0];
        await loadForecast(place.latitude, place.longitude, placeLabel(place));
        return;
      }

      const results = $("#results");
      results.replaceChildren();

      data.results.forEach((place) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = placeLabel(place);
        button.addEventListener("click", () => {
          results.hidden = true;
          loadForecast(place.latitude, place.longitude, placeLabel(place))
            .catch((error) => showMessage(error.message, true));
        });
        results.append(button);
      });

      results.hidden = false;
      showMessage("Choose the city you meant.");
    }

    async function loadForecast(latitude, longitude, name) {
      showMessage("Loading forecast...");

      const params = new URLSearchParams({
        latitude,
        longitude,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
        hourly: "temperature_2m,precipitation_probability,weather_code",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
        temperature_unit: unit,
        wind_speed_unit: unit === "celsius" ? "kmh" : "mph",
        forecast_days: "5",
        timezone: "auto"
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`
      );
      if (!response.ok) {
        throw new Error("Weather data is temporarily unavailable.");
      }

      const data = await response.json();
      latestPlace = { latitude, longitude, name };
      renderForecast(data, name);
      showMessage("Forecast updated.");
    }

    function renderForecast(data, name) {
      const current = data.current;
      const daily = data.daily;
      const degree = unit === "celsius" ? "°C" : "°F";

      $("#place").textContent = name;
      $("#temperature").textContent = Math.round(current.temperature_2m);
      $("#degree").textContent = degree;
      $("#feels").textContent = `${Math.round(current.apparent_temperature)}${degree}`;
      $("#humidity").textContent = `${current.relative_humidity_2m}%`;
      $("#wind").textContent =
        `${Math.round(current.wind_speed_10m)} ${unit === "celsius" ? "km/h" : "mph"}`;
      $("#uv").textContent = daily.uv_index_max[0] ?? "—";
      $("#sunrise").textContent = formatTime(daily.sunrise[0]);
      $("#sunset").textContent = formatTime(daily.sunset[0]);
      $("#day-label").textContent = current.is_day ? "Daytime" : "Tonight";

      const [description, icon] = weatherInfo(current.weather_code);
      $("#condition").textContent = description;
      $("#icon").textContent = icon;

      updateWeatherScene(
        current.weather_code,
        current.is_day,
        current.wind_speed_10m
      );

      const forecast = $("#forecast");
      forecast.replaceChildren();

      daily.time.forEach((date, index) => {
        const [year, month, day] = date.split("-").map(Number);
        const weekday = new Date(year, month - 1, day)
          .toLocaleDateString(undefined, { weekday: "short" });
        const [dayDescription, dayIcon] = weatherInfo(daily.weather_code[index]);
        const chance = daily.precipitation_probability_max[index];

        const card = document.createElement("article");
        card.className = "card forecast-day-card";
        card.setAttribute("aria-label", `${weekday}: ${dayDescription}`);
        card.innerHTML = `
          <span class="forecast-day">${weekday}</span>
          <span class="forecast-icon" aria-hidden="true">${dayIcon}</span>
          <strong>${Math.round(daily.temperature_2m_max[index])}°</strong>
          <span class="muted">${Math.round(daily.temperature_2m_min[index])}°</span>
          <span class="rain">${chance == null ? "" : `💧 ${chance}%`}</span>
        `;
        forecast.append(card);
      });

      renderHourly(data.hourly, current.time);

      // Use the selected place coordinates, not undefined local variables.
      const padding = 0.12;
      const latitude = latestPlace.latitude;
      const longitude = latestPlace.longitude;
      const bbox = [
        Math.max(-180, longitude - padding),
        Math.max(-85, latitude - padding),
        Math.min(180, longitude + padding),
        Math.min(85, latitude + padding)
      ].join(",");

      const mapParams = new URLSearchParams({
        bbox,
        layer: "mapnik",
        marker: `${latitude},${longitude}`
      });
      $("#map").src =
        `https://www.openstreetmap.org/export/embed.html?${mapParams}`;

      document.querySelectorAll("[data-unit]").forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.unit === unit)
        );
      });
    }

    function renderHourly(hourly, currentTime) {
      const foundIndex = hourly.time.findIndex((time) => time >= currentTime);
      const start = Math.max(0, foundIndex < 0 ? 0 : foundIndex);
      const list = $("#hourly");
      list.replaceChildren();

      hourly.time.slice(start, start + 24).forEach((time, offset) => {
        const index = start + offset;
        const [description, icon] = weatherInfo(hourly.weather_code[index]);
        const rain = hourly.precipitation_probability[index];
        const card = document.createElement("article");
        card.className = "card hour";
        card.setAttribute(
          "aria-label",
          `${description}, ${Math.round(hourly.temperature_2m[index])} degrees`
        );
        card.innerHTML = `
          <span class="muted">${time === currentTime ? "Now" : formatTime(time)}</span>
          <span class="forecast-icon" aria-hidden="true">${icon}</span>
          <strong>${Math.round(hourly.temperature_2m[index])}°</strong>
          <span class="rain">${rain == null ? "" : `💧 ${rain}%`}</span>
        `;
        list.append(card);
      });
    }

    $("#search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const city = $("#city-input").value.trim();
      if (!city) return;

      searchCity(city).catch((error) => showMessage(error.message, true));
    });

    $("#location-button").addEventListener("click", () => {
      if (!navigator.geolocation) {
        showMessage("Location is not supported by this browser.", true);
        return;
      }

      showMessage("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          loadForecast(coords.latitude, coords.longitude, "Your location")
            .catch((error) => showMessage(error.message, true));
        },
        () => showMessage("Location access was denied.", true),
        { timeout: 10000 }
      );
    });

    document.querySelectorAll("[data-unit]").forEach((button) => {
      button.addEventListener("click", () => {
        if (unit === button.dataset.unit) return;
        unit = button.dataset.unit;

        if (latestPlace) {
          loadForecast(
            latestPlace.latitude,
            latestPlace.longitude,
            latestPlace.name
          ).catch((error) => showMessage(error.message, true));
        }

        document.querySelectorAll("[data-unit]").forEach((item) => {
          item.setAttribute("aria-pressed", String(item.dataset.unit === unit));
        });
      });
    });

    loadForecast(
      37.7749,
      -122.4194,
      "San Francisco, California, United States"
    ).catch((error) => {
      showMessage(
        `${error.message} Check your internet connection and Chrome Console.`,
        true
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWeatherApp, { once: true });
  } else {
    initWeatherApp();
  }
})();