const loginBtn = document.getElementById("loginBtn");
const adminContent = document.getElementById("adminContent");
const loginDiv = document.getElementById("login");

loginBtn.addEventListener("click", async () => {
  const password = document.getElementById("adminPass").value;
  const res = await fetch("/api/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({password})})
  if (res.status === 200) {
    loginDiv.style.display = "none";      // Masquer le login
    adminContent.style.display = "block"; // Afficher le contenu admin
  } else {
    alert("Mot de passe incorrect !");
  }
});


async function loadEvents() {
  const res = await fetch("/api/events");
  const events = await res.json();

  document.getElementById("eventList").innerHTML = events.map(e => `
    <div class="event">
      <input type="text" value="${e.title}" data-id="${e.id}" class="titleInput">
      <input type="date" value="${e.date}" data-id="${e.id}" class="dateInput">
      <input type="text" value="${e.lieu}" data-id="${e.id}" class="lieuInput">
      <input type="time" value="${e.time}" data-id="${e.id}" class="timeInput">
      <input type="number" step="0.000001" value="${e.lat || ''}" data-id="${e.id}" class="latInput">
      <input type="number" step="0.000001" value="${e.lng || ''}" data-id="${e.id}" class="lngInput">
      <input type="text" value="${e.description}" data-id="${e.id}" class="descInput">
      <button class="saveBtn" data-id="${e.id}">💾 Sauvegarder</button>
      <button class="deleteBtn" data-id="${e.id}">🗑️ Supprimer</button>
    </div>
  `).join("");


  document.querySelectorAll(".saveBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const title = document.querySelector(`.titleInput[data-id="${id}"]`).value;
      const date = document.querySelector(`.dateInput[data-id="${id}"]`).value;
      const lieu = document.querySelector(`.lieuInput[data-id="${id}"]`).value;
      const time = document.querySelector(`.timeInput[data-id="${id}"]`).value;
      const lat = parseFloat(document.querySelector(`.latInput[data-id="${id}"]`).value);
      const lng = parseFloat(document.querySelector(`.lngInput[data-id="${id}"]`).value);
      const description = document.querySelector(`.descInput[data-id="${id}"]`).value;

      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, lieu, lat, lng, description })
      });

      loadEvents();
    });
  });


  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      loadEvents();
    });
  });
}

const addForm = document.getElementById("addEventForm");

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addForm);
  const newEvent = {
    title: formData.get("title"),
    date: formData.get("date"),
    lieu: formData.get("lieu"),
    time: formData.get("time"),
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


loadEvents();
