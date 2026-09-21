const params = new URLSearchParams(location.search);
const id = params.get("id");
let serie = getSerie(id);

if (!serie) {
  alert("Série introuvable.");
  location.href = "index.html";
}

function renderSerie() {
  serie = getSerie(id);
  const currentDayRaw = dayFromDate(serie.entryDate);
  const currentDay = Math.min(50, Math.max(1, currentDayRaw));
  document.getElementById("pageTitle").textContent = "Série " + serie.number;
  document.getElementById("pageSubtitle").textContent =
    "Entrée : " + formatDate(serie.entryDate) + " • " + serie.initialBirds.toLocaleString("fr-FR") + " poussins";
  document.getElementById("currentDay").textContent = currentDayRaw > 50 ? "50 / 50" : currentDayRaw + " / 50";
  document.getElementById("liveBirds").textContent = liveCount(serie).toLocaleString("fr-FR");
  document.getElementById("deadBirds").textContent = totalDeaths(serie).toLocaleString("fr-FR");
  document.getElementById("feedTotal").textContent = totalFeed(serie).toFixed(2) + " kg";

  const alertBox = document.getElementById("seriesAlert");
  if (currentDayRaw >= 7 && currentDayRaw < 10) {
    alertBox.innerHTML = `<div class="alert"><strong>⚠️ Bientôt le 10ème jour</strong>
      Cette série est au jour ${currentDayRaw}. Prépare la prochaine série.</div>`;
  } else if (currentDayRaw === 10) {
    alertBox.innerHTML = `<div class="alert"><strong>🔔 Jour 10</strong>
      C'est le 10ème jour de cette série. Pense à suivre la prochaine série.</div>`;
  } else alertBox.innerHTML = "";

  const tbody = document.getElementById("daysTable");
  tbody.innerHTML = "";
  for (let day=1; day<=50; day++) {
    const record = (serie.days || []).find(x => x.day === day) || {deaths:0,feed:0,note:""};
    const deathsBefore = (serie.days || []).filter(x=>x.day<=day).reduce((a,x)=>a+Number(x.deaths||0),0);
    const alive = Math.max(0, serie.initialBirds - deathsBefore);
    const date = dateForDay(serie.entryDate, day);
    tbody.innerHTML += `<tr>
      <td><strong>J${day}</strong></td>
      <td>${formatDate(date)}</td>
      <td>${alive.toLocaleString("fr-FR")}</td>
      <td class="${record.deaths ? "danger" : ""}">${Number(record.deaths||0).toLocaleString("fr-FR")}</td>
      <td>${Number(record.feed||0).toFixed(2)}</td>
      <td>${escapeHtml(record.note || "")}</td>
      <td><button class="day-button" onclick="editDay(${day})">Modifier</button></td>
    </tr>`;
  }
}

function editDay(day) {
  const record = (serie.days || []).find(x => x.day === day) || {deaths:0,feed:0,note:""};
  document.getElementById("modalDay").value = day;
  document.getElementById("modalTitle").textContent = "Jour " + day;
  document.getElementById("modalDeaths").value = record.deaths || 0;
  document.getElementById("modalFeed").value = record.feed || 0;
  document.getElementById("modalNote").value = record.note || "";
  document.getElementById("dayModal").classList.remove("hidden");
}

document.getElementById("dayForm").addEventListener("submit", e => {
  e.preventDefault();
  const day = Number(document.getElementById("modalDay").value);
  const deaths = Number(document.getElementById("modalDeaths").value);
  const feed = Number(document.getElementById("modalFeed").value);
  const note = document.getElementById("modalNote").value.trim();
  serie = getSerie(id);
  const existing = (serie.days || []).findIndex(x => x.day === day);
  const record = {day,deaths,feed,note};
  if (existing >= 0) serie.days[existing] = record;
  else serie.days.push(record);
  serie.days.sort((a,b)=>a.day-b.day);
  updateSerie(serie);
  closeModal();
  renderSerie();
});

function closeModal(){document.getElementById("dayModal").classList.add("hidden")}
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("dayModal").addEventListener("click", e => {if(e.target.id==="dayModal") closeModal()});

document.getElementById("editSeriesBtn").addEventListener("click", () => {
  document.getElementById("editNumber").value = serie.number;
  document.getElementById("editDate").value = serie.entryDate;
  document.getElementById("editBirds").value = serie.initialBirds;
  document.getElementById("editPanel").classList.remove("hidden");
});
document.getElementById("cancelEdit").addEventListener("click", () => document.getElementById("editPanel").classList.add("hidden"));
document.getElementById("editForm").addEventListener("submit", e => {
  e.preventDefault();
  const number = document.getElementById("editNumber").value.trim();
  const date = document.getElementById("editDate").value;
  const birds = Number(document.getElementById("editBirds").value);
  if(!number || !date || birds<=0) return;
  const duplicate = getSeries().some(s => s.id !== id && s.number.toLowerCase() === number.toLowerCase());
  if(duplicate){alert("Ce numéro de série existe déjà.");return}
  serie.number=number; serie.entryDate=date; serie.initialBirds=birds;
  updateSerie(serie);
  document.getElementById("editPanel").classList.add("hidden");
  renderSerie();
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
renderSerie();
