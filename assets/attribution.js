// Pure helpers shared by the browser and dependency-free regression tests.
export const SOURCES = new Set(['reddit','tiktok','instagram','youtube','x','google','qr']);
const aliases = {twitter:'x', 'twitter.com':'x', 'x.com':'x', 'youtu.be':'youtube'};
const valid = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
const sourceName = value => {
  const name = String(value || '').toLowerCase();
  const normalized = aliases[name] || name;
  return SOURCES.has(normalized) ? normalized : null;
};
const mediumFor = source => source === 'qr' ? 'offline' : source === 'google' ? 'organic_search' : 'organic_social';
export function sanitizeAttribution(value) {
  if (!value || !SOURCES.has(value.source)) return null;
  return {source:value.source, medium:valid(value.medium)?value.medium:mediumFor(value.source), campaign:valid(value.campaign)?value.campaign:null};
}
export function sourceFromReferrer(referrer, origin) {
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return null;
    const host = url.hostname.toLowerCase();
    const matches = domain => host === domain || host.endsWith('.' + domain);
    if (matches('reddit.com') || matches('redd.it')) return 'reddit';
    if (matches('twitter.com') || matches('x.com') || matches('t.co')) return 'x';
    if (matches('youtube.com') || matches('youtu.be')) return 'youtube';
    if (matches('tiktok.com')) return 'tiktok';
    if (matches('instagram.com')) return 'instagram';
    if (['google.com','google.co.jp'].some(matches)) return 'google';
  } catch { /* Referrer unavailable. */ }
  return null;
}
export function resolveAttribution(search, referrer, origin, saved) {
  const params = new URLSearchParams(search);
  const explicit = sourceName(params.get('from')) || sourceName(params.get('utm_source'));
  const source = explicit || sourceFromReferrer(referrer, origin);
  if (source) return sanitizeAttribution({source,medium:explicit?params.get('utm_medium'):null,campaign:explicit?params.get('campaign')||params.get('utm_campaign'):null});
  return sanitizeAttribution(saved);
}
export function internalUrl(href, currentUrl, attribution) {
  const url = new URL(href, currentUrl), current = new URL(currentUrl), tags = sanitizeAttribution(attribution);
  if (!tags || url.origin !== current.origin || !['http:','https:'].includes(url.protocol)) return url.href;
  ['from','campaign','utm_source','utm_medium','utm_campaign'].forEach(key => url.searchParams.delete(key));
  url.searchParams.set('from', tags.source);
  url.searchParams.set('utm_source', tags.source);
  url.searchParams.set('utm_medium', tags.medium);
  if (tags.campaign) {url.searchParams.set('campaign', tags.campaign);url.searchParams.set('utm_campaign', tags.campaign);}
  return url.href;
}
export function playUrl(href, currentUrl, attribution, app, place, lang) {
  const url = new URL(href, currentUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'play.google.com' || url.pathname !== '/store/apps/details') return url.href;
  const source = sanitizeAttribution(attribution);
  const tags = {utm_source:source?.source||'springport_site',utm_medium:source?.medium||'owned',utm_campaign:source?.campaign||`${valid(app)?app:'app'}_${valid(place)?place:'site'}`,utm_content:`${lang==='en'?'en':'ja'}_${valid(place)?place:'site'}`};
  url.searchParams.set('hl', lang === 'en' ? 'en' : 'ja');
  Object.entries(tags).forEach(([key,value]) => url.searchParams.set(key,value));
  url.searchParams.set('referrer', new URLSearchParams(tags).toString());
  return url.href;
}
