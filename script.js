// Weather App with Open-Meteo API
const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Default location (São José dos Campos, SP, Brazil)
let currentLocation = {
  latitude: -23.1896,
  longitude: -45.8841,
  name: 'São José dos Campos'
};

// DOM Elements
const heroCard = document.getElementById('heroCard');
const temperatureValue = document.getElementById('temperatureValue');
const apparentTemp = document.getElementById('apparentTemp');
const mainWeatherIcon = document.getElementById('mainWeatherIcon');
const headerDate = document.getElementById('headerDate');
const headerLocation = document.getElementById('headerLocation');
const headerStatus = document.getElementById('headerStatus');
const locationBtn = document.getElementById('locationBtn');
const hourlyForecast = document.getElementById('hourlyForecast');
const dailyForecast = document.getElementById('dailyForecast');
const precipitationValue = document.getElementById('precipitationValue');
const precipitationFill = document.getElementById('precipitationFill');
const cloudValue = document.getElementById('cloudValue');
const cloudFill = document.getElementById('cloudFill');
const visibilityValue = document.getElementById('visibilityValue');
const visibilityFill = document.getElementById('visibilityFill');
const uvValue = document.getElementById('uvValue');
const uvFill = document.getElementById('uvFill');
const sunriseTime = document.getElementById('sunriseTime');
const sunsetTime = document.getElementById('sunsetTime');
const sunDuration = document.getElementById('sunDuration');
const weatherCanvas = document.getElementById('weatherCanvas');
const loadingSkeleton = document.getElementById('loadingSkeleton');

// Weather Icons Mapping
const weatherIcons = {
  'clear': '☀️',
  'cloudy': '☁️',
  'rain': '🌧️',
  'rainy': '🌧️',
  'snow': '❄️',
  'thunderstorm': '⛈️',
  'fog': '🌫️',
  'night-clear': '🌙',
  'night-cloudy': '🌙'
};

// Weather Conditions Mapping
const weatherConditions = {
  0: { name: 'Clear', icon: 'clear', wind_speed: 0 },
  1: { name: 'Mostly Clear', icon: 'clear', wind_speed: 0 },
  2: { name: 'Partly Cloudy', icon: 'cloudy', wind_speed: 1 },
  3: { name: 'Overcast', icon: 'cloudy', wind_speed: 1 },
  45: { name: 'Foggy', icon: 'fog', wind_speed: 2 },
  48: { name: 'Depositing Rime Fog', icon: 'fog', wind_speed: 2 },
  51: { name: 'Light Drizzle', icon: 'rain', wind_speed: 2 },
  53: { name: 'Moderate Drizzle', icon: 'rain', wind_speed: 2 },
  55: { name: 'Dense Drizzle', icon: 'rain', wind_speed: 2 },
  61: { name: 'Slight Rain', icon: 'rain', wind_speed: 3 },
  63: { name: 'Moderate Rain', icon: 'rain', wind_speed: 3 },
  65: { name: 'Heavy Rain', icon: 'rain', wind_speed: 3 },
  71: { name: 'Slight Snow', icon: 'snow', wind_speed: 2 },
  73: { name: 'Moderate Snow', icon: 'snow', wind_speed: 2 },
  75: { name: 'Heavy Snow', icon: 'snow', wind_speed: 2 },
  77: { name: 'Snow Grains', icon: 'snow', wind_speed: 2 },
  80: { name: 'Slight Rain Showers', icon: 'rain', wind_speed: 3 },
  81: { name: 'Moderate Rain Showers', icon: 'rain', wind_speed: 3 },
  82: { name: 'Violent Rain Showers', icon: 'rain', wind_speed: 4 },
  85: { name: 'Slight Snow Showers', icon: 'snow', wind_speed: 3 },
  86: { name: 'Heavy Snow Showers', icon: 'snow', wind_speed: 3 },
  95: { name: 'Thunderstorm', icon: 'thunderstorm', wind_speed: 4 },
  96: { name: 'Thunderstorm with Slight Hail', icon: 'thunderstorm', wind_speed: 4 },
  99: { name: 'Thunderstorm with Heavy Hail', icon: 'thunderstorm', wind_speed: 4 }
};

