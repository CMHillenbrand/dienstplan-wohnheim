// KONSTANTEN
const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const SCHICHTEN = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
const SCHICHT_COLORS = {
  'Frühdienst': 'success',
  'Spätdienst': 'warning', 
  'Nachtdienst': 'purple'
};

const STORAGE_KEYS = {
  mitarbeiter: 'dienstplan_mitarbeiter',
  plan: 'dienstplan_plan'
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/80';

// GLOBALE VARIABLEN
let mitarbeiter = [];
let dienstplan = createEmptyDienstplan();
let currentAdminView = 'mitarbeiter';
let currentEditingMitarbeiter = null;
let currentEditingSchicht = null;
let currentSelectedMitarbeiter = [];
let filteredMitarbeiter = [];

// UTILITY FUNKTIONEN
const Dom = {
  byId: (id) => document.getElementById(id),
  create: (tag, className, innerHTML) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },
  clear: (element) => element.innerHTML = '',
  show: (element) => element.style.display = 'block',
  hide: (element) => element.style.display = 'none',
  toggle: (element, className) => element.classList.toggle(className)
};

const Utils = {
  formatName: (name) => {
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
  },
  
  getNextId: (array) => array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1,
  
  getNextDay: (currentDay) => {
    const index = WOCHENTAGE.indexOf(currentDay);
    return index === 6 ? 'Montag' : WOCHENTAGE[index + 1];
  },
  
  findById: (array, id) => array.find(item => item.id === id),
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// DATENSTRUKTUREN
function createEmptyDienstplan() {
  const plan = {};
  WOCHENTAGE.forEach(tag => {
    plan[tag] = {};
    SCHICHTEN.forEach(schicht => {
      plan[tag][schicht] = [];
    });
  });
  return plan;
}

// ROUTING
class Router {
  static init() {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      Views.showAdmin();
    } else {
      Views.showDienstplan();
    }
  }
  
  static navigate(path) {
    window.history.pushState({}, '', path);
    this.init();
  }
}

// VIEWS
class Views {
  static showDienstplan() {
    const app = Dom.byId('app');
    app.innerHTML = `
      <div class="dienstplan-view">
        <div class="dienstplan-grid" id="dienstplanGrid"></div>
      </div>
    `;
    DienstplanRenderer.renderGrid();
  }
  
  static showAdmin() {
    const app = Dom.byId('app');
    app.innerHTML = `
      <div class="admin-view">
        <div class="admin-header">
          <h1>Dienstplan Verwaltung</h1>
          <a href="/" class="btn btn-primary">Zur Dienstplan-Anzeige</a>
        </div>
        
        <nav class="admin-nav">
          <button onclick="AdminController.switchView('mitarbeiter')" 
                  class="btn btn-primary ${currentAdminView === 'mitarbeiter' ? 'active' : ''}">
            👥 Mitarbeiter verwalten
          </button>
          <button onclick="AdminController.switchView('dienstplan')" 
                  class="btn btn-primary ${currentAdminView === 'dienstplan' ? 'active' : ''}">
            📅 Dienstplan bearbeiten
          </button>
        </nav>
        
        <div class="admin-content" id="adminContent"></div>
      </div>
    `;
    AdminController.switchView(currentAdminView);
  }
}

// RENDERER
class DienstplanRenderer {
  static renderGrid() {
    const grid = Dom.byId('dienstplanGrid');
    Dom.clear(grid);
    
    if (mitarbeiter.length === 0) {
      grid.innerHTML = this.getEmptyStateHTML();
      return;
    }
    
    this.renderHeaders(grid);
    this.renderSchichten(grid);
  }
  
  static renderHeaders(grid) {
    WOCHENTAGE.forEach(tag => {
      const header = Dom.create('div', 'tag-header', tag);
      grid.appendChild(header);
    });
  }
  
