// Erweiterte Daten
let mitarbeiter = [
    { id: 1, name: "Anna Müller", bild: "https://via.placeholder.com/60" },
    { id: 2, name: "Max Mustermann", bild: "https://via.placeholder.com/60" },
    { id: 3, name: "Lisa Schmidt", bild: "https://via.placeholder.com/60" }
];

let dienstplan = {
    "Montag": { "Frühdienst": [1, 2], "Spätdienst": [3], "Nachtdienst": [1] },
    "Dienstag": { "Frühdienst": [1, 3], "Spätdienst": [2], "Nachtdienst": [3] },
    "Mittwoch": { "Frühdienst": [2, 3], "Spätdienst": [1], "Nachtdienst": [2] },
    "Donnerstag": { "Frühdienst": [1, 2], "Spätdienst": [3], "Nachtdienst": [1] },
    "Freitag": { "Frühdienst": [2, 3], "Spätdienst": [1], "Nachtdienst": [2] },
    "Samstag": { "Frühdienst": [1, 3], "Spätdienst": [2], "Nachtdienst": [3] },
    "Sonntag": { "Frühdienst": [1, 2], "Spätdienst": [3], "Nachtdienst": [1] }
};

let currentEditingMitarbeiter = null;

// Mitarbeiterverwaltung
function showMitarbeiterVerwaltung() {
    loadMitarbeiterList();
    document.getElementById('mitarbeiterModal').style.display = 'block';
}

function closeMitarbeiterModal() {
    document.getElementById('mitarbeiterModal').style.display = 'none';
}

