import {resolveAttribution, internalUrl, playUrl} from './attribution.js';

const storageKey = 'springport_attribution_v1';
let saved = null;
try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
const attribution = resolveAttribution(location.search, document.referrer, location.origin, saved);
if (attribution) {
  try { sessionStorage.setItem(storageKey, JSON.stringify(attribution)); } catch { /* URL propagation still works. */ }
}
const lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
document.querySelectorAll('a[data-store]').forEach(link => {
  link.href = playUrl(link.href, location.href, attribution, link.dataset.app, link.dataset.place, lang);
});
document.querySelectorAll('a[data-internal]').forEach(link => {
  link.href = internalUrl(link.href, location.href, attribution);
});
const filters = document.querySelector('.filters');
if (filters) {
  const cards = Array.from(document.querySelectorAll('#apps .app-card'));
  const status = document.querySelector('#filter-status');
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    filters.querySelectorAll('button').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    if (status) status.textContent = lang === 'en' ? `Showing ${count} ${count === 1 ? 'app' : 'apps'}.` : `${count}件のアプリを表示しています。`;
  });
}
