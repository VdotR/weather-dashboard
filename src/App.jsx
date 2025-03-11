import { useState, useEffect } from 'react'
import { Search, MapPin, Wind, Droplets, Sunrise, Sunset, Thermometer } from 'lucide-react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [units, setUnits] = useState('metric') // metric or imperial
  
  // For deployment, replace this with your actual API key
  // Or use environment variables: import.meta.env.VITE_WEATHER_API_KEY
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
  
  // Function to fetch current weather
  const fetchWeather = async (searchCity) => {
    setLoading(true)
    setError('')
    
    try {
      const corsProxy = 'https://cors-anywhere.herokuapp.com/'
      const response = await fetch(
        `${corsProxy}https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=${units}&appid=${API_KEY}`, 
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setWeather(data)
      fetchForecast(searchCity)
    } catch (err) {
      setError(`Failed to fetch weather data due to ${err}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }
  
  // Function to fetch 5-day forecast
  const fetchForecast = async (searchCity) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=${units}&appid=${API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Process the forecast data to get one forecast per day
      const dailyData = data.list.filter((reading, index) => 
        index % 8 === 0 // Get one reading per day (every 8th item is 24h apart)
      )
      
      setForecast(dailyData)
    } catch (err) {
      console.error('Error fetching forecast:', err)
    }
  }
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeather(city)
    }
  }
  
  // Toggle between Celsius and Fahrenheit
  const toggleUnits = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric'
    setUnits(newUnits)
    if (weather) {
      fetchWeather(weather.name)
    }
  }
  
  // Format time from Unix timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Format date from Unix timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }
  
  // Weather icon URL builder
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }
  
  // Try to get user's location on component mount
  useEffect(() => {
    // Set a default city on load
    setCity('San Francisco')
    fetchWeather('San Francisco')
  }, [])
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Dashboard</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
          />
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
          <p>Powered by OpenWeather API</p>
        </footer>
      </header>
    </div>
  )
}

export default App