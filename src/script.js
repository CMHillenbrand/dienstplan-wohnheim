// Daten - startet leer
let mitarbeiter = [];

let dienstplan = {
    "Montag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Dienstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Mittwoch": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Donnerstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Freitag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Samstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
    "Sonntag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] }
};

// Globale Variablen
let currentAdminView = 'mitarbeiter';
let currentEditingTag = 'Montag';
let currentEditingMitarbeiter = null;
let currentEditingSchicht = null;
let currentSelectedMitarbeiter = [];
let filteredMitarbeiter = [];

// ROUTING
function initRouter() {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
        showAdminView();
    } else {
        showDienstplanView();
    }
}

// HILFSFUNKTIONEN
function formatMitarbeiterName(mitarbeiter) {
    const parts = mitarbeiter.name.split(' ');
    if (parts.length > 1) {
        return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return parts[0];
}

function getMitarbeiterById(id) {
    return mitarbeiter.find(m => m.id === id);
}

function getNextMitarbeiterId() {
    return mitarbeiter.length > 0 ? Math.max(...mitarbeiter.map(m => m.id)) + 1 : 1;
}

function getNextDay(currentDay) {
    const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const index = tage.indexOf(currentDay);
    return index === 6 ? 'Montag' : tage[index + 1];
}

// DIENSTPLAN ANZEIGE (Grid-Layout)
function showDienstplanView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="dienstplan-view">
            <div class="dienstplan-grid" id="dienstplanGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    renderDienstplanGrid();
}

function renderDienstplanGrid() {
    const grid = document.getElementById('dienstplanGrid');
    grid.innerHTML = '';
    
    // Wenn keine Mitarbeiter vorhanden, zeige Hinweis
    if (mitarbeiter.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #6c757d; text-align: center;">
                <h2 style="margin-bottom: 20px;">Noch keine Mitarbeiter vorhanden</h2>
                <p style="margin-bottom: 30px; font-size: 1.2em;">Gehen Sie zur Verwaltung, um Mitarbeiter hinzuzufügen.</p>
                <a href="/admin" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.2em; text-decoration: none; border-radius: 8px;">Zur Verwaltung</a>
            </div>
        `;
        return;
    }
    
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    // Tag-Header erstellen
    wochentage.forEach(tag => {
        const tagHeader = document.createElement('div');
        tagHeader.className = 'tag-header';
        tagHeader.textContent = tag;
        grid.appendChild(tagHeader);
    });
    
    // Schichten erstellen
    schichten.forEach(schicht => {
        wochentage.forEach(tag => {
            const schichtCell = document.createElement('div');
            schichtCell.className = `schicht-cell schicht-${schicht.toLowerCase()}`;
            
            const schichtHeader = document.createElement('div');
            schichtHeader.className = 'schicht-header';
            schichtHeader.textContent = schicht;
            schichtCell.appendChild(schichtHeader);
            
            const mitarbeiterContainer = document.createElement('div');
            mitarbeiterContainer.className = 'mitarbeiter-container';
            
            // Mitarbeiter für diese Schicht hinzufügen
            if (dienstplan[tag] && dienstplan[tag][schicht] && dienstplan[tag][schicht].length > 0) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = getMitarbeiterById(mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'mitarbeiter-item';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span class="mitarbeiter-name">${formatMitarbeiterName(mitarbeiterObj)}</span>
                        `;
                        mitarbeiterContainer.appendChild(mitarbeiterDiv);
                    }
                });
            } else {
                // Zeige leeren Zustand
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'empty-schicht';
                emptyDiv.style.cssText = `
                    color: #6c757d;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    margin: 10px 0;
                `;
                emptyDiv.textContent = 'Keine Mitarbeiter eingeteilt';
                mitarbeiterContainer.appendChild(emptyDiv);
            }
            
            schichtCell.appendChild(mitarbeiterContainer);
            grid.appendChild(schichtCell);
        });
    });
}