  static renderSchichten(grid) {
    SCHICHTEN.forEach(schicht => {
      WOCHENTAGE.forEach(tag => {
        const cell = this.createSchichtCell(tag, schicht);
        grid.appendChild(cell);
      });
    });
  }
  
  static createSchichtCell(tag, schicht) {
    const cell = Dom.create('div', `schicht-cell schicht-${schicht.toLowerCase()}`);
    const header = Dom.create('div', 'schicht-header', schicht);
    const container = Dom.create('div', 'mitarbeiter-container');
    
    const mitarbeiterIds = dienstplan[tag]?.[schicht] || [];
    
    if (mitarbeiterIds.length > 0) {
      mitarbeiterIds.forEach(id => {
        const mitarbeiterObj = Utils.findById(mitarbeiter, id);
        if (mitarbeiterObj) {
          const item = this.createMitarbeiterItem(mitarbeiterObj);
          container.appendChild(item);
        }
      });
    } else {
      container.appendChild(this.createEmptySchichtItem());
    }
    
    cell.appendChild(header);
    cell.appendChild(container);
    return cell;
  }
  
  static createMitarbeiterItem(mitarbeiterObj) {
    return Dom.create('div', 'mitarbeiter-item', `
      <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}" class="avatar avatar-md">
      <span class="mitarbeiter-name">${Utils.formatName(mitarbeiterObj)}</span>
    `);
  }
  
  static createEmptySchichtItem() {
    return Dom.create('div', 'empty-schicht', 'Keine Mitarbeiter eingeteilt');
  }
  
  static getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <h2>Noch keine Mitarbeiter vorhanden</h2>
        <p>Gehen Sie zur Verwaltung, um Mitarbeiter hinzuzufügen.</p>
        <a href="/admin" class="btn btn-primary">Zur Verwaltung</a>
      </div>
    `;
  }
}

// ADMIN CONTROLLER
class AdminController {
  static switchView(view) {
    currentAdminView = view;
    this.updateNavigation();
    
    switch (view) {
      case 'mitarbeiter':
        MitarbeiterController.show();
        break;
      case 'dienstplan':
        DienstplanEditor.show();
        break;
    }
  }
  
  static updateNavigation() {
    const buttons = document.querySelectorAll('.admin-nav button');
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.toLowerCase().includes(currentAdminView)) {
        btn.classList.add('active');
      }
    });
  }
}

// MITARBEITER CONTROLLER
class MitarbeiterController {
  static show() {
    const content = Dom.byId('adminContent');
    content.innerHTML = `
      <div class="mitarbeiter-verwaltung">
        <div class="section-header">
          <h2>Mitarbeiter</h2>
          <button onclick="MitarbeiterController.showAddForm()" class="btn btn-success">
            ➕ Neuer Mitarbeiter
          </button>
        </div>
        
