let logs = JSON.parse(localStorage.getItem('lawnLogs')) || [];
let userZip = localStorage.getItem('lawnCoachZip') || "";

document.addEventListener('DOMContentLoaded', () => {
    if (userZip) {
        document.getElementById('city-input').value = userZip;
        getWeather(userZip);
    }
    renderLogs();

    document.getElementById('weather-btn').onclick = () => {
        const zip = document.getElementById('city-input').value;
        if (zip) { localStorage.setItem('lawnCoachZip', zip); getWeather(zip); }
    };

    const modal = document.getElementById('modal');
    document.getElementById('add-btn').onclick = () => modal.style.display = 'flex';
    document.getElementById('close-btn').onclick = () => modal.style.display = 'none';

    document.getElementById('save-btn').onclick = () => {
        const type = document.getElementById('activity-type').value;
        const zone = document.getElementById('activity-zone').value;
        const date = document.getElementById('activity-date').value;
        const notes = document.getElementById('activity-notes').value;

        if (date) {
            logs.unshift({ type, zone, date, notes });
            localStorage.setItem('lawnLogs', JSON.stringify(logs));
            renderLogs();
            document.getElementById('activity-notes').value = "";
            modal.style.display = 'none';
        } else { alert("Please select a date!"); }
    };
});

async function getWeather(zip) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1`);
        const geoData = await geoRes.json();
        if (!geoData.results) throw new Error();
        const { latitude, longitude, name } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,temperature_2m_max&current_weather=true&timezone=auto`);
        const data = await weatherRes.json();
        updateCoachAdvice(data, name);
    } catch (err) { document.getElementById('daily-tip').innerText = "Location not found. Try another zip!"; }
}

function updateCoachAdvice(data, cityName) {
    const temp = data.current_weather.temperature;
    const rainToday = data.daily.precipitation_sum[0];
    const rainTomorrow = data.daily.precipitation_sum[1];
    const tipEl = document.getElementById('daily-tip');
    document.getElementById('weather-display').innerHTML = `📍 ${cityName} | ${temp}°C`;

    if (rainToday > 0 || rainTomorrow > 1) {
        tipEl.innerHTML = "<b>Coach says:</b> 🌧 Rain detected. Skip watering and save your bill!";
    } else if (temp > 30) {
        tipEl.innerHTML = "<b>Coach says:</b> 🔥 High heat! Water deep and mow high (4\") to protect the roots.";
    } else {
        tipEl.innerHTML = "<b>Coach says:</b> Looking good! Solid day for general maintenance.";
    }
}

function renderLogs() {
    const container = document.getElementById('log-container');
    container.innerHTML = logs.length ? '' : '<div class="empty-state">No entries yet.</div>';
    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `<div class="log-header"><strong>${log.type}</strong><span class="zone-badge">${log.zone}</span></div><small>${log.date}</small>${log.notes ? `<p class="log-notes">${log.notes}</p>` : ''}`;
        container.appendChild(item);
    });
}