// ADMIN BEREICH
function showAdminView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="admin-view">
            <div class="admin-header">
                <h1>Dienstplan Verwaltung</h1>
                <a href="/" class="btn btn-primary">Zur Dienstplan-Anzeige</a>
            </div>
            
            <nav class="admin-nav">
                <button onclick="switchAdminView('mitarbeiter')" class="btn btn-primary ${currentAdminView === 'mitarbeiter' ? 'active' : ''}">
                    👥 Mitarbeiter verwalten
                </button>
                <button onclick="switchAdminView('dienstplan')" class="btn btn-primary ${currentAdminView === 'dienstplan' ? 'active' : ''}">
                    📅 Dienstplan bearbeiten
                </button>
            </nav>
            
            <div class="admin-content" id="adminContent">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    switchAdminView(currentAdminView);
}

function switchAdminView(view) {
    currentAdminView = view;
    
    // Navigation aktualisieren
    const navButtons = document.querySelectorAll('.admin-nav button');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(view)) {
            btn.classList.add('active');
        }
    });
    
    if (view === 'mitarbeiter') {
        showMitarbeiterVerwaltung();
    } else if (view === 'dienstplan') {
        showDienstplanEditor();
    }
}

// MITARBEITER VERWALTUNG
function showMitarbeiterVerwaltung() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="mitarbeiter-verwaltung">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Mitarbeiter</h2>
                <button onclick="showAddMitarbeiterForm()" class="btn btn-success">➕ Neuer Mitarbeiter</button>
            </div>
            
            <div id="mitarbeiterFormContainer" style="display: none;">
                <!-- Formular wird hier eingefügt -->
            </div>
            
            <div class="mitarbeiter-grid" id="mitarbeiterGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    renderMitarbeiterGrid();
}

function renderMitarbeiterGrid() {
    const grid = document.getElementById('mitarbeiterGrid');
    grid.innerHTML = '';
    
    if (mitarbeiter.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                <h3>Noch keine Mitarbeiter vorhanden</h3>
                <p>Klicken Sie auf "Neuer Mitarbeiter" um den ersten Mitarbeiter hinzuzufügen.</p>
            </div>
        `;
        return;
    }
    
    mitarbeiter.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mitarbeiter-card';
        card.innerHTML = `
            <img src="${m.bild}" alt="${m.name}" onerror="this.src='https://via.placeholder.com/80'">
            <h3>${m.name}</h3>
            <p style="color: #6c757d; margin-bottom: 15px;">ID: ${m.id}</p>
            <div class="actions">
                <button onclick="editMitarbeiter(${m.id})" class="btn btn-warning">✏️ Bearbeiten</button>
                <button onclick="deleteMitarbeiter(${m.id})" class="btn btn-danger">🗑️ Löschen</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function showAddMitarbeiterForm() {
    currentEditingMitarbeiter = null;
    const container = document.getElementById('mitarbeiterFormContainer');
    container.innerHTML = `
        <form id="mitarbeiterForm" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #28a745;">
            <h3>Neuer Mitarbeiter</h3>
            <div class="form-group">
                <label for="mitarbeiterName">Name:</label>
                <input type="text" id="mitarbeiterName" required>
            </div>
            <div class="form-group">
                <label for="mitarbeiterBild">Foto:</label>
                <input type="file" id="mitarbeiterBild" accept="image/*" onchange="previewImage()">
                <div id="imagePreview" style="margin-top: 10px;"></div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-success">💾 Speichern</button>
                <button type="button" onclick="cancelMitarbeiterForm()" class="btn btn-danger">❌ Abbrechen</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMitarbeiter();
    });
}

function showEditMitarbeiterForm(mitarbeiterObj) {
    const container = document.getElementById('mitarbeiterFormContainer');
    container.innerHTML = `
        <form id="mitarbeiterForm" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #007bff;">
            <h3>Mitarbeiter bearbeiten</h3>
            <div class="form-group">
                <label for="mitarbeiterName">Name:</label>
                <input type="text" id="mitarbeiterName" value="${mitarbeiterObj.name}" required>
            </div>
            <div class="form-group">
                <label for="mitarbeiterBild">Foto ändern (optional):</label>
                <input type="file" id="mitarbeiterBild" accept="image/*" onchange="previewImage()">
                <div id="imagePreview" style="margin-top: 10px;">
                    <div style="margin-bottom: 10px;">
                        <strong>Aktuelles Foto:</strong>
                    </div>
                    <img src="${mitarbeiterObj.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-success">💾 Änderungen speichern</button>
                <button type="button" onclick="cancelMitarbeiterForm()" class="btn btn-danger">❌ Abbrechen</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMitarbeiter();
    });
}

