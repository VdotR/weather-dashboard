import { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Sunrise, Sunset, Thermometer, Navigation } from 'lucide-react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState('metric'); // metric or imperial
  
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
  //const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

  // Function to fetch current weather
  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        //`${CORS_PROXY}https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=${units}&appid=${API_KEY}`
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeather(data);
      fetchForecast(searchCity);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch 5-day forecast
  const fetchForecast = async (searchCity) => {
    try {
      const response = await fetch(
        //`${CORS_PROXY}https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=${units}&appid=${API_KEY}`
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the forecast data to get one forecast per day
      const dailyData = data.list.filter((reading, index) => 
        index % 8 === 0 // Get one reading per day (every 8th item is 24h apart)
      );
      
      setForecast(dailyData);
    } catch (err) {
      console.error('Error fetching forecast:', err);
    }
  };

  // Function to fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        //`${CORS_PROXY}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCity(data.name);
      setWeather(data);
      fetchForecastByCoords(lat, lon);
    } catch (err) {
      console.error("Weather by coords error:", err);
      setError('Failed to fetch weather data for your location.');
      // Fall back to default city
      setCity('San Francisco');
      fetchWeather('San Francisco');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch forecast by coordinates
  const fetchForecastByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        //`${CORS_PROXY}https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the forecast data to get one forecast per day
      const dailyData = data.list.filter((reading, index) => 
        index % 8 === 0 // Get one reading per day (every 8th item is 24h apart)
      );
      
      setForecast(dailyData);
    } catch (err) {
      console.error('Error fetching forecast by coords:', err);
    }
  };
  
  // Function to get user location
  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - got coordinates
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          // Error getting location
          console.error("Geolocation error:", error);
          setError("Could not get your location. Using default city.");
          setCity('San Francisco');
          fetchWeather('San Francisco');
          setLoading(false);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      // Geolocation not supported
      setError("Geolocation is not supported by your browser. Using default city.");
      setCity('San Francisco');
      fetchWeather('San Francisco');
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };
  
  // Toggle between Celsius and Fahrenheit
  const toggleUnits = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    if (weather) {
      fetchWeather(weather.name);
    }
  };
  
  // Format time from Unix timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date from Unix timestamp or JS Date
  const formatDate = (timestamp) => {
    // Check if timestamp is in milliseconds (JS Date.now()) or seconds (OpenWeather API)
    const date = timestamp > 10000000000 
      ? new Date(timestamp) // Already in milliseconds
      : new Date(timestamp * 1000); // Convert from seconds to milliseconds
    
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Weather icon URL builder
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };
  
  // Function to get background gradient based on weather condition and time
  const getBackgroundGradient = () => {
    if (!weather) return 'linear-gradient(to bottom right, #4a90e2, #2c3e50)'; // Default blue gradient
    
    const condition = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;
    
    // Check if it's day or night based on current time vs. sunrise/sunset
    const currentTime = Math.floor(Date.now() / 1000);
    const isDaytime = currentTime > weather.sys.sunrise && currentTime < weather.sys.sunset;
    
    // Return appropriate gradient based on weather condition
    if (condition.includes('clear')) {
      return isDaytime 
        ? 'linear-gradient(to bottom right, #FF7E00, #FFD700)' // Sunny day
        : 'linear-gradient(to bottom right, #0F2027, #203A43, #2C5364)'; // Clear night
    } else if (condition.includes('cloud')) {
      return isDaytime
        ? 'linear-gradient(to bottom right, #757F9A, #D7DDE8)' // Cloudy day
        : 'linear-gradient(to bottom right, #3F4C6B, #606C88)'; // Cloudy night
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'linear-gradient(to bottom right, #3E5151, #DECBA4)'; // Rainy
    } else if (condition.includes('thunderstorm')) {
      return 'linear-gradient(to bottom right, #283E51, #4B79A1)'; // Thunderstorm
    } else if (condition.includes('snow')) {
      return 'linear-gradient(to bottom right, #E6DADA, #274046)'; // Snowy
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return 'linear-gradient(to bottom right, #B993D6, #8CA6DB)'; // Misty/Foggy
    } else {
      // Temperature-based gradient as fallback
      if (temp > 30) { // Hot
        return 'linear-gradient(to bottom right, #ff416c, #ff4b2b)';
      } else if (temp < 5) { // Cold
        return 'linear-gradient(to bottom right, #a1c4fd, #c2e9fb)';
      } else { // Moderate
        return 'linear-gradient(to bottom right, #4a90e2, #2c3e50)';
      }
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    // Try to get user location on initial load
    getUserLocation();
  }, []);
  
  return (
    <div className="App">
      <header 
        className="App-header"
        style={{ background: getBackgroundGradient() }}
      >
        <h1>Weather Dashboard</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
          />
          <button 
            type="button" 
            onClick={getUserLocation}
            className="location-button"
            title="Use your location"
          >
            <Navigation size={20} />
          </button>
          <button type="submit">
            <Search size={20} />
          </button>
        </form>
        
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Loading State */}
        {loading && <div className="loading">Loading weather data...</div>}
        
        {/* Weather Data */}
        {!loading && weather && (
          <div className="weather-container">
            {/* Current Weather */}
            <div className="current-weather">
              <div className="location">
                <h2>{weather.name}, {weather.sys.country}</h2>
                <div className="date">
                  <MapPin size={16} />
                  <span>{formatDate(Date.now())}</span>
                </div>
              </div>
              
              <button onClick={toggleUnits} className="unit-toggle">
                Switch to {units === 'metric' ? '°F' : '°C'}
              </button>
              
              <div className="weather-main">
                <div className="temp-container">
                  <img 
                    src={getWeatherIconUrl(weather.weather[0].icon)}
                    alt={weather.weather[0].description}
                  />
                  <div>
                    <div className="temperature">
                      {Math.round(weather.main.temp)}
                      {units === 'metric' ? '°C' : '°F'}
                    </div>
                    <p className="description">{weather.weather[0].description}</p>
                  </div>
                </div>
                
                <div className="weather-details">
                  <div className="detail-item">
                    <Thermometer size={18} />
                    <span>Feels Like: {Math.round(weather.main.feels_like)}
                      {units === 'metric' ? '°C' : '°F'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <Wind size={18} />
                    <span>Wind: {weather.wind.speed}
                      {units === 'metric' ? ' m/s' : ' mph'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <Droplets size={18} />
                    <span>Humidity: {weather.main.humidity}%</span>
                  </div>
                  
                  <div className="detail-item">
                    <Sunrise size={18} />
                    <span>Sunrise: {formatTime(weather.sys.sunrise)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <Sunset size={18} />
                    <span>Sunset: {formatTime(weather.sys.sunset)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="forecast">
                <h3>5-Day Forecast</h3>
                <div className="forecast-items">
                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <p className="forecast-date">{formatDate(day.dt)}</p>
                      <img 
                        src={getWeatherIconUrl(day.weather[0].icon)}
                        alt={day.weather[0].main}
                      />
                      <p className="forecast-temp">
                        {Math.round(day.main.temp)}
                        {units === 'metric' ? '°C' : '°F'}
                      </p>
                      <p className="forecast-desc">{day.weather[0].main}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <footer>
          <p>Weather Dashboard • Built with React</p>
        </footer>
      </header>
    </div>
  );
}

export default App;