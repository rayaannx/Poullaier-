const STORAGE_KEY = "poulailler_series_v1";

function getSeries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}
function saveSeries(series) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(series));
}
function getSerie(id) {
  return getSeries().find(s => s.id === id);
}
function updateSerie(updated) {
  const all = getSeries().map(s => s.id === updated.id ? updated : s);
  saveSeries(all);
}
function deleteSerie(id) {
  saveSeries(getSeries().filter(s => s.id !== id));
}
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}
function dayFromDate(dateString) {
  const start = new Date(dateString + "T00:00:00");
  const today = new Date();
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((now - start) / 86400000) + 1;
}
function dateForDay(entryDate, day) {
  const d = new Date(entryDate + "T00:00:00");
  d.setDate(d.getDate() + day - 1);
  return d.toISOString().slice(0,10);
}
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString + "T00:00:00").toLocaleDateString("fr-FR");
}
function totalDeaths(serie) {
  return (serie.days || []).reduce((sum,d) => sum + Number(d.deaths || 0), 0);
}
function totalFeed(serie) {
  return (serie.days || []).reduce((sum,d) => sum + Number(d.feed || 0), 0);
}
function liveCount(serie) {
  return Math.max(0, Number(serie.initialBirds) - totalDeaths(serie));
}