function previewImage() {
    const file = document.getElementById('mitarbeiterBild').files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (currentEditingMitarbeiter) {
                // Bei Bearbeitung: Neues Bild + aktuelles Bild anzeigen
                const currentMitarbeiter = getMitarbeiterById(currentEditingMitarbeiter);
                preview.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>Neues Foto:</strong>
                    </div>
                    <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #28a745; margin-right: 10px;">
                    <div style="margin-top: 10px; margin-bottom: 10px;">
                        <strong>Aktuelles Foto:</strong>
                    </div>
                    <img src="${currentMitarbeiter.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
                `;
            } else {
                // Bei neuem Mitarbeiter: Nur Vorschau
                preview.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>Vorschau:</strong>
                    </div>
                    <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #28a745;">
                `;
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (currentEditingMitarbeiter) {
            // Zurück zum aktuellen Bild
            const currentMitarbeiter = getMitarbeiterById(currentEditingMitarbeiter);
            preview.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Aktuelles Foto:</strong>
                </div>
                <img src="${currentMitarbeiter.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
            `;
        } else {
            preview.innerHTML = '';
        }
    }
}

function editMitarbeiter(id) {
    const mitarbeiterObj = getMitarbeiterById(id);
    if (mitarbeiterObj) {
        currentEditingMitarbeiter = id;
        showEditMitarbeiterForm(mitarbeiterObj);
    }
}

function saveMitarbeiter() {
    const name = document.getElementById('mitarbeiterName').value;
    const file = document.getElementById('mitarbeiterBild').files[0];
    
    if (currentEditingMitarbeiter) {
        // Mitarbeiter bearbeiten
        const mitarbeiterObj = getMitarbeiterById(currentEditingMitarbeiter);
        mitarbeiterObj.name = name;
        
        if (file) {
            // Neues Bild hochgeladen
            const reader = new FileReader();
            reader.onload = function(e) {
                mitarbeiterObj.bild = e.target.result;
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(file);
        } else {
            // Kein neues Bild - nur Name aktualisieren
            finishMitarbeiterSave();
        }
    } else {
        // Neuer Mitarbeiter
        const newId = getNextMitarbeiterId();
        const newMitarbeiter = {
            id: newId,
            name: name,
            bild: "https://via.placeholder.com/80"
        };
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newMitarbeiter.bild = e.target.result;
                mitarbeiter.push(newMitarbeiter);
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(file);
        } else {
            mitarbeiter.push(newMitarbeiter);
            finishMitarbeiterSave();
        }
    }
}

function finishMitarbeiterSave() {
    cancelMitarbeiterForm();
    renderMitarbeiterGrid();
    saveToStorage();
    
    // Dienstplan-Anzeige aktualisieren falls sie geladen ist
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    // Success-Message
    showSuccessMessage(currentEditingMitarbeiter ? 'Mitarbeiter wurde aktualisiert!' : 'Mitarbeiter wurde erstellt!');
    
    // Reset
    currentEditingMitarbeiter = null;
}

function cancelMitarbeiterForm() {
    document.getElementById('mitarbeiterFormContainer').style.display = 'none';
    currentEditingMitarbeiter = null;
}

function deleteMitarbeiter(id) {
    const mitarbeiterObj = getMitarbeiterById(id);
    if (confirm(`Mitarbeiter "${mitarbeiterObj.name}" wirklich löschen?\n\nDer Mitarbeiter wird auch aus dem Dienstplan entfernt.`)) {
        // Aus Mitarbeiter-Array entfernen
        mitarbeiter = mitarbeiter.filter(m => m.id !== id);
        
        // Aus Dienstplan entfernen
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(mId => mId !== id);
            });
        });
        
        renderMitarbeiterGrid();
        saveToStorage();
        
        // Dienstplan-Anzeige aktualisieren falls sie geladen ist
        if (window.location.pathname === '/') {
            renderDienstplanGrid();
        }
        
        showSuccessMessage(`Mitarbeiter "${mitarbeiterObj.name}" wurde gelöscht.`);
    }
}

// VISUELLER DIENSTPLAN EDITOR
function showDienstplanEditor() {
    const content = document.getElementById('adminContent');
    
    // Prüfe ob Mitarbeiter vorhanden sind
    if (mitarbeiter.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6c757d;">
                <h2>Keine Mitarbeiter vorhanden</h2>
                <p style="margin-bottom: 20px;">Sie müssen zuerst Mitarbeiter hinzufügen, bevor Sie den Dienstplan bearbeiten können.</p>
                <button onclick="switchAdminView('mitarbeiter')" class="btn btn-primary">Zur Mitarbeiterverwaltung</button>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <div class="dienstplan-bearbeitung">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Dienstplan bearbeiten</h2>
                <div>
                    <button onclick="resetDienstplan()" class="btn btn-warning">🔄 Zurücksetzen</button>
                    <button onclick="saveDienstplan()" class="btn btn-success">💾 Speichern</button>
                </div>
            </div>
            
            <div class="alert" style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>Anleitung:</strong> Klicken Sie auf eine Schicht, um die Mitarbeiter für diese Schicht auszuwählen.
            </div>
            
            <div class="dienstplan-edit-grid" id="dienstplanEditGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
        
        <!-- Mitarbeiter-Auswahl Modal -->
        <div id="mitarbeiterAuswahlModal" class="mitarbeiter-auswahl-modal">
            <div class="mitarbeiter-auswahl-content">
                <div class="auswahl-header">
                    <h2>Mitarbeiter auswählen</h2>
                    <span class="close" onclick="closeMitarbeiterAuswahl()">&times;</span>
                </div>
                
                <div class="auswahl-info">
                    <h3 id="schichtInfo">Schicht auswählen</h3>
                    <div class="selected-count" id="selectedCount">0 ausgewählt</div>
                </div>
                
                <div class="search-container">
                    <input type="text" class="search-input" id="mitarbeiterSearch" 
                           placeholder="Mitarbeiter suchen..." 
                           onkeyup="filterMitarbeiter()">
                </div>
                
                <div class="mitarbeiter-auswahl-grid" id="mitarbeiterAuswahlGrid">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                
                <div class="auswahl-actions">
                    <button onclick="clearSelection()" class="btn btn-warning">🗑️ Auswahl leeren</button>
                    <div class="auswahl-buttons">
                        <button onclick="closeMitarbeiterAuswahl()" class="btn btn-danger">❌ Abbrechen</button>
                        <button onclick="saveSchichtAuswahl()" class="btn btn-success">💾 Übernehmen</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderDienstplanEditGrid();
}

function renderDienstplanEditGrid() {
    const grid = document.getElementById('dienstplanEditGrid');
    grid.innerHTML = '';
    
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    // Tag-Header erstellen
    wochentage.forEach(tag => {
        const tagHeader = document.createElement('div');
        tagHeader.className = 'edit-tag-header';
        tagHeader.textContent = tag;
        grid.appendChild(tagHeader);
    });
    
    // Schichten erstellen
    schichten.forEach(schicht => {
        wochentage.forEach(tag => {
            const schichtCell = document.createElement('div');
            schichtCell.className = 'edit-schicht-cell';
            schichtCell.onclick = () => openMitarbeiterAuswahl(tag, schicht);
            
            const schichtHeader = document.createElement('div');
            schichtHeader.className = 'edit-schicht-header';
            schichtHeader.textContent = schicht;
            schichtCell.appendChild(schichtHeader);
            
            const mitarbeiterContainer = document.createElement('div');
            mitarbeiterContainer.className = 'edit-mitarbeiter-container';
            
            // Mitarbeiter für diese Schicht anzeigen
            if (dienstplan[tag] && dienstplan[tag][schicht] && dienstplan[tag][schicht].length > 0) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = getMitarbeiterById(mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'edit-mitarbeiter-item';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span>${formatMitarbeiterName(mitarbeiterObj)}</span>
                        `;
                        mitarbeiterContainer.appendChild(mitarbeiterDiv);
                    }
                });
            }
            
            // Add-Button
            const addButton = document.createElement('button');
            addButton.className = 'edit-add-button';
            addButton.textContent = '+ Mitarbeiter';
            addButton.onclick = (e) => {
                e.stopPropagation();
                openMitarbeiterAuswahl(tag, schicht);
            };
            mitarbeiterContainer.appendChild(addButton);
            
            schichtCell.appendChild(mitarbeiterContainer);
            grid.appendChild(schichtCell);
        });
    });
}

