// --- GARAGE ENGINE ---
function addEquipment(type) {
    const name = document.getElementById('mowerModelSelect').value;
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    eq.push({ 
        id: Date.now(), 
        name: name, 
        type: type, 
        services: [] 
    });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function selectEquip(id) {
    selectedEquipId = id;
    render();
}

function deleteEquip(id) {
    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    localStorage.setItem('lawnEquip', JSON.stringify(eq.filter(e => e.id !== id)));
    if (selectedEquipId === id) selectedEquipId = null;
    render();
}

function saveService() {
    const task = document.getElementById('serviceTask').value;
    const date = document.getElementById('serviceDate').value;
    if (!date || !selectedEquipId) return;

    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const idx = eq.findIndex(i => i.id === selectedEquipId);
    if (idx !== -1) {
        eq[idx].services.push({ task, date, id: Date.now() });
        localStorage.setItem('lawnEquip', JSON.stringify(eq));
        render();
    }
}

// --- MAINTENANCE & RENDER ---
function render() {
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const listContainer = document.getElementById('equipmentList');
    
    // 1. Render Equipment List
    listContainer.innerHTML = eq.length === 0 ? "<p>No equipment added yet.</p>" : 
        eq.map(e => `
            <div class="history-item" onclick="selectEquip(${e.id})" style="cursor:pointer; background:#fff; padding:10px; margin-bottom:5px; border-radius:8px; border: 1px solid ${selectedEquipId === e.id ? 'var(--accent)' : '#eee'}">
                <span>🚜 ${e.name}</span>
                <button onclick="deleteEquip(${e.id}); event.stopPropagation();" class="btn-delete">🗑️</button>
            </div>
        `).join('');

    // 2. Handle Selected Mower
    const serviceSection = document.getElementById('mowerServiceSection');
    if (selectedEquipId) {
        const active = eq.find(e => e.id === selectedEquipId);
        if (active) {
            serviceSection.style.display = 'block';
            document.getElementById('activeMowerName').innerText = active.name;

            // Calculate "Hours" (Mows * 1.5 hrs average)
            const totalMows = logs.filter(l => l.type === 'Mow').length;
            const estimatedHours = totalMows * 1.5;
            
            // Notification Logic (50-hour interval)
            const alertBox = document.getElementById('maintAlert');
            if (estimatedHours >= 50) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = `⚠️ <b>Service Required:</b> This mower has ~${estimatedHours} hours. Manufacturer recommends an oil change every 50 hours!`;
            } else {
                alertBox.style.display = 'none';
            }

            document.getElementById('activeServiceHistory').innerHTML = active.services.slice().reverse().map(s => `
                <div class="history-item"><small>${s.date}: ${s.task}</small></div>
            `).join('');
        }
    } else {
        serviceSection.style.display = 'none';
    }
    
    // Run other update functions
    if (typeof updateCoachCorner === "function") updateCoachCorner();
}