// Initialize
function init() {
  updateHeaderDate();
  fetchWeather();
  initializeCanvas();
}

// Update header date
function updateHeaderDate() {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  headerDate.textContent = formatter.format(date).toUpperCase();
}

// Fetch weather data
async function fetchWeather() {
  try {
    headerStatus.textContent = 'Sincronizando atmosfera...';
    const params = new URLSearchParams({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      current: 'apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,visibility',
      hourly: 'temperature_2m,weather_code,precipitation_probability',
      daily: 'sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,precipitation_probability_max,uv_index_max',
      timezone: 'America/Sao_Paulo'
    });

    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    renderWeather(data);
    updateThemeByWeather(data.current);
    headerStatus.textContent = 'Dados sincronizados';
  } catch (error) {
    console.error('Erro ao buscar clima:', error);
    headerStatus.textContent = 'Erro ao carregar dados';
  }
}

// Update theme based on weather
function updateThemeByWeather(current) {
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code;
  
  if (!isDay) {
    document.body.className = 'weather-night';
  } else if (current.cloud_cover > 70 && current.precipitation > 0) {
    document.body.className = 'weather-rainy';
  } else if (current.cloud_cover > 60) {
    document.body.className = 'weather-cloudy';
  } else {
    document.body.className = 'weather-clear';
  }
}

// Render weather data
function renderWeather(data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;
  
  // Update temperature
  temperatureValue.textContent = Math.round(current.apparent_temperature);
  apparentTemp.textContent = `Sensação: ${Math.round(current.apparent_temperature)}°C`;
  
  // Update weather icon
  const condition = weatherConditions[current.weather_code] || { icon: 'clear' };
  let iconName = 'wb_sunny';
  if (!current.is_day) {
    iconName = 'nights_stay';
  } else if (condition.icon === 'cloudy') {
    iconName = 'cloud';
  } else if (condition.icon === 'rain') {
    iconName = 'cloud_queue';
  } else if (condition.icon === 'snow') {
    iconName = 'ac_unit';
  } else if (condition.icon === 'thunderstorm') {
    iconName = 'flash_on';
  }
  mainWeatherIcon.innerHTML = `<span class="material-symbols-rounded">${iconName}</span>`;
  
  // Update header
  headerLocation.textContent = currentLocation.name;
  
  // Update indicators
  const precipitation = Math.round(current.precipitation || 0);
  precipitationValue.textContent = `${precipitation}%`;
  precipitationFill.style.width = `${Math.min(precipitation, 100)}%`;
  
  const cloudCover = current.cloud_cover || 0;
  cloudValue.textContent = `${cloudCover}%`;
  cloudFill.style.width = `${cloudCover}%`;
  
  const visibility = current.visibility ? Math.round(current.visibility / 1000) : 10;
  visibilityValue.textContent = `${visibility} km`;
  visibilityFill.style.width = `${Math.min((visibility / 15) * 100, 100)}%`;
  
  // Render hourly forecast
  renderHourlyForecast(hourly);
  
  // Render daily forecast
  renderDailyForecast(daily);
  
  // Render sun times
  renderSunTimes(daily);
  
  // Update UV index
  const uvIndex = daily.uv_index_max[0] || 0;
  uvValue.textContent = Math.round(uvIndex);
  uvFill.style.width = `${Math.min((uvIndex / 11) * 100, 100)}%`;
  
  // Hide skeleton
  loadingSkeleton.classList.add('hidden');
}

// Render hourly forecast
function renderHourlyForecast(hourly) {
  hourlyForecast.innerHTML = '';
  const now = new Date();
  const hours = 24;
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const temp = hourly.temperature_2m[i];
    const precipProbability = hourly.precipitation_probability[i] || 0;
    const weatherCode = hourly.weather_code[i];
    
    const condition = weatherConditions[weatherCode] || { icon: 'clear' };
    let iconName = 'wb_sunny';
    if (condition.icon === 'cloudy') iconName = 'cloud';
    if (condition.icon === 'rain') iconName = 'cloud_queue';
    if (condition.icon === 'snow') iconName = 'ac_unit';
    if (condition.icon === 'thunderstorm') iconName = 'flash_on';
    
    const card = document.createElement('div');
    card.className = 'hourly-card';
    card.innerHTML = `
      <p class="hourly-time">${hour}:00</p>
      <div class="hourly-icon"><span class="material-symbols-rounded">${iconName}</span></div>
      <p class="hourly-temp">${Math.round(temp)}°</p>
    `;
    hourlyForecast.appendChild(card);
  }
}