function openMitarbeiterAuswahl(tag, schicht) {
    currentEditingSchicht = { tag, schicht };
    
    // Aktuell ausgewählte Mitarbeiter laden
    currentSelectedMitarbeiter = dienstplan[tag][schicht] ? [...dienstplan[tag][schicht]] : [];
    
    // Info aktualisieren mit Hinweis für Nachtschicht
    let infoText = `${tag} - ${schicht}`;
    if (schicht === 'Nachtdienst') {
        infoText += ' (max. 1 Person)';
    }
    document.getElementById('schichtInfo').textContent = infoText;
    
    // Rest der Funktion bleibt gleich...
    document.getElementById('mitarbeiterSearch').value = '';
    filteredMitarbeiter = [...mitarbeiter];
    renderMitarbeiterAuswahlGrid();
    document.getElementById('mitarbeiterAuswahlModal').style.display = 'block';
    
    // Hervorhebung...
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
        cell.classList.remove('editing');
    });
    
    const cells = document.querySelectorAll('.edit-schicht-cell');
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    const tagIndex = wochentage.indexOf(tag);
    const schichtIndex = schichten.indexOf(schicht);
    const cellIndex = schichtIndex * 7 + tagIndex;
    
    if (cells[cellIndex]) {
        cells[cellIndex].classList.add('editing');
    }
}

