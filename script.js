let selectedEquipId = null;

// QA: Fixed Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    navLinks.classList.remove('show');
    render();
}

// QA: Reliable Render & Garage Initialization
function render() {
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const listContainer = document.getElementById('equipmentList');
    
    if (listContainer) {
        listContainer.innerHTML = eq.length === 0 ? "<p>No equipment.</p>" : 
            eq.map(e => `
                <div class="history-item" onclick="selectEquip(${e.id})" style="cursor:pointer; border: 1px solid ${selectedEquipId === e.id ? '#27ae60' : '#eee'}">
                    <span>🚜 ${e.name}</span>
                    <button onclick="deleteEquip(${e.id}); event.stopPropagation();" class="btn-delete">🗑️</button>
                </div>
            `).join('');
    }

    const serviceSection = document.getElementById('mowerServiceSection');
    if (selectedEquipId && serviceSection) {
        const active = eq.find(e => e.id === selectedEquipId);
        if (active) {
            serviceSection.style.display = 'block';
            document.getElementById('activeMowerName').innerText = active.name;
            // Service alerts logic here...
        }
    } else if (serviceSection) {
        serviceSection.style.display = 'none';
    }

    updateCoachCorner();
}

function updateCoachCorner() {
    const coachDiv = document.getElementById('coachAction');
    if (!coachDiv) return;
    
    try {
        const grass = localStorage.getItem('grassType') || 'tall_fescue';
        coachDiv.innerHTML = `Lawn Status: Stable. Recommended height for ${grass.replace('_',' ')} is 3".`;
    } catch (e) {
        coachDiv.innerHTML = "Update your Yard Profile to see recommendations.";
    }
}

function addEquipment(type) {
    const name = document.getElementById('mowerModelSelect').value;
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    eq.push({ id: Date.now(), name, type, services: [] });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function selectEquip(id) {
    selectedEquipId = id;
    render();
}

window.onload = render;
