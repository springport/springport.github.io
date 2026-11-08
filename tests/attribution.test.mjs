import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {SOURCES,resolveAttribution,sourceFromReferrer,internalUrl,playUrl} from '../assets/attribution.js';
const origin='https://springport.github.io';
test('every existing source and Reddit survives a Japanese → English → detail journey',()=>{
 for(const source of SOURCES){
  let tags=resolveAttribution(`?from=${source}&campaign=profile_202611`,'',origin,null);
  const en=internalUrl('/en/',origin+'/',tags);
  tags=resolveAttribution(new URL(en).search,origin+'/',origin,null);
  const detail=internalUrl('/en/apps/kitchen-notes/',en,tags);
  assert.equal(new URL(detail).searchParams.get('from'),source);
  assert.equal(new URL(detail).searchParams.get('campaign'),'profile_202611');
  const play=new URL(playUrl('https://play.google.com/store/apps/details?id=com.springport.kitchennotes',detail,tags,'kitchen-notes','bottom','en'));
  assert.equal(play.searchParams.get('hl'),'en');
  assert.equal(play.searchParams.get('utm_source'),source);
  const referrer=new URLSearchParams(play.searchParams.get('referrer'));
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_content'])assert.equal(referrer.get(key),play.searchParams.get(key));
  assert.equal(referrer.get('utm_content'),'en_bottom');
 }
});
test('UTM-only input, aliases, referral hosts and priority',()=>{
 assert.equal(resolveAttribution('?utm_source=Reddit&utm_campaign=launch&utm_medium=social','',origin).campaign,'launch');
 assert.equal(resolveAttribution('?from=twitter','https://reddit.com/',origin).source,'x');
 for(const url of ['https://reddit.com/','https://www.reddit.com/r/test','https://old.reddit.com/','https://out.reddit.com/','https://redd.it/abc'])assert.equal(sourceFromReferrer(url,origin),'reddit');
 assert.equal(sourceFromReferrer('https://t.co/abc',origin),'x');
 assert.equal(sourceFromReferrer('https://reddit.com.evil.example/',origin),null);
 assert.equal(sourceFromReferrer('javascript:alert(1)',origin),null);
 assert.equal(sourceFromReferrer(origin+'/en/',origin),null);
 const saved={source:'x',medium:'organic_social',campaign:'old'};
 assert.equal(resolveAttribution('',origin+'/',origin,saved).campaign,'old');
 assert.equal(resolveAttribution('','https://reddit.com/',origin,saved).source,'reddit');
 assert.equal(resolveAttribution('?from=youtube','',origin,saved).source,'youtube');
});
test('invalid values are dropped and external links are never decorated',()=>{
 assert.equal(resolveAttribution('?from=other','',origin),null);
 const tags=resolveAttribution('?from=reddit&campaign=email%40example.com&utm_medium=%3Cscript%3E','',origin);
 assert.equal(tags.campaign,null);assert.equal(tags.medium,'organic_social');
 assert.equal(resolveAttribution('?from=x&campaign='+('a'.repeat(65)),'',origin).campaign,null);
 assert.equal(internalUrl('https://example.com/',origin,tags),'https://example.com/');
 assert.equal(playUrl('https://play.google.com.evil.example/',origin,tags,'app','home','en'),'https://play.google.com.evil.example/');
 assert.equal(new URL(internalUrl('/en/#apps',origin,tags)).hash,'#apps');
 assert.equal(new URL(playUrl('https://play.google.com/store/apps/details?id=test',origin,null,'app','detail','ja')).searchParams.get('utm_source'),'springport_site');
});
test('site initialization works when sessionStorage is blocked or corrupt',()=>{
 const code=fs.readFileSync(new URL('../assets/site.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
 for(const storage of [{getItem(){throw Error('denied')},setItem(){throw Error('denied')}},{getItem(){return '{broken'},setItem(){}}]){
  const link={href:'https://play.google.com/store/apps/details?id=test',dataset:{app:'bubble',place:'home'}};
  const context={URL,URLSearchParams,resolveAttribution,internalUrl,playUrl,sessionStorage:storage,location:{search:'?from=reddit',origin,href:origin+'/'},document:{referrer:'',documentElement:{lang:'en'},querySelectorAll(selector){return selector==='a[data-store]'?[link]:[]},querySelector(){return null}}};
  vm.runInNewContext(code,context);assert.equal(new URL(link.href).searchParams.get('utm_source'),'reddit');
 }
});