        <div id="mitarbeiterFormContainer" class="form-container"></div>
        <div class="mitarbeiter-grid" id="mitarbeiterGrid"></div>
      </div>
    `;
    
    this.renderGrid();
  }
  
  static renderGrid() {
    const grid = Dom.byId('mitarbeiterGrid');
    Dom.clear(grid);
    
    if (mitarbeiter.length === 0) {
      grid.innerHTML = this.getEmptyStateHTML();
      return;
    }
    
    mitarbeiter.forEach(m => {
      const card = this.createMitarbeiterCard(m);
      grid.appendChild(card);
    });
  }
  
  static createMitarbeiterCard(mitarbeiter) {
    return Dom.create('div', 'mitarbeiter-card', `
      <img src="${mitarbeiter.bild}" alt="${mitarbeiter.name}" class="avatar avatar-lg" 
           onerror="this.src='${PLACEHOLDER_IMAGE}'">
      <h3>${mitarbeiter.name}</h3>
      <p class="text-muted">ID: ${mitarbeiter.id}</p>
      <div class="actions">
        <button onclick="MitarbeiterController.edit(${mitarbeiter.id})" class="btn btn-warning">
          ✏️ Bearbeiten
        </button>
        <button onclick="MitarbeiterController.delete(${mitarbeiter.id})" class="btn btn-danger">
          🗑️ Löschen
        </button>
      </div>
    `);
  }
  
  static showAddForm() {
    currentEditingMitarbeiter = null;
    this.showForm('Neuer Mitarbeiter', 'success');
  }
  
  static showEditForm(mitarbeiterObj) {
    currentEditingMitarbeiter = mitarbeiterObj.id;
    this.showForm('Mitarbeiter bearbeiten', 'primary', mitarbeiterObj);
  }
  
  static showForm(title, colorClass, mitarbeiterObj = null) {
    const container = Dom.byId('mitarbeiterFormContainer');
    container.innerHTML = `
      <form id="mitarbeiterForm" class="mitarbeiter-form border-${colorClass}">
        <h3>${title}</h3>
        <div class="form-group">
          <label for="mitarbeiterName">Name:</label>
          <input type="text" id="mitarbeiterName" class="form-control" 
                 value="${mitarbeiterObj?.name || ''}" required>
        </div>
        <div class="form-group">
          <label for="mitarbeiterBild">Foto${mitarbeiterObj ? ' ändern (optional)' : ''}:</label>
          <input type="file" id="mitarbeiterBild" class="form-control" 
                 accept="image/*" onchange="MitarbeiterController.previewImage()">
          <div id="imagePreview" class="image-preview"></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-${colorClass}">💾 Speichern</button>
          <button type="button" onclick="MitarbeiterController.cancelForm()" class="btn btn-danger">
            ❌ Abbrechen
          </button>
        </div>
      </form>
    `;
    
    Dom.show(container);
    
    if (mitarbeiterObj) {
      this.showCurrentImage(mitarbeiterObj);
    }
    
    Dom.byId('mitarbeiterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });
  }
  
  static previewImage() {
    const file = Dom.byId('mitarbeiterBild').files[0];
    const preview = Dom.byId('imagePreview');
    
    if (!file) {
      if (currentEditingMitarbeiter) {
        const current = Utils.findById(mitarbeiter, currentEditingMitarbeiter);
        this.showCurrentImage(current);
      } else {
        Dom.clear(preview);
      }
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const html = currentEditingMitarbeiter 
        ? this.getEditPreviewHTML(e.target.result)
        : this.getNewPreviewHTML(e.target.result);
      preview.innerHTML = html;
    };
    reader.readAsDataURL(file);
  }
  
  static showCurrentImage(mitarbeiterObj) {
    const preview = Dom.byId('imagePreview');
    preview.innerHTML = `
      <div class="preview-section">
        <strong>Aktuelles Foto:</strong>
        <img src="${mitarbeiterObj.bild}" class="preview-image avatar avatar-lg">
      </div>
    `;
  }
  
  static getEditPreviewHTML(newImageSrc) {
    const current = Utils.findById(mitarbeiter, currentEditingMitarbeiter);
    return `
      <div class="preview-section">
        <strong>Neues Foto:</strong>
        <img src="${newImageSrc}" class="preview-image avatar avatar-lg border-success">
      </div>
      <div class="preview-section">
        <strong>Aktuelles Foto:</strong>
        <img src="${current.bild}" class="preview-image avatar avatar-lg">
      </div>
    `;
  }
  
  static getNewPreviewHTML(imageSrc) {
    return `
      <div class="preview-section">
        <strong>Vorschau:</strong>
        <img src="${imageSrc}" class="preview-image avatar avatar-lg border-success">
      </div>
    `;
  }
  
  static save() {
    const name = Dom.byId('mitarbeiterName').value.trim();
    const file = Dom.byId('mitarbeiterBild').files[0];
    
    if (!name) {
      UI.showError('Name ist erforderlich');
      return;
    }
    
    if (currentEditingMitarbeiter) {
      this.updateMitarbeiter(name, file);
    } else {
      this.createMitarbeiter(name, file);
    }
  }
  
  static updateMitarbeiter(name, file) {
    const mitarbeiterObj = Utils.findById(mitarbeiter, currentEditingMitarbeiter);
    mitarbeiterObj.name = name;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        mitarbeiterObj.bild = e.target.result;
        this.finishSave('Mitarbeiter wurde aktualisiert!');
      };
      reader.readAsDataURL(file);
    } else {
      this.finishSave('Mitarbeiter wurde aktualisiert!');
    }
  }
  
  static createMitarbeiter(name, file) {
    const newMitarbeiter = {
      id: Utils.getNextId(mitarbeiter),
      name: name,
      bild: PLACEHOLDER_IMAGE
    };
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newMitarbeiter.bild = e.target.result;
        mitarbeiter.push(newMitarbeiter);
        this.finishSave('Mitarbeiter wurde erstellt!');
      };
      reader.readAsDataURL(file);
    } else {
      mitarbeiter.push(newMitarbeiter);
      this.finishSave('Mitarbeiter wurde erstellt!');
    }
  }
  
  static finishSave(message) {
    this.cancelForm();
    this.renderGrid();
    Storage.save();
    UI.showSuccess(message);
    
    // Update main view if loaded
    if (window.location.pathname === '/') {
      DienstplanRenderer.renderGrid();
    }
    
    currentEditingMitarbeiter = null;
  }
  
  static cancelForm() {
    const container = Dom.byId('mitarbeiterFormContainer');
    Dom.hide(container);
    currentEditingMitarbeiter = null;
  }
  
  static edit(id) {
    const mitarbeiterObj = Utils.findById(mitarbeiter, id);
    if (mitarbeiterObj) {
      this.showEditForm(mitarbeiterObj);
    }
  }
  
  static delete(id) {
    const mitarbeiterObj = Utils.findById(mitarbeiter, id);
    if (!mitarbeiterObj) return;
    
    if (confirm(`Mitarbeiter "${mitarbeiterObj.name}" wirklich löschen?\n\nDer Mitarbeiter wird auch aus dem Dienstplan entfernt.`)) {
      // Remove from array
      mitarbeiter = mitarbeiter.filter(m => m.id !== id);
      
      // Remove from dienstplan
      DienstplanController.removeMitarbeiterFromAll(id);
      
      this.renderGrid();
      Storage.save();
      UI.showSuccess(`Mitarbeiter "${mitarbeiterObj.name}" wurde gelöscht.`);
      
      // Update main view if loaded
      if (window.location.pathname === '/') {
        DienstplanRenderer.renderGrid();
      }
    }
  }
  
  static getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <h3>Noch keine Mitarbeiter vorhanden</h3>
        <p>Klicken Sie auf "Neuer Mitarbeiter" um den ersten Mitarbeiter hinzuzufügen.</p>
      </div>
    `;
  }
}

