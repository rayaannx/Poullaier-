const form = document.getElementById("seriesForm");
const list = document.getElementById("seriesList");
const entryDate = document.getElementById("entryDate");
entryDate.value = new Date().toISOString().slice(0,10);

function showAlerts(series) {
  const alerts = document.getElementById("alerts");
  const near = series.filter(s => {
    const d = dayFromDate(s.entryDate);
    return d >= 7 && d < 10;
  });
  if (!near.length) { alerts.innerHTML = ""; return; }
  alerts.innerHTML = near.map(s => {
    const d = dayFromDate(s.entryDate);
    return `<div class="alert"><strong>⚠️ Série ${escapeHtml(s.number)} : bientôt le 10ème jour</strong>
      Elle est actuellement au jour ${d}/50. Il reste ${10-d} jour(s). Pense à préparer la prochaine série.</div>`;
  }).join("");
}

function render() {
  const series = getSeries();
  let birds=0,deaths=0,feed=0;
  series.forEach(s => {birds += liveCount(s); deaths += totalDeaths(s); feed += totalFeed(s);});
  document.getElementById("totalSeries").textContent = series.length;
  document.getElementById("totalBirds").textContent = birds.toLocaleString("fr-FR");
  document.getElementById("totalDeaths").textContent = deaths.toLocaleString("fr-FR");
  document.getElementById("totalFeed").textContent = feed.toFixed(2) + " kg";
  showAlerts(series);

  if (!series.length) {
    list.innerHTML = `<div class="empty">Aucune série pour le moment.<br>Ajoute ta première série ci-dessus.</div>`;
    return;
  }
  list.innerHTML = series.map(s => {
    const day = dayFromDate(s.entryDate);
    const current = Math.min(50, Math.max(1, day));
    const pct = Math.min(100, Math.max(0, current/50*100));
    return `<article class="series-card">
      <h3>🐔 Série ${escapeHtml(s.number)}</h3>
      <div class="series-meta">
        <div class="meta"><small>Entrée</small><strong>${formatDate(s.entryDate)}</strong></div>
        <div class="meta"><small>Jour</small><strong>${day > 50 ? "Terminé" : day + " / 50"}</strong></div>
        <div class="meta"><small>Vivants</small><strong>${liveCount(s).toLocaleString("fr-FR")}</strong></div>
        <div class="meta"><small>Aliment</small><strong>${totalFeed(s).toFixed(2)} kg</strong></div>
      </div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="card-footer">
        <button class="primary" onclick="openSerie('${s.id}')">Voir la série</button>
        <button class="danger-outline" onclick="removeSerie('${s.id}')">Supprimer</button>
      </div>
    </article>`;
  }).join("");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const number = document.getElementById("seriesNumber").value.trim();
  const date = entryDate.value;
  const initialBirds = Number(document.getElementById("initialBirds").value);
  if (!number || !date || initialBirds <= 0) return;

  const series = getSeries();
  if (series.some(s => s.number.toLowerCase() === number.toLowerCase())) {
    alert("Ce numéro de série existe déjà.");
    return;
  }
  series.push({id:makeId(), number, entryDate:date, initialBirds, days:[]});
  saveSeries(series);
  form.reset();
  entryDate.value = new Date().toISOString().slice(0,10);
  render();
});

function openSerie(id) {
  location.href = "serie.html?id=" + encodeURIComponent(id);
}
function removeSerie(id) {
  const s = getSerie(id);
  if (s && confirm("Supprimer définitivement la série " + s.number + " ?")) {
    deleteSerie(id); render();
  }
}
document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (getSeries().length && confirm("Supprimer toutes les séries ?")) {
    saveSeries([]); render();
  }
});
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
render();
