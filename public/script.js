let map;
let eventMarkers = [];
let markerToEvent = new Map(); // marker -> id


function initMap() {
  if (!map) {
    map = L.map('map').setView([45.7772, 3.0870], 13); // Clermont-Ferrand
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  }
}

async function loadEvents() {
  const agenda = document.getElementById("agenda");
  if (!agenda) return;

  try {
    const res = await fetch("/api/events");
    const events = await res.json();

 
    agenda.innerHTML = events.map(e => `
      <div class="event" data-id="${e.id}">
        <div class="title glitch">${e.title}</div>
        <div class="date">${e.date} ; ${e.time}   @ ${e.lieu}</div>
        <p>${e.description}</p>
      </div>
    `).join("");

    initMap();

    eventMarkers.forEach(marker => map.removeLayer(marker));
    eventMarkers = [];
    markerToEvent.clear();

    events.forEach(e => {
      if (e.lat && e.lng) {
        const marker = L.marker([e.lat, e.lng])
          .addTo(map)
          .bindPopup(`<strong>${e.title}</strong><br>${e.date} @ ${e.lieu}`);
        eventMarkers.push(marker);
        markerToEvent.set(marker, e.id);

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

    const marker = [...markerToEvent.entries()].find(([m, mid]) => String(mid) === String(id))?.[0];

    if (marker) {
      map.setView(marker.getLatLng(), 16); 
      marker.openPopup();
    }

    document.querySelectorAll("#agenda .event").forEach(el => el.classList.remove("highlight"));
    ev.classList.add("highlight");
  });
});


  } catch (err) {
    console.error("Erreur chargement événements :", err);
    agenda.innerHTML = "⚠️ Erreur de connexion à l'API";
  }
}

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

const contactForm = document.getElementById("contactForm");
const feedback = document.getElementById("contactFeedback");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message")
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.success) {
      feedback.textContent = "✅ Message envoyé ! Merci.";
      contactForm.reset();
    } else {
      feedback.textContent = "⚠️ Une erreur est survenue, réessayez.";
    }
  } catch (err) {
    feedback.textContent = "⚠️ Une erreur est survenue, réessayez.";
  }
});


document.addEventListener("DOMContentLoaded", () => {
  loadEvents();
});