// DIENSTPLAN EDITOR
class DienstplanEditor {
  static show() {
    const content = Dom.byId('adminContent');
    
    if (mitarbeiter.length === 0) {
      content.innerHTML = this.getNoMitarbeiterHTML();
      return;
    }
    
    content.innerHTML = `
      <div class="dienstplan-bearbeitung">
        <div class="section-header">
          <h2>Dienstplan bearbeiten</h2>
          <div class="actions">
            <button onclick="DienstplanEditor.reset()" class="btn btn-warning">
              🔄 Zurücksetzen
            </button>
            <button onclick="DienstplanEditor.save()" class="btn btn-success">
              💾 Speichern
            </button>
          </div>
        </div>
        
        <div class="alert alert-info">
          <strong>Anleitung:</strong> Klicken Sie auf eine Schicht, um die Mitarbeiter für diese Schicht auszuwählen.
        </div>
        
        <div class="dienstplan-edit-grid" id="dienstplanEditGrid"></div>
      </div>
      
      ${this.getModalHTML()}
    `;
    
    this.renderGrid();
  }
  
  static renderGrid() {
    const grid = Dom.byId('dienstplanEditGrid');
    Dom.clear(grid);
    
    this.renderHeaders(grid);
    this.renderSchichten(grid);
  }
  
