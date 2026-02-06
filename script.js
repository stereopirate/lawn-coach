// --- NAVIGATION ---
const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');

menuToggle.onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
};

document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- WEATHER & ZIP ---
async function fetchWeather(zip = '10001') {
    const API_KEY = 'YOUR_FREE_OPENWEATHER_KEY'; 
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) {
            document.getElementById('temp').innerText = Math.round(data.main.temp) + '°F';
            document.getElementById('weatherDesc').innerText = data.weather[0].description;
        }
    } catch (e) { console.error("Weather Error", e); }
}

function saveZip() {
    const zip = document.getElementById('zipCode').value;
    if (zip.length === 5) {
        localStorage.setItem('lawnZip', zip);
        fetchWeather(zip);
    }
}

// --- LOGGING & DELETE ---
const activityForm = document.getElementById('activityForm');
const actType = document.getElementById('actType');
const actAmount = document.getElementById('actAmount');

// Toggle "Amount" field for water
actType.onchange = () => {
    actAmount.style.display = actType.value === 'Water' ? 'block' : 'none';
};

activityForm.onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const newEntry = {
        id: Date.now(),
        type: actType.value,
        date: document.getElementById('actDate').value,
        amount: parseFloat(actAmount.value) || 0
    };
    logs.push(newEntry);
    localStorage.setItem('lawnLogs', JSON.stringify(logs));
    render();
    activityForm.reset();
    actAmount.style.display = 'none';
};

function deleteLog(id) {
    let logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('lawnLogs', JSON.stringify(logs));
    render();
}

function render() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const historyList = document.getElementById('historyList');
    
    // Calculate Water Goal (Last 7 Days)
    const totalWater = logs
        .filter(l => l.type === 'Water')
        .reduce((sum, l) => sum + l.amount, 0);
    
    document.getElementById('waterStat').innerText = `${totalWater.toFixed(2)} / 1.5"`;
    const pct = Math.min((totalWater / 1.5) * 100, 100);
    document.getElementById('waterBar').style.width = pct + '%';

    // Render List
    historyList.innerHTML = logs.slice().reverse().map(log => `
        <div class="history-item">
            <div>
                <strong>${log.type} ${log.amount ? `(${log.amount}")` : ''}</strong><br>
                <small>${log.date}</small>
            </div>
            <button class="btn-delete" onclick="deleteLog(${log.id})">🗑️</button>
        </div>
    `).join('');
}

window.onload = () => {
    const zip = localStorage.getItem('lawnZip') || '10001';
    document.getElementById('zipCode').value = zip === '10001' ? '' : zip;
    fetchWeather(zip);
    render();
};