function renderMitarbeiterAuswahlGrid() {
    const grid = document.getElementById('mitarbeiterAuswahlGrid');
    grid.innerHTML = '';
    
    if (filteredMitarbeiter.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                <h3>Keine Mitarbeiter gefunden</h3>
                <p>Versuchen Sie einen anderen Suchbegriff.</p>
            </div>
        `;
        return;
    }
    
    filteredMitarbeiter.forEach(m => {
        const card = document.createElement('div');
        card.className = 'auswahl-mitarbeiter-card';
        card.onclick = () => toggleMitarbeiterSelection(m.id);
        
        if (currentSelectedMitarbeiter.includes(m.id)) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <img src="${m.bild}" alt="${m.name}">
            <h4>${m.name}</h4>
            <div class="checkmark">✓</div>
        `;
        
        grid.appendChild(card);
    });
    
    updateSelectedCount();
}

function toggleMitarbeiterSelection(mitarbeiterId) {
    const { schicht } = currentEditingSchicht;
    
    if (currentSelectedMitarbeiter.includes(mitarbeiterId)) {
        currentSelectedMitarbeiter = currentSelectedMitarbeiter.filter(id => id !== mitarbeiterId);
    } else {
        // Nachtschicht-Begrenzung
        if (schicht === 'Nachtdienst' && currentSelectedMitarbeiter.length >= 1) {
            showErrorMessage('Nachtdienst: Es kann nur eine Person eingeteilt werden!');
            return;
        }
        currentSelectedMitarbeiter.push(mitarbeiterId);
    }
    
    // Karte aktualisieren
    const cards = document.querySelectorAll('.auswahl-mitarbeiter-card');
    cards.forEach(card => {
        const img = card.querySelector('img');
        const mitarbeiterObj = mitarbeiter.find(m => m.bild === img.src);
        if (mitarbeiterObj && mitarbeiterObj.id === mitarbeiterId) {
            card.classList.toggle('selected');
        }
    });
    
    updateSelectedCount();
}
function updateSelectedCount() {
    const count = currentSelectedMitarbeiter.length;
    document.getElementById('selectedCount').textContent = `${count} ausgewählt`;
}