  static renderHeaders(grid) {
    WOCHENTAGE.forEach(tag => {
      const header = Dom.create('div', 'edit-tag-header', tag);
      grid.appendChild(header);
    });
  }
  
  static renderSchichten(grid) {
    SCHICHTEN.forEach(schicht => {
      WOCHENTAGE.forEach(tag => {
        const cell = this.createEditCell(tag, schicht);
        grid.appendChild(cell);
      });
    });
  }
  
  static createEditCell(tag, schicht) {
    const cell = Dom.create('div', 'edit-schicht-cell');
    cell.onclick = () => MitarbeiterAuswahl.open(tag, schicht);
    
    const header = Dom.create('div', 'edit-schicht-header', schicht);
    const container = Dom.create('div', 'edit-mitarbeiter-container');
    
    // Add current mitarbeiter
    const mitarbeiterIds = dienstplan[tag]?.[schicht] || [];
    mitarbeiterIds.forEach(id => {
      const mitarbeiterObj = Utils.findById(mitarbeiter, id);
      if (mitarbeiterObj) {
        const item = Dom.create('div', 'edit-mitarbeiter-item', `
          <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}" class="avatar avatar-sm">
          <span>${Utils.formatName(mitarbeiterObj)}</span>
        `);
        container.appendChild(item);
      }
    });
    
    // Add button
    const addButton = Dom.create('button', 'edit-add-button', '+ Mitarbeiter');
    addButton.onclick = (e) => {
      e.stopPropagation();
      MitarbeiterAuswahl.open(tag, schicht);
    };
    container.appendChild(addButton);
    
    cell.appendChild(header);
    cell.appendChild(container);
    return cell;
  }
  
  static reset() {
    if (confirm('Dienstplan wirklich zurücksetzen? Alle Änderungen gehen verloren.')) {
      dienstplan = createEmptyDienstplan();
      this.renderGrid();
      UI.showSuccess('Dienstplan wurde zurückgesetzt');
    }
  }
  
  static save() {
    Storage.save();
    
    // Update main view if loaded
    if (window.location.pathname === '/') {
      DienstplanRenderer.renderGrid();
    }
    
    UI.showSuccess('Dienstplan wurde gespeichert!');
  }
  
  static getNoMitarbeiterHTML() {
    return `
      <div class="empty-state">
        <h2>Keine Mitarbeiter vorhanden</h2>
        <p>Sie müssen zuerst Mitarbeiter hinzufügen, bevor Sie den Dienstplan bearbeiten können.</p>
        <button onclick="AdminController.switchView('mitarbeiter')" class="btn btn-primary">
          Zur Mitarbeiterverwaltung
        </button>
      </div>
    `;
  }
  
  static getModalHTML() {
    return `
      <div id="mitarbeiterAuswahlModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Mitarbeiter auswählen</h2>
            <span class="close" onclick="MitarbeiterAuswahl.close()">&times;</span>
          </div>
          
          <div class="modal-info">
            <h3 id="schichtInfo">Schicht auswählen</h3>
            <div class="selected-count" id="selectedCount">0 ausgewählt</div>
          </div>
          
          <div class="search-container">
            <input type="text" class="search-input" id="mitarbeiterSearch" 
                   placeholder="Mitarbeiter suchen...">
          </div>
          
          <div class="mitarbeiter-auswahl-grid" id="mitarbeiterAuswahlGrid"></div>
          
          <div class="modal-actions">
            <button onclick="MitarbeiterAuswahl.clearSelection()" class="btn btn-warning">
              🗑️ Auswahl leeren
            </button>
            <div class="action-buttons">
              <button onclick="MitarbeiterAuswahl.close()" class="btn btn-danger">
                ❌ Abbrechen
              </button>
              <button onclick="MitarbeiterAuswahl.save()" class="btn btn-success">
                💾 Übernehmen
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// MITARBEITER AUSWAHL MODAL
class MitarbeiterAuswahl {
  static open(tag, schicht) {
    currentEditingSchicht = { tag, schicht };
    currentSelectedMitarbeiter = [...(dienstplan[tag]?.[schicht] || [])];
    
    Dom.byId('schichtInfo').textContent = `${tag} - ${schicht}`;
    Dom.byId('mitarbeiterSearch').value = '';
    
    filteredMitarbeiter = [...mitarbeiter];
    this.renderGrid();
    this.highlightEditingCell(tag, schicht);
    
    Dom.show(Dom.byId('mitarbeiterAuswahlModal'));
  }
  
  static renderGrid() {
    const grid = Dom.byId('mitarbeiterAuswahlGrid');
    Dom.clear(grid);
    
    if (filteredMitarbeiter.length === 0) {
      grid.innerHTML = this.getEmptySearchHTML();
      return;
    }
    
    filteredMitarbeiter.forEach(m => {
      const card = this.createMitarbeiterCard(m);
      grid.appendChild(card);
    });
    
    this.updateSelectedCount();
  }
  
  static createMitarbeiterCard(mitarbeiterObj) {
    const card = Dom.create('div', 'auswahl-mitarbeiter-card');
    card.onclick = () => this.toggleSelection(mitarbeiterObj.id);
    
    if (currentSelectedMitarbeiter.includes(mitarbeiterObj.id)) {
      card.classList.add('selected');
    }
    
    card.innerHTML = `
      <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}" class="avatar avatar-md">
      <h4>${mitarbeiterObj.name}</h4>
      <div class="checkmark">✓</div>
    `;
    
    return card;
  }
  
  static toggleSelection(mitarbeiterId) {
    const index = currentSelectedMitarbeiter.indexOf(mitarbeiterId);
    
    if (index > -1) {
      currentSelectedMitarbeiter.splice(index, 1);
    } else {
      currentSelectedMitarbeiter.push(mitarbeiterId);
    }
    
    this.renderGrid();
  }
  
  static updateSelectedCount() {
    const count = currentSelectedMitarbeiter.length;
    Dom.byId('selectedCount').textContent = `${count} ausgewählt`;
  }
  
  static clearSelection() {
    currentSelectedMitarbeiter = [];
    this.renderGrid();
  }
  
  static save() {
    if (!currentEditingSchicht) return;
    
    const { tag, schicht } = currentEditingSchicht;
    dienstplan[tag][schicht] = [...currentSelectedMitarbeiter];
    
    // Auto-assign night shift to next day's early shift
    if (schicht === 'Nachtdienst') {
      const nextDay = Utils.getNextDay(tag);
      const nextDayEarly = dienstplan[nextDay]['Frühdienst'];
      
      currentSelectedMitarbeiter.forEach(id => {
        if (!nextDayEarly.includes(id)) {
          nextDayEarly.push(id);
        }
      });
    }
    
    DienstplanEditor.renderGrid();
    this.close();
    
    const count = currentSelectedMitarbeiter.length;
    UI.showSuccess(`${tag} - ${schicht} wurde aktualisiert (${count} Mitarbeiter)`);
  }
  
  static close() {
    Dom.hide(Dom.byId('mitarbeiterAuswahlModal'));
    currentEditingSchicht = null;
    currentSelectedMitarbeiter = [];
    
    // Remove editing highlight
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
      cell.classList.remove('editing');
    });
  }
  
  static highlightEditingCell(tag, schicht) {
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
      cell.classList.remove('editing');
    });
    
    const tagIndex = WOCHENTAGE.indexOf(tag);
    const schichtIndex = SCHICHTEN.indexOf(schicht);
    const cellIndex = schichtIndex * 7 + tagIndex;
    const cells = document.querySelectorAll('.edit-schicht-cell');
    
    if (cells[cellIndex]) {
      cells[cellIndex].classList.add('editing');
    }
  }
  
  static getEmptySearchHTML() {
    return `
      <div class="empty-state">
        <h3>Keine Mitarbeiter gefunden</h3>
        <p>Versuchen Sie einen anderen Suchbegriff.</p>
      </div>
    `;
  }
}

// DIENSTPLAN CONTROLLER
class DienstplanController {
  static removeMitarbeiterFromAll(mitarbeiterId) {
    WOCHENTAGE.forEach(tag => {
      SCHICHTEN.forEach(schicht => {
        dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(id => id !== mitarbeiterId);
      });
    });
  }
}

// UI UTILITIES
class UI {
  static showSuccess(message) {
    this.showMessage(message, 'success');
  }
  
  static showError(message) {
    this.showMessage(message, 'error');
  }
  
  static showMessage(message, type) {
    // Remove existing messages
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    
    const toast = Dom.create('div', `toast-message toast-${type}`, message);
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }
}

// STORAGE
class Storage {
  static save() {
    localStorage.setItem(STORAGE_KEYS.mitarbeiter, JSON.stringify(mitarbeiter));
    localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(dienstplan));
  }
  
  static load() {
    const savedMitarbeiter = localStorage.getItem(STORAGE_KEYS.mitarbeiter);
    const savedPlan = localStorage.getItem(STORAGE_KEYS.plan);
    
    if (savedMitarbeiter) {
      try {
        mitarbeiter = JSON.parse(savedMitarbeiter);
      } catch (e) {
        console.error('Error loading mitarbeiter:', e);
        mitarbeiter = [];
      }
    }
    
    if (savedPlan) {
      try {
        dienstplan = JSON.parse(savedPlan);
      } catch (e) {
        console.error('Error loading dienstplan:', e);
        dienstplan = createEmptyDienstplan();
      }
    }
  }
}

// EVENT SETUP
class EventManager {
  static init() {
    // Router events
    window.addEventListener('popstate', Router.init);
    
    // Global click handler for navigation
    document.addEventListener('click', this.handleNavigation);
    
    // Modal close on outside click
    window.addEventListener('click', this.handleModalClose);
    
    // Search functionality
    const searchInput = Dom.byId('mitarbeiterSearch');
    if (searchInput) {
      searchInput.addEventListener('keyup', Utils.debounce(() => {
        this.handleSearch();
      }, 300));
    }
  }
  
  static handleNavigation(e) {
    if (e.target.tagName === 'A') {
      const href = e.target.getAttribute('href');
      if (href === '/' || href === '/admin') {
        e.preventDefault();
        Router.navigate(href);
      }
    }
  }
  
  static handleModalClose(e) {
    const modal = Dom.byId('mitarbeiterAuswahlModal');
    if (modal && e.target === modal) {
      MitarbeiterAuswahl.close();
    }
  }
  
  static handleSearch() {
    const searchTerm = Dom.byId('mitarbeiterSearch')?.value.toLowerCase() || '';
    
    filteredMitarbeiter = searchTerm === '' 
      ? [...mitarbeiter]
      : mitarbeiter.filter(m => m.name.toLowerCase().includes(searchTerm));
    
    MitarbeiterAuswahl.renderGrid();
  }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  Storage.load();
  Router.init();
  EventManager.init();
});

// GLOBAL FUNCTIONS (for backwards compatibility)
window.AdminController = AdminController;
window.MitarbeiterController = MitarbeiterController;
window.DienstplanEditor = DienstplanEditor;
window.MitarbeiterAuswahl = MitarbeiterAuswahl;
