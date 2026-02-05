import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [weather, setWeather] = useState({ temp: '--', desc: 'Loading...' });

  // Free API Fetch (Example: OpenWeatherMap)
  useEffect(() => {
    // Replace API_KEY with your actual free key from OpenWeather
    const API_KEY = 'YOUR_FREE_KEY_HERE';
    const city = 'YourCity'; 
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if(data.main) {
          setWeather({ temp: Math.round(data.main.temp), desc: data.weather[0].description });
        }
      });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="card">
        <h3>Current Weather</h3>
        <div className="big-stat">{weather.temp}°F</div>
        <p style={{textTransform: 'capitalize'}}>{weather.desc}</p>
      </div>

      <div className="card">
        <h3>Weekly Water Goal</h3>
        <div className="big-stat">0.75 / 1.5"</div>
        <p>50% of weekly goal reached</p>
      </div>

      <div className="card">
        <h3>Grass Health Score</h3>
        <div className="big-stat" style={{color: '#27ae60'}}>85</div>
        <p>Excellent condition</p>
      </div>

      <div className="card" style={{gridColumn: '1 / -1'}}>
        <h3>Upcoming Tasks</h3>
        <ul style={{listStyle: 'none', padding: 0}}>
          <li>🗓️ Mow Lawn: Friday Morning</li>
          <li>🔧 Sharpen Blades: 5 hours of use remaining</li>
          <li>🌱 Fertilize: Scheduled for Sunday</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