function filterMitarbeiter() {
    const searchTerm = document.getElementById('mitarbeiterSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredMitarbeiter = [...mitarbeiter];
    } else {
        filteredMitarbeiter = mitarbeiter.filter(m => 
            m.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderMitarbeiterAuswahlGrid();
}

function clearSelection() {
    currentSelectedMitarbeiter = [];
    renderMitarbeiterAuswahlGrid();
}

function saveSchichtAuswahl() {
    if (currentEditingSchicht) {
        const { tag, schicht } = currentEditingSchicht;
        
        // Dienstplan aktualisieren
        dienstplan[tag][schicht] = [...currentSelectedMitarbeiter];
        
        // Nachtschicht automatisch zu Frühdienst des nächsten Tags
        if (schicht === 'Nachtdienst') {
            const nextDay = getNextDay(tag);
            if (nextDay) {
                currentSelectedMitarbeiter.forEach(mitarbeiterId => {
                    if (!dienstplan[nextDay]['Frühdienst'].includes(mitarbeiterId)) {
                        dienstplan[nextDay]['Frühdienst'].push(mitarbeiterId);
                    }
                });
            }
        }
        
        // Grid aktualisieren
        renderDienstplanEditGrid();
        
        // Modal schließen
        closeMitarbeiterAuswahl();
        
        // Success-Message
        showSuccessMessage(`${tag} - ${schicht} wurde aktualisiert (${currentSelectedMitarbeiter.length} Mitarbeiter)`);
    }
}

function closeMitarbeiterAuswahl() {
    document.getElementById('mitarbeiterAuswahlModal').style.display = 'none';
    currentEditingSchicht = null;
    currentSelectedMitarbeiter = [];
    
    // Hervorhebung entfernen
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
        cell.classList.remove('editing');
    });
}

function resetDienstplan() {
    if (confirm('Dienstplan wirklich zurücksetzen? Alle Änderungen gehen verloren.')) {
        // Alle Schichten leeren
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = [];
            });
        });
        
        renderDienstplanEditGrid();
        showSuccessMessage('Dienstplan wurde zurückgesetzt');
    }
}

function saveDienstplan() {
    saveToStorage();
    
    // Hauptansicht aktualisieren falls geöffnet
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    showSuccessMessage('Dienstplan wurde gespeichert!');
}