// Render daily forecast
function renderDailyForecast(daily) {
  dailyForecast.innerHTML = '';
  
  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const date = new Date(daily.time[i]);
    const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
    const monthDay = new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric' }).format(date);
    
    const weatherCode = daily.weather_code[i];
    const condition = weatherConditions[weatherCode] || { icon: 'clear' };
    let iconName = 'wb_sunny';
    if (condition.icon === 'cloudy') iconName = 'cloud';
    if (condition.icon === 'rain') iconName = 'cloud_queue';
    if (condition.icon === 'snow') iconName = 'ac_unit';
    if (condition.icon === 'thunderstorm') iconName = 'flash_on';
    
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const precipitation = daily.precipitation_sum[i] || 0;
    const precipProb = daily.precipitation_probability_max[i] || 0;
    
    const card = document.createElement('div');
    card.className = 'daily-card';
    card.innerHTML = `
      <div class="daily-header">
        <span class="daily-date">${weekday} – ${monthDay}</span>
        <span class="daily-icon"><span class="material-symbols-rounded">${iconName}</span></span>
      </div>
      <div class="daily-temps">
        <div class="daily-temp">
          <p class="daily-temp-label">Máx</p>
          <p class="daily-temp-value">${maxTemp}°</p>
        </div>
        <div class="daily-temp">
          <p class="daily-temp-label">Mín</p>
          <p class="daily-temp-value">${minTemp}°</p>
        </div>
      </div>
      <div class="daily-rain">
        <span class="material-symbols-rounded daily-rain-icon">water_drop</span>
        <span class="daily-rain-text">${precipProb}% chance</span>
      </div>
    `;
    dailyForecast.appendChild(card);
  }
}

// Render sun times
function renderSunTimes(daily) {
  if (daily.sunrise && daily.sunrise.length > 0) {
    const sunriseDate = new Date(daily.sunrise[0]);
    const sunsetDate = new Date(daily.sunset[0]);
    sunriseTime.textContent = sunriseDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    sunsetTime.textContent = sunsetDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const durationMs = sunsetDate - sunriseDate;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    sunDuration.textContent = `${hours}h ${minutes}m`;
  }
}

// Initialize canvas for weather particles
function initializeCanvas() {
  const ctx = weatherCanvas.getContext('2d');
  weatherCanvas.width = window.innerWidth;
  weatherCanvas.height = window.innerHeight;
  
  const particles = [];
  
  function createParticles() {
    particles.length = 0;
    const count = Math.floor(window.innerWidth / 50);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * weatherCanvas.width,
        y: Math.random() * weatherCanvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        speedX: Math.random() * 0.3 - 0.15,
        opacity: Math.random() * 0.4 + 0.1
      });
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      
      if (p.y > weatherCanvas.height) p.y = -10;
      if (p.x > weatherCanvas.width) p.x = 0;
      if (p.x < 0) p.x = weatherCanvas.width;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  createParticles();
  animate();
  
  window.addEventListener('resize', () => {
    weatherCanvas.width = window.innerWidth;
    weatherCanvas.height = window.innerHeight;
  });
}

// Location button handler
locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    locationBtn.style.animation = 'spin 0.6s ease-in-out';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.latitude = position.coords.latitude;
        currentLocation.longitude = position.coords.longitude;
        currentLocation.name = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
        fetchWeather();
        locationBtn.style.animation = '';
      },
      () => {
        headerStatus.textContent = 'Permissão de localização negada';
        locationBtn.style.animation = '';
      }
    );
  }
});

// Initialize app
init();
