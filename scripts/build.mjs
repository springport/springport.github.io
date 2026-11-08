import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const apps=JSON.parse(await fs.readFile(root+'content/apps.json','utf8'));
const social=JSON.parse(await fs.readFile(root+'content/social.json','utf8'));
const media=JSON.parse(await fs.readFile(root+'content/media.json','utf8'));
const origin='https://springport.github.io';
const policyRoot='https://sites.google.com/view/springportprivacycenter/%E3%83%9B%E3%83%BC%E3%83%A0/apps/';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=(lang,ja,en)=>lang==='ja'?ja:en;
const base=lang=>lang==='ja'?'/':'/en/';
const pathFor=(lang,slug)=>base(lang)+(slug?`apps/${slug}/`:'');
const categories={all:['すべて','All apps'],unwind:['眺める・占う','Unwind & explore'],solo:['ひとりで遊ぶ','Play solo'],together:['みんなで遊ぶ','Play together'],cook:['料理する','Cook']};
const cat=(lang,key)=>categories[key][lang==='ja'?0:1];
const storeLink=(a,lang,place)=>{
 const tags=new URLSearchParams({utm_source:'springport_site',utm_medium:'owned',utm_campaign:`${a.slug}_${place}`,utm_content:`${lang}_${place}`});
 const url=new URL('https://play.google.com/store/apps/details');
 url.search=new URLSearchParams({id:a.id,hl:lang,...Object.fromEntries(tags),referrer:tags.toString()});
 return url.href;
};
const cta=(a,lang,place,primary=true)=>`<a class="${primary?'button primary':'store-link'}" data-store data-app="${a.slug}" data-place="${place}" href="${esc(storeLink(a,lang,place))}" aria-label="${esc(t(lang,`${a.ja.name}をGoogle Playで見る`,`View ${a.en.name} on Google Play`))}">${t(lang,'Google Playで見る','View on Google Play')} <span aria-hidden="true">↗</span></a>`;
const language=(a,lang)=>a.language==='ja-published'?t(lang,'ゲーム内テキスト：日本語','Game text: Japanese'):t(lang,'日本語・英語に対応（端末の言語設定）','Japanese & English UI · follows device language');
function head({lang,path,title,description,share='springport',schema,alternate=true,noindex=false}){
 const jaPath=path.replace(/^\/en\//,'/');const enPath='/en'+jaPath;
 const image=`${origin}/assets/share/${lang==='en'?'en/':''}${share}.png`;
 return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex?'<meta name="robots" content="noindex, follow">':''}
  <link rel="canonical" href="${origin}${path}">
  ${alternate?`<link rel="alternate" hreflang="ja" href="${origin}${jaPath}">
  <link rel="alternate" hreflang="en" href="${origin}${enPath}">
  <link rel="alternate" hreflang="x-default" href="${origin}${jaPath}">`:''}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${origin}${path}">
  <meta property="og:site_name" content="SpringPort">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="${esc(title)}">
  <meta property="og:locale" content="${lang==='ja'?'ja_JP':'en_US'}">
  ${alternate?`<meta property="og:locale:alternate" content="${lang==='ja'?'en_US':'ja_JP'}">`:''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${esc(title)}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/site.css">
  <script type="module" src="/assets/site.js"></script>
  ${schema?`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`:''}
</head>`;
}
function header(lang,path){
 const other=lang==='ja'?'/en'+path:path.replace(/^\/en\//,'/');
 return `<body><a class="skip" href="#main">${t(lang,'本文へ移動','Skip to content')}</a>
<header class="site-header"><div class="wrap header-inner">
  <a data-internal class="wordmark" href="${base(lang)}" aria-label="${t(lang,'SpringPort トップ','SpringPort home')}">SpringPort<span aria-hidden="true">.</span></a>
  <nav aria-label="${t(lang,'メインナビゲーション','Main navigation')}">
    <a data-internal href="${base(lang)}#apps">${t(lang,'アプリ一覧','Apps')}</a>
    <a data-internal href="${base(lang)}support/">${t(lang,'サポート','Support')}</a>
    <a class="language-switch" data-internal data-language-switch href="${other}" lang="${lang==='ja'?'en':'ja'}" hreflang="${lang==='ja'?'en':'ja'}" aria-label="${t(lang,'Read this page in English','このページを日本語で読む')}">${t(lang,'English','日本語')}</a>
  </nav>
</div></header>`;
}
function footer(lang){return `<footer class="site-footer"><div class="wrap footer-inner">
<div><a data-internal class="wordmark" href="${base(lang)}">SpringPort<span aria-hidden="true">.</span></a><p>${t(lang,'遊ぶ。眺める。毎日を、ちょっと楽しく。','Small apps for playful, everyday moments.')}</p></div>
<div><div class="footer-links"><a data-internal href="${base(lang)}#apps">${t(lang,'アプリ一覧','Apps')}</a><a data-internal href="${base(lang)}support/">${t(lang,'お問い合わせ・プライバシー','Support & privacy')}</a></div>
<nav class="social-links" aria-label="${t(lang,'公式SNS','Official social profiles')}">${social.map(s=>`<a href="${esc(s.url)}" rel="me noopener" aria-label="${esc(`${s.name} ${s.handle}`)}">${s.name} <span aria-hidden="true">↗</span></a>`).join('')}</nav><p>© 2026 SpringPort</p></div>
</div></footer></body></html>`;}
function card(a,lang,place='home'){
 const c=a[lang];return `<article class="app-card" style="--app:${a.color};--soft:${a.soft}" data-category="${a.category}">
  <div class="card-top"><span class="eyebrow">${cat(lang,a.category)}</span><img class="app-icon" src="/assets/${a.slug}-icon.webp" alt="" width="104" height="104" loading="lazy"></div>
  <h3><a data-internal href="${pathFor(lang,a.slug)}">${esc(c.name)}</a></h3>
  <p class="card-line">${esc(c.line)}</p><p class="card-copy">${esc(c.description)}</p>
  ${lang==='en'&&a.language==='ja-published'?'<p class="language-note">Game text: Japanese</p>':''}
  <div class="card-links"><a data-internal class="detail-link" href="${pathFor(lang,a.slug)}" aria-label="${esc(t(lang,`${c.name}の紹介を見る`,`Explore ${c.name}`))}">${t(lang,'紹介を見る','Explore the app')} <span aria-hidden="true">→</span></a>${cta(a,lang,place,false)}</div>
</article>`;
}
async function write(path,html){const file=root+(path.endsWith('/')?path.slice(1)+'index.html':path.slice(1));await fs.mkdir(file.slice(0,file.lastIndexOf('/')),{recursive:true});await fs.writeFile(file,html.replace(/[ \t]+$/gm,'')+'\n');}
async function home(lang){
 const path=base(lang);const title=t(lang,'SpringPort｜遊びと暮らしのAndroidアプリ','SpringPort | Android apps for everyday moments');
 const description=t(lang,'夜の水族館、60秒のバブルゲーム、まもにゃのパズル、声量バトル、夕飯選び。SpringPortの7つのAndroidアプリから、今日の気分に合うひとつを。','A quiet aquarium, quick games, guardian-cat puzzles and help deciding dinner. Explore seven Android apps by SpringPort and find your next everyday favorite.');
 const schema={'@context':'https://schema.org','@type':'Organization',name:'SpringPort',url:origin+path,sameAs:social.map(s=>s.url)};
 const featured=apps.find(a=>a.slug==='kitchen-notes');
 await write(path,head({lang,path,title,description,schema})+header(lang,path)+`<main id="main">
<section class="hero wrap"><div class="hero-copy"><p class="eyebrow">ANDROID APPS BY SPRINGPORT</p>
  <h1>${t(lang,'遊ぶ、眺める、料理する。<br>今日の気分に、<br><span class="accent">ぴったりのひとつ。</span>','A little play.<br>A quiet moment.<br><span class="accent">Something for your day.</span>')}</h1>
  <p class="hero-description">${t(lang,'夜の水槽でひと休み。60秒だけスコアに挑戦。<br>今日の夕飯を決めるのも、もっと気軽に。<br>7つのアプリから、あなたの「好き」を見つけよう。','Unwind by an aquarium. Chase a score in 60 seconds.<br>Or make deciding dinner a little easier.<br>Find your moment among seven small apps.')}</p>
  <a class="button primary" href="#apps">${t(lang,'7つのアプリを見る','Explore all 7 apps')} <span aria-hidden="true">↓</span></a>
  <p class="micro">${t(lang,'Android向け・Google Playで配信中・広告を含みます','For Android · Available on Google Play · Contains ads')}</p>
</div><div class="hero-art" aria-label="${t(lang,'気になるアプリの紹介へ','Choose an app to explore')}"><div class="orbit-ring" aria-hidden="true"></div>
${apps.map((a,i)=>`<a data-internal class="mosaic-tile tile-${i}" href="${pathFor(lang,a.slug)}" aria-label="${esc(a[lang].name)}"><img src="/assets/${a.slug}-icon.webp" alt="" width="160" height="160" ${i>2?'loading="lazy"':''}></a>`).join('\n')}
<span class="art-caption">${t(lang,'ひとりでも。みんなでも。','A little time, well spent.')}</span></div></section>
<section class="spotlight wrap" aria-labelledby="spotlight-title"><div><p class="eyebrow">KITCHEN NOTES</p><h2 id="spotlight-title">${t(lang,'家にある食材から、今日の夕飯へ。','What’s in the kitchen? What’s for dinner?')}</h2><p>${esc(featured[lang].description)}</p></div><a data-internal class="button secondary" href="${pathFor(lang,featured.slug)}">${t(lang,'キッチンノートを見る','Explore Kitchen Notes')} <span aria-hidden="true">→</span></a></section>
<section class="apps-section" id="apps"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">FIND YOUR NEXT FAVORITE</p><h2>${t(lang,'今日は、何をしよう。','What would you like to do?')}</h2></div><p>${t(lang,'楽しみ方も、使う場面も、それぞれ。<br>気になるアプリから、のぞいてみてください。','A different kind of fun in every app.<br>Take a look at the one that catches your eye.')}</p></div>
<div class="filters" role="group" aria-label="${t(lang,'アプリを用途で絞り込む','Filter apps by activity')}" hidden>${Object.keys(categories).map((key,i)=>`<button type="button" data-filter="${key}" aria-pressed="${i===0}" class="${i===0?'active':''}">${cat(lang,key)}${i===0?' <span>7</span>':''}</button>`).join('')}</div><p id="filter-status" class="sr-only" role="status" aria-live="polite"></p>
<div class="app-grid">${apps.map(a=>card(a,lang)).join('\n')}</div>
<p class="listing-note">${t(lang,'各アプリは広告を含みます。対応端末・提供内容・最新の配信情報はGoogle Playでご確認ください。','All apps contain ads. Check Google Play for device compatibility, current features and availability. Individual app languages are noted on their detail pages.')}</p>
</div></section><section class="closing wrap"><p class="eyebrow">SMALL APPS. EVERYDAY MOMENTS.</p><h2>${t(lang,'ちょっとした時間に、<br>ちょっと好きなことを。','Make a little room<br>for something you enjoy.')}</h2><p>${t(lang,'SpringPortは、遊びや暮らしに寄り添うAndroidアプリを制作しています。','SpringPort creates Android apps for playful breaks, quiet moments and everyday life.')}</p><a data-internal class="detail-link" href="${base(lang)}support/">${t(lang,'サポート・お問い合わせ','Support & contact')} <span aria-hidden="true">→</span></a></section></main>`+footer(lang));
}
async function detail(a,lang){
 const c=a[lang],path=pathFor(lang,a.slug),title=`${c.storeName} | SpringPort`;
 const schema={'@context':'https://schema.org','@graph':[{'@type':'SoftwareApplication',name:c.storeName,operatingSystem:'Android',url:origin+path,downloadUrl:`https://play.google.com/store/apps/details?id=${a.id}&hl=${lang}`,image:`${origin}/assets/${a.slug}-icon.webp`,description:c.description,publisher:{'@type':'Organization',name:'SpringPort'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'SpringPort',item:origin+base(lang)},{'@type':'ListItem',position:2,name:c.name,item:origin+path}]}]};
 const demo=a.slug==='night-aquarium';
 const art=demo?`<figure class="demo-art"><video controls muted playsinline preload="none" poster="/assets/night-aquarium-demo.jpg" width="540" height="894" aria-label="${t(lang,'公開版の夜の水槽を映した16秒の実機録画','A 16-second screen recording of the released aquarium')}" aria-describedby="demo-caption"><source src="/assets/night-aquarium-demo.mp4" type="video/mp4">${t(lang,'動画を再生できません。下の紹介画像をご覧ください。','Your browser cannot play this video. See the images below.')}</video><figcaption id="demo-caption">${t(lang,'夜の水槽を、実際のアプリで。','See the aquarium in the actual app.')}<small>${t(lang,'公開版1.0.13・2026年11月の実機録画（日本語画面）。<br>集めた生き物によって、水槽の様子は変わります。','Released version 1.0.13, recorded in November 2026 (Japanese UI).<br>Your aquarium depends on the creatures you have collected.')}</small></figcaption><a href="#screenshots" class="detail-link">${t(lang,'おみくじ・図鑑の画面を見る','See fortune & collection screens')} ↓</a></figure>`:`<div class="detail-art"><img src="/assets/${a.slug}-icon.webp" alt="${esc(t(lang,`${c.name}のアイコン`,`${c.name} icon`))}" width="240" height="240"><p>${esc(c.name)}</p></div>`;
 const imageCaption=t(lang,'画像をタップすると拡大できます。','Select an image to enlarge it.');
 const gallery=[1,2].map(i=>{
  const path=`assets/${a.slug}-${lang}-shot-${i}.webp`, image=media.assets.find(m=>m.path===path);
  const caption=image.sourceType==='device-capture'?t(lang,'実機画面・1.1.7（日本語）','Actual app screen · v1.1.7 · Japanese UI'):t(lang,'Google Play公式掲載画像','Official Google Play image')+(lang==='en'&&image.screenLanguage==='ja'?' · Japanese text':'');
  return `<figure><a href="/${path}" aria-label="${esc(t(lang,`${c.name}の紹介画像${i}を拡大`,`Enlarge ${c.name} image ${i}`))}"><img src="/${path}" width="${image.width}" height="${image.height}" loading="lazy" alt="${esc(t(lang,`${c.name}の${i===1?'紹介・プレイ':'機能・操作'}画面`,`${c.name}: ${i===1?'overview and play':'features and controls'}`))}"></a><figcaption>${caption} · ${i}/2</figcaption></figure>`;
 }).join('');
 await write(path,head({lang,path,title,description:c.description,share:a.slug,schema})+header(lang,path)+`<main id="main" style="--app:${a.color};--soft:${a.soft}">
<section class="detail-hero wrap"><a data-internal class="back-link" href="${base(lang)}#apps">← ${t(lang,'アプリ一覧','All apps')}</a><div class="detail-hero-grid"><div><div class="app-identity"><img src="/assets/${a.slug}-icon.webp" alt="" width="48" height="48"><p class="app-name">${esc(c.name)}</p></div><p class="eyebrow">${cat(lang,a.category)} · ANDROID APP</p><h1>${esc(c.line)}</h1><p class="hero-description">${esc(c.description)}</p>${cta(a,lang,'detail')}<p class="micro">${t(lang,'Android向け・広告を含みます','For Android · Contains ads')}</p><p class="language-note">${language(a,lang)}</p></div>${art}</div></section>
<section class="detail-body wrap"><div class="section-heading"><div><p class="eyebrow">WHAT YOU CAN DO</p><h2>${t(lang,'こんな楽しみ方ができます。','Find your favorite part.')}</h2></div></div><div class="feature-grid">${c.features.map(([title,body],i)=>`<article class="feature"><span class="feature-number" aria-hidden="true">0${i+1}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('')}</div>
<div class="howto"><div><p class="eyebrow">GET STARTED</p><h2>${t(lang,'まずは、ここから。','A few steps to get started.')}</h2><ol>${c.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="notice">${esc(c.note)}</p></div><div><h3>${t(lang,'気になったら、スマホで。','Ready to try it?')}</h3><p class="card-copy">${t(lang,'Google Playで最新の紹介や対応端末を確認し、そのままインストールへ進めます。','See the latest listing and check compatibility with your Android device, then install from Google Play.')}</p>${cta(a,lang,'howto')}</div></div>
<section class="screenshots" id="screenshots" aria-labelledby="screenshots-title"><p class="eyebrow">TAKE A CLOSER LOOK</p><h2 id="screenshots-title">${t(lang,'アプリの画面を見る','Take a closer look')}</h2><p class="notice">${imageCaption}</p><div class="screenshot-grid">${gallery}</div></section>
<div class="download-panel"><div><h2>${t(lang,`${esc(c.name)}を、あなたのスマホに。`,`Make room for ${esc(c.name)}.`)}</h2><p class="micro">${t(lang,'Google Play掲載名：','Listed on Google Play as: ')}${esc(c.storeName)}</p></div>${cta(a,lang,'bottom')}</div>
<div class="detail-meta"><a href="${policyRoot}${a.policy}" rel="noopener">${t(lang,'このアプリのプライバシーポリシー','Privacy policy')} ↗</a><a data-internal href="${base(lang)}support/">${t(lang,'お問い合わせ','Contact support')}</a><p>${t(lang,'対応端末や提供内容の詳細は、Google Playの最新情報をご確認ください。','For current availability, features and compatibility, check Google Play.')}</p></div>
<section class="related"><p class="eyebrow">ALSO BY SPRINGPORT</p><h2>${t(lang,'こちらも、のぞいてみませんか。','Something else to explore')}</h2><div class="app-grid">${a.related.map(slug=>card(apps.find(x=>x.slug===slug),lang,'related')).join('')}</div></section></section></main>`+footer(lang));
}
async function support(lang){
 const path=base(lang)+'support/',title=t(lang,'サポート・プライバシー｜SpringPort','Support & privacy | SpringPort'),description=t(lang,'SpringPortのAndroidアプリに関するお問い合わせと、各アプリのプライバシーポリシー。','Contact SpringPort for help with our Android apps and find each app’s privacy policy.');
 await write(path,head({lang,path,title,description})+header(lang,path)+`<main id="main" class="support wrap"><p class="eyebrow">SUPPORT</p><h1>${t(lang,'サポート・お問い合わせ','How can we help?')}</h1><p class="hero-description">${t(lang,'不具合のご連絡、ご質問、ご意見はこちらへ。','Questions, feedback or something not working? Get in touch by email.')}</p><a class="button primary" href="mailto:springport_yh@outlook.jp">${t(lang,'メールで問い合わせる','Email SpringPort')} ↗</a><p><a href="mailto:springport_yh@outlook.jp">springport_yh@outlook.jp</a></p><p class="support-hint">${t(lang,'アプリ名・アプリのバージョン・端末名・Androidのバージョン・発生した状況を添えてください。パスワードなどの認証情報は送らないでください。','Please include the app name and version, your device, Android version, and what happened. Do not send passwords or other sign-in information.')}</p><h2>${t(lang,'アプリごとのプライバシーポリシー','App privacy policies')}</h2>${lang==='en'?'<p class="notice">These policies open on our external privacy site. The page language may vary.</p>':''}<ul class="policy-list">${apps.map(a=>`<li><a href="${policyRoot}${a.policy}" rel="noopener">${esc(a[lang].name)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>
<h2>${t(lang,'アプリの言語について','About app languages')}</h2><p>${t(lang,'このサイトは日本語・英語でご覧いただけます。アプリ本体の対応言語は各紹介ページに記載しています。Google Playの表示言語と、アプリ内の言語は別の設定です。','This website is available in Japanese and English. App languages are listed on each detail page. The language of a Google Play listing does not determine the language inside an app.')}</p>
<h2>${t(lang,'このサイトについて','About this website')}</h2><p>${t(lang,'SpringPortの公式アプリ紹介サイトです。独自のアクセス解析タグ、広告タグ、お問い合わせフォームは設置していません。Google Playや外部サイトへの移動後は、移動先の方針が適用されます。','This is SpringPort’s official app website. It has no analytics tags, advertising tags or contact forms. When you follow a link to Google Play or another site, that site’s policies apply.')}</p><p>${t(lang,'Google Playへのリンクには、SNSなどの流入元を識別するキャンペーン情報を付けています。対応する流入元とキャンペーン情報のみを、同じタブでの閲覧中に引き継ぐためsessionStorageへ保存します。保存を利用できない場合もURLで可能な範囲で引き継ぎます。サイトから解析サーバーへの送信は行いません。','Links to Google Play carry campaign tags to distinguish sources such as social profiles. Supported source and campaign identifiers are kept in sessionStorage for navigation within the same tab. If storage is unavailable, links carry the tags where possible. This website sends no analytics events to a server.')}</p><p>Google Play ${t(lang,'はGoogle LLCの商標です。','is a trademark of Google LLC.')}</p></main>`+footer(lang));
}
for(const lang of ['ja','en']){await home(lang);await support(lang);for(const a of apps)await detail(a,lang);}
const paths=['/','/support/',...apps.map(a=>`/apps/${a.slug}/`)];
await fs.writeFile(root+'sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${paths.flatMap(path=>[path,'/en'+path].map(p=>`  <url><loc>${origin}${p}</loc><xhtml:link rel="alternate" hreflang="ja" href="${origin}${path}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}/en${path}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${path}"/></url>`)).join('\n')}\n</urlset>\n`);
await write('/404.html',head({lang:'ja',path:'/404.html',title:'ページが見つかりません / Page not found | SpringPort',description:'SpringPortのアプリ一覧へ / Explore SpringPort apps.',alternate:false,noindex:true})+`<body><main id="main" class="support wrap"><a data-internal class="wordmark" href="/">SpringPort.</a><p class="eyebrow">404</p><h1>ページが見つかりませんでした。</h1><p lang="en">This page could not be found. Explore our apps from the home page.</p><p><a data-internal class="button primary" href="/">日本語のトップへ →</a></p><p><a data-internal class="button secondary" href="/en/" lang="en">Explore apps in English →</a></p></main></body></html>`);
console.log('Built 18 localized pages, bilingual 404 and sitemap.');
