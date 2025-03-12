import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastComparisonChart = ({ forecast, units }) => {
  // If no forecast data or empty array, return null
  if (!forecast || forecast.length === 0) {
    return null;
  }

  // Format the data for the chart
  const chartData = forecast.map(day => {
    // Format the date
    const date = new Date(day.dt * 1000);
    const formattedDate = date.toLocaleDateString(undefined, { weekday: 'short' });
    
    return {
      name: formattedDate,
      temp: Math.round(day.main?.temp || 0),
      feels_like: Math.round(day.main?.feels_like || 0),
    };
  });

  return (
    <div className="weather-container">
      <div className="forecast">
        <h3>Temperature Trend</h3>
        <div className="forecast-items" style={{ 
          height: '12rem',
          display: 'block', // Override any flex styling
          marginTop: '0.5rem'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'white' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.5)' }}
              />
              <YAxis 
                label={{ 
                  value: units === 'metric' ? '°C' : '°F', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: 'white',
                  style: { textAnchor: 'middle' }
                }}
                tick={{ fill: 'white' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.5)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                name={`Temperature (${units === 'metric' ? '°C' : '°F'})`} 
                stroke="#FFD700" // Gold color for temperature
                strokeWidth={2}
                activeDot={{ r: 6 }} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="feels_like" 
                name={`Feels Like (${units === 'metric' ? '°C' : '°F'})`} 
                stroke="#E0E0E0" // Light gray for "feels like"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastComparisonChart;