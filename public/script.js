// -------------------------
// VARIABLES
// -------------------------
let map;
let eventMarkers = [];
let markerToEvent = new Map(); // marker -> id

// -------------------------
// INIT CARTE
// -------------------------
function initMap() {
  if (!map) {
    map = L.map('map').setView([45.7772, 3.0870], 13); // Clermont-Ferrand
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  }
}

// -------------------------
// CHARGEMENT DES ÉVÉNEMENTS
// -------------------------
async function loadEvents() {
  const agenda = document.getElementById("agenda");
  if (!agenda) return;

  try {
    const res = await fetch("/api/events");
    const events = await res.json();

    // Remplir la liste
    agenda.innerHTML = events.map(e => `
      <div class="event" data-id="${e.id}">
        <div class="title glitch">${e.title}</div>
        <div class="date">${e.date} @ ${e.lieu}</div>
        <p>${e.description}</p>
      </div>
    `).join("");

    // Initialiser la carte
    initMap();

    // Supprimer anciens markers
    eventMarkers.forEach(marker => map.removeLayer(marker));
    eventMarkers = [];
    markerToEvent.clear();

    // Ajouter les markers et lier aux événements
    events.forEach(e => {
      if (e.lat && e.lng) {
        const marker = L.marker([e.lat, e.lng])
          .addTo(map)
          .bindPopup(`<strong>${e.title}</strong><br>${e.date} @ ${e.lieu}`);
        eventMarkers.push(marker);
        markerToEvent.set(marker, e.id);

        // Clic sur marker → highlight liste
        marker.on("click", () => {
          document.querySelectorAll("#agenda .event").forEach(ev => ev.classList.remove("highlight"));
          const el = document.querySelector(`#agenda .event[data-id="${e.id}"]`);
          if (el) el.classList.add("highlight");
        });
      }
    });

    document.querySelectorAll("#agenda .event").forEach(ev => {
  ev.addEventListener("click", () => {
    const id = ev.dataset.id;

    // Trouver le marker correspondant
    const marker = [...markerToEvent.entries()].find(([m, mid]) => String(mid) === String(id))?.[0];

    if (marker) {
      map.setView(marker.getLatLng(), 16); // zoom sur le marker
      marker.openPopup();
    }

    // Highlight sélection dans la liste
    document.querySelectorAll("#agenda .event").forEach(el => el.classList.remove("highlight"));
    ev.classList.add("highlight");
  });
});


  } catch (err) {
    console.error("Erreur chargement événements :", err);
    agenda.innerHTML = "⚠️ Erreur de connexion à l'API";
  }
}

// -------------------------
// AJOUT D'ÉVÉNEMENT
// -------------------------
const addForm = document.getElementById("addEventForm");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const newEvent = {
      title: formData.get("title"),
      date: formData.get("date"),
      lieu: formData.get("lieu"),
      lat: parseFloat(formData.get("lat")),
      lng: parseFloat(formData.get("lng")),
      description: formData.get("description")
    };

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    });

    addForm.reset();
    loadEvents();
  });
}

// -------------------------
// LOGIN ADMIN
// -------------------------
const password = "vincent";
const loginBtn = document.getElementById("loginBtn");
const adminContent = document.getElementById("adminContent");
const loginDiv = document.getElementById("login");

if (loginBtn && adminContent && loginDiv) {
  loginBtn.addEventListener("click", () => {
    const input = document.getElementById("adminPass").value;
    if (input === password) {
      loginDiv.style.display = "none";
      adminContent.style.display = "block";
      loadAdminEvents(); // charger admin après login
    } else {
      alert("Mot de passe incorrect !");
    }
  });
}

// -------------------------
// ADMIN : MODIFICATION & SUPPRESSION
// -------------------------
async function loadAdminEvents() {
  const adminList = document.getElementById("eventList");
  if (!adminList) return;

  const res = await fetch("/api/events");
  const events = await res.json();

  adminList.innerHTML = events.map(e => `
    <div class="event">
      <input type="text" value="${e.title}" data-id="${e.id}" class="titleInput">
      <input type="date" value="${e.date}" data-id="${e.id}" class="dateInput">
      <input type="text" value="${e.lieu}" data-id="${e.id}" class="lieuInput">
      <input type="number" step="0.000001" value="${e.lat || ''}" data-id="${e.id}" class="latInput">
      <input type="number" step="0.000001" value="${e.lng || ''}" data-id="${e.id}" class="lngInput">
      <input type="text" value="${e.description}" data-id="${e.id}" class="descInput">
      <button class="saveBtn" data-id="${e.id}">💾 Sauvegarder</button>
      <button class="deleteBtn" data-id="${e.id}">🗑️ Supprimer</button>
    </div>
  `).join("");

  // Sauvegarder
  document.querySelectorAll(".saveBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const title = document.querySelector(`.titleInput[data-id="${id}"]`).value;
      const date = document.querySelector(`.dateInput[data-id="${id}"]`).value;
      const lieu = document.querySelector(`.lieuInput[data-id="${id}"]`).value;
      const lat = parseFloat(document.querySelector(`.latInput[data-id="${id}"]`).value);
      const lng = parseFloat(document.querySelector(`.lngInput[data-id="${id}"]`).value);
      const description = document.querySelector(`.descInput[data-id="${id}"]`).value;

      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, lieu, lat, lng, description })
      });

      loadAdminEvents();
      loadEvents();
    });
  });

  // Supprimer
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      loadAdminEvents();
      loadEvents();
    });
  });
}

// -------------------------
// CHARGER LES ÉVÉNEMENTS AU DÉMARRAGE
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
});
