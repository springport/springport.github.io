(()=>{'use strict';
 const params=new URLSearchParams(location.search),source=params.get('from'),campaign=params.get('campaign');
 const sources=new Set(['tiktok','instagram','youtube','x','google','qr']);
 if(sources.has(source)){
  document.querySelectorAll('a[data-store]').forEach(a=>{const u=new URL(a.href),c=campaign&&/^[a-zA-Z0-9_-]{1,64}$/.test(campaign)?campaign:`${a.dataset.app}_${a.dataset.place}`;const tags={utm_source:source,utm_medium:source==='qr'?'offline':source==='google'?'organic_search':'organic_social',utm_campaign:c};Object.entries(tags).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set('referrer',new URLSearchParams(tags).toString());a.href=u.href;});
  document.querySelectorAll('a[data-internal]').forEach(a=>{const u=new URL(a.href);if(u.origin!==location.origin)return;u.searchParams.set('from',source);if(campaign&&/^[a-zA-Z0-9_-]{1,64}$/.test(campaign))u.searchParams.set('campaign',campaign);a.href=u.href;});
 }
 const filters=document.querySelector('.filters');if(!filters)return;filters.hidden=false;
 const cards=Array.from(document.querySelectorAll('#apps .app-card'));
 filters.addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;filters.querySelectorAll('button').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});let count=0;cards.forEach(c=>{c.hidden=b.dataset.filter!=='all'&&c.dataset.category!==b.dataset.filter;if(!c.hidden)count++;});document.querySelector('#filter-status').textContent=`${count}件のアプリを表示しています。`;});
})();
