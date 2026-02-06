// NAVIGATION LOGIC
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('navLinks').classList.remove('show');
}

// HAMBURGER TOGGLE
document.getElementById('menuToggle').onclick = () => {
    document.getElementById('navLinks').classList.toggle('show');
};

// WEATHER API (FREE)
async function fetchWeather() {
    const API_KEY = 'YOUR_FREE_OPENWEATHER_KEY'; // Get one for free at openweathermap.org
    const CITY = 'New York'; // Change to your city
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=imperial&appid=${API_KEY}`);
        const data = await response.json();
        document.getElementById('temp').innerText = Math.round(data.main.temp) + '°F';
        document.getElementById('weatherDesc').innerText = data.weather[0].description;
    } catch (error) {
        console.log("Weather error:", error);
    }
}

fetchWeather();
