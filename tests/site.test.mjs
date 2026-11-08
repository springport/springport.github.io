import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const apps=JSON.parse(fs.readFileSync(root+'content/apps.json'));
const files=['index.html','support/index.html',...apps.map(a=>`apps/${a.slug}/index.html`)];
const pages=files.flatMap(f=>[f,'en/'+f]);
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const origin='https://springport.github.io';
function urlFile(url){const p=decodeURIComponent(url.pathname).slice(1);return root+(p.endsWith('/')||!p?p+'index.html':p);}
test('all 18 pages and 404 have valid links, local media, headings and accessible images',()=>{
 for(const file of [...pages,'404.html']){
  const html=fs.readFileSync(root+file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
  assert.match(html,/<main id="main"/);
  for(const tag of html.matchAll(/<(?:a|img|script|link|source|video)\b[^>]*>/g)){
   const a=attrs(tag[0]);
   if(tag[0].startsWith('<img')){assert.ok('alt' in a,file);assert.ok(Number(a.width)>0&&Number(a.height)>0,file);}
   for(const value of [a.href,a.src,a.poster].filter(Boolean)){
    if(value.startsWith('mailto:'))continue;
    const url=new URL(value,origin+'/'+file.replace(/index.html$/,''));
    if(url.origin!==origin){assert.equal(url.protocol,'https:',file);continue;}
    const target=urlFile(url);assert.ok(fs.existsSync(target),`${file} → ${url.pathname}`);
    if(url.hash&&target.endsWith('.html'))assert.ok(fs.readFileSync(target,'utf8').includes(`id="${url.hash.slice(1)}"`),file+' '+url.hash);
   }
   if(tag[0].startsWith('<script')&&a.src)assert.ok(a.src.startsWith('/assets/'));
  }
 }
});
test('localized canonical, reciprocal hreflang, OGP and sitemap agree',()=>{
 const sitemap=fs.readFileSync(root+'sitemap.xml','utf8');
 assert.equal((sitemap.match(/<loc>/g)||[]).length,18);
 for(const file of pages){
  const html=fs.readFileSync(root+file,'utf8'),en=file.startsWith('en/'),p='/'+file.replace(/index.html$/,'');
  assert.ok(html.includes(`<html lang="${en?'en':'ja'}">`),file);
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${p}">`),file);
  assert.ok(sitemap.includes(`<loc>${origin}${p}</loc>`),file);
  for(const lang of ['ja','en','x-default'])assert.ok(html.includes(`hreflang="${lang}"`),file);
  const image=attrs(html.match(/<meta property="og:image"[^>]*>/)[0]).content;
  const bytes=fs.readFileSync(urlFile(new URL(image)));
  assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),630);
  assert.ok(html.includes('data-language-switch'),file);
  assert.ok(html.match(/<meta name="description" content="[^"]{30,}"/),file);
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(m[1]));
 }
 assert.match(fs.readFileSync(root+'404.html','utf8'),/name="robots" content="noindex, follow"/);
});
test('every static Play CTA targets one of the seven apps with language and matching Install Referrer tags',()=>{
 for(const file of pages){
  const html=fs.readFileSync(root+file,'utf8');
  for(const tag of html.matchAll(/<a\b[^>]*data-store[^>]*>/g)){
   const a=attrs(tag[0]),url=new URL(a.href),referrer=new URLSearchParams(url.searchParams.get('referrer'));
   assert.equal(url.hostname,'play.google.com');assert.equal(url.searchParams.get('id'),apps.find(app=>app.slug===a['data-app']).id);
   assert.equal(url.searchParams.get('hl'),file.startsWith('en/')?'en':'ja');
   for(const key of ['utm_source','utm_medium','utm_campaign','utm_content'])assert.equal(referrer.get(key),url.searchParams.get(key));
  }
 }
});
test('advertising, Search Console and Pages verification files remain byte-for-byte intact',()=>{
 const hashes={'app-ads.txt':'a36db5c2c9eaf2db058ff668f09b29dced5104d8b363bf5af5abfed5e0dd52f5','google15383816efe73253.html':'834d623b907f5071fd5409d1bb15a96b1690ece2e7dc8b59518f7e1ba758e964','.nojekyll':'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'};
 for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+file)).digest('hex'),hash,file);
 for(const file of pages.filter(p=>p.endsWith('support/index.html')))for(const a of apps)assert.ok(fs.readFileSync(root+file,'utf8').includes('/apps/'+a.policy+'"'));
});