function loadMitarbeiterList() {
    const container = document.getElementById('mitarbeiterList');
    container.innerHTML = '';
    
    mitarbeiter.forEach(m => {
        const div = document.createElement('div');
        div.className = 'mitarbeiter-item';
        div.innerHTML = `
            <img src="${m.bild}" alt="${m.name}">
            <div class="mitarbeiter-info">
                <h4>${m.name}</h4>
            </div>
            <div class="mitarbeiter-actions">
                <button onclick="editMitarbeiter(${m.id})" class="btn-edit">✏️ Bearbeiten</button>
                <button onclick="deleteMitarbeiter(${m.id})" class="btn-delete">🗑️ Löschen</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function showAddMitarbeiter() {
    currentEditingMitarbeiter = null;
    document.getElementById('addMitarbeiterTitle').textContent = 'Neuer Mitarbeiter';
    document.getElementById('mitarbeiterForm').reset();
    document.getElementById('bildPreview').innerHTML = '';
    document.getElementById('addMitarbeiterModal').style.display = 'block';
}

function editMitarbeiter(id) {
    const mitarbeiterObj = mitarbeiter.find(m => m.id === id);
    if (mitarbeiterObj) {
        currentEditingMitarbeiter = id;
        document.getElementById('addMitarbeiterTitle').textContent = 'Mitarbeiter bearbeiten';
        document.getElementById('mitarbeiterName').value = mitarbeiterObj.name;
        document.getElementById('bildPreview').innerHTML = `<img src="${mitarbeiterObj.bild}" alt="Aktuelles Foto">`;
        document.getElementById('addMitarbeiterModal').style.display = 'block';
    }
}

function deleteMitarbeiter(id) {
    if (confirm('Mitarbeiter wirklich löschen?')) {
        mitarbeiter = mitarbeiter.filter(m => m.id !== id);
        
        // Aus Dienstplan entfernen
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(mId => mId !== id);
            });
        });
        
        loadMitarbeiterList();
        ladeDienstplan();
        saveToLocalStorage();
    }
}

function closeAddMitarbeiterModal() {
    document.getElementById('addMitarbeiterModal').style.display = 'none';
}

function previewBild() {
    const file = document.getElementById('mitarbeiterBild').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('bildPreview').innerHTML = `<img src="${e.target.result}" alt="Vorschau">`;
        };
        reader.readAsDataURL(file);
    }
}

// Form Submit Handler
document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('mitarbeiterName').value;
    const bildFile = document.getElementById('mitarbeiterBild').files[0];
    
    if (currentEditingMitarbeiter) {
        // Bearbeiten
        const mitarbeiterObj = mitarbeiter.find(m => m.id === currentEditingMitarbeiter);
        mitarbeiterObj.name = name;
        
        if (bildFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                mitarbeiterObj.bild = e.target.result;
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(bildFile);
        } else {
            finishMitarbeiterSave();
        }
    } else {
        // Neu erstellen
        const newId = Math.max(...mitarbeiter.map(m => m.id)) + 1;
        const newMitarbeiter = {
            id: newId,
            name: name,
            bild: "https://via.placeholder.com/60"
        };
        
        if (bildFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newMitarbeiter.bild = e.target.result;
                mitarbeiter.push(newMitarbeiter);
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(bildFile);
        } else {
            mitarbeiter.push(newMitarbeiter);
            finishMitarbeiterSave();
        }
    }
});

function finishMitarbeiterSave() {
    loadMitarbeiterList();
    ladeDienstplan();
    closeAddMitarbeiterModal();
    saveToLocalStorage();
}

// Dienstplan bearbeiten
function showDienstplanBearbeiten() {
    document.getElementById('dienstplanModal').style.display = 'block';
    loadTagForEdit();
}

function closeDienstplanModal() {
    document.getElementById('dienstplanModal').style.display = 'none';
}

function loadTagForEdit() {
    const tag = document.getElementById('tagSelect').value;
    const container = document.getElementById('schichtEdit');
    
    container.innerHTML = '';
    
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    schichten.forEach(schicht => {
        const div = document.createElement('div');
        div.className = 'schicht-group';
        div.innerHTML = `
            <h3>${schicht}</h3>
            <div class="mitarbeiter-checkboxes" id="${schicht}Checkboxes">
                ${mitarbeiter.map(m => `
                    <div class="checkbox-item">
                        <input type="checkbox" id="${schicht}_${m.id}" 
                               ${dienstplan[tag][schicht].includes(m.id) ? 'checked' : ''}
                               onchange="toggleSchichtSelection('${schicht}', ${m.id}, this.checked)">
                        <div class="checkbox-mitarbeiter">
                            <img src="${m.bild}" alt="${m.name}">
                            <span>${m.name}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleSchichtSelection(schicht, mitarbeiterId, checked) {
    const tag = document.getElementById('tagSelect').value;
    
    if (checked) {
        if (!dienstplan[tag][schicht].includes(mitarbeiterId)) {
            dienstplan[tag][schicht].push(mitarbeiterId);
        }
    } else {
        dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(id => id !== mitarbeiterId);
    }
    
    // Nachtschicht automatisch zu Frühdienst hinzufügen
    if (schicht === 'Nachtdienst' && checked) {
        const nextDay = getNextDay(tag);
        if (nextDay && !dienstplan[nextDay]['Frühdienst'].includes(mitarbeiterId)) {
            dienstplan[nextDay]['Frühdienst'].push(mitarbeiterId);
        }
    }
}

function getNextDay(currentDay) {
    const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const index = tage.indexOf(currentDay);
    return index === 6 ? 'Montag' : tage[index + 1];
}

function saveDienstplan() {
    ladeDienstplan();
    closeDienstplanModal();
    saveToLocalStorage();
    alert('Dienstplan gespeichert!');
}

// Vollbild-Modus
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('dienstplan_mitarbeiter', JSON.stringify(mitarbeiter));
    localStorage.setItem('dienstplan_plan', JSON.stringify(dienstplan));
}

function loadFromLocalStorage() {
    const savedMitarbeiter = localStorage.getItem('dienstplan_mitarbeiter');
    const savedPlan = localStorage.getItem('dienstplan_plan');
    
    if (savedMitarbeiter) {
        mitarbeiter = JSON.parse(savedMitarbeiter);
    }
    
    if (savedPlan) {
        dienstplan = JSON.parse(savedPlan);
    }
}

// Bestehende Funktionen bleiben...
function ladeDienstplan() {
    const container = document.getElementById('dienstplan');
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    
    container.innerHTML = '';
    
    wochentage.forEach(tag => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag';
        tagDiv.innerHTML = `<h3>${tag}</h3>`;
        
        const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
        schichten.forEach(schicht => {
            const schichtDiv = document.createElement('div');
            schichtDiv.className = 'schicht';
            schichtDiv.innerHTML = `<h4>${schicht}</h4>`;
            
            if (dienstplan[tag] && dienstplan[tag][schicht]) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = mitarbeiter.find(m => m.id === mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'mitarbeiter';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span class="mitarbeiter-name">${mitarbeiterObj.name}</span>
                        `;
                        schichtDiv.appendChild(mitarbeiterDiv);
                    }
                });
            }
            
            tagDiv.appendChild(schichtDiv);
        });
        
        container.appendChild(tagDiv);
    });
}

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    ladeDienstplan();
});