// SUCCESS MESSAGE
function showSuccessMessage(message) {
    // Entferne vorhandene Messages
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Nach 3 Sekunden ausblenden
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// STORAGE - Aktualisiert für Server-Backend
async function saveToStorage() {
    try {
        // Mitarbeiter speichern
        const mitarbeiterResponse = await fetch('/api/mitarbeiter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mitarbeiter)
        });
        
        // Dienstplan speichern
        const dienstplanResponse = await fetch('/api/dienstplan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dienstplan)
        });
        
        if (!mitarbeiterResponse.ok || !dienstplanResponse.ok) {
            throw new Error('Fehler beim Speichern');
        }
        
        return true;
    } catch (error) {
        console.error('Speicherfehler:', error);
        showErrorMessage('Fehler beim Speichern der Daten');
        return false;
    }
}

async function loadFromStorage() {
    try {
        // Mitarbeiter laden
        const mitarbeiterResponse = await fetch('/api/mitarbeiter');
        if (mitarbeiterResponse.ok) {
            mitarbeiter = await mitarbeiterResponse.json();
        }
        
        // Dienstplan laden
        const dienstplanResponse = await fetch('/api/dienstplan');
        if (dienstplanResponse.ok) {
            dienstplan = await dienstplanResponse.json();
        }
        
        return true;
    } catch (error) {
        console.error('Ladefehler:', error);
        showErrorMessage('Fehler beim Laden der Daten');
        return false;
    }
}

// Fehler-Message Funktion hinzufügen
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// DOMContentLoaded Event aktualisieren
document.addEventListener('DOMContentLoaded', async function() {
    await loadFromStorage();
    initRouter();
});

// Alle saveToStorage() Aufrufe zu async machen
async function finishMitarbeiterSave() {
    cancelMitarbeiterForm();
    renderMitarbeiterGrid();
    await saveToStorage();
    
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    showSuccessMessage(currentEditingMitarbeiter ? 'Mitarbeiter wurde aktualisiert!' : 'Mitarbeiter wurde erstellt!');
    currentEditingMitarbeiter = null;
}

async function deleteMitarbeiter(id) {
    const mitarbeiterObj = getMitarbeiterById(id);
    if (confirm(`Mitarbeiter "${mitarbeiterObj.name}" wirklich löschen?\n\nDer Mitarbeiter wird auch aus dem Dienstplan entfernt.`)) {
        mitarbeiter = mitarbeiter.filter(m => m.id !== id);
        
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(mId => mId !== id);
            });
        });
        
        renderMitarbeiterGrid();
        await saveToStorage();
        
        if (window.location.pathname === '/') {
            renderDienstplanGrid();
        }
        
        showSuccessMessage(`Mitarbeiter "${mitarbeiterObj.name}" wurde gelöscht.`);
    }
}

async function saveDienstplan() {
    await saveToStorage();
    
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    showSuccessMessage('Dienstplan wurde gespeichert!');
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initRouter();
});

// Navigation ohne Reload
window.addEventListener('popstate', initRouter);

// Links abfangen
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
        const href = e.target.getAttribute('href');
        if (href === '/' || href === '/admin') {
            e.preventDefault();
            window.history.pushState({}, '', href);
            initRouter();
        }
    }
});

// Modal schließen bei Klick außerhalb
window.onclick = function(event) {
    const modal = document.getElementById('mitarbeiterAuswahlModal');
    if (event.target === modal) {
        closeMitarbeiterAuswahl();
    }
}

// Bessere Namenformatierung für TV-Anzeige
function formatMitarbeiterName(mitarbeiter) {
    const parts = mitarbeiter.name.split(' ');
    if (parts.length > 1) {
        // Vorname + Nachname-Initial
        return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return parts[0];
}

// Für sehr lange Namen weitere Kürzung
function formatMitarbeiterNameShort(mitarbeiter) {
    const parts = mitarbeiter.name.split(' ');
    if (parts.length > 1) {
        if (parts[0].length > 8) {
            return parts[0].substring(0, 8) + '. ' + parts[1].charAt(0) + '.';
        }
        return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return parts[0].length > 10 ? parts[0].substring(0, 10) + '...' : parts[0];
}
