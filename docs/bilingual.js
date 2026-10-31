/* Chinese, English, and parallel reading modes. */
(()=>{'use strict';
const M=window.FS_META;if(!M)return;
const store='feishui-reader-language-v1';let savedMode='zh';try{savedMode=localStorage.getItem(store)||'zh'}catch{};let mode=(new URLSearchParams(location.search).get('lang')||savedMode);if(!['zh','en','both'].includes(mode))mode='zh';
const all=M.chapters;const doc=document;const byId=n=>doc.getElementById(n);const chapterID=Number(doc.body.dataset.chapter||0);const chapter=chapterID?all[chapterID-1]:null;
let curated=null,translated=[];
const enTitle=n=>all[n-1]?.title_en||'';
const langStrings={
 '书阁':'Home','卷目':'Contents','检索':'Search','跳到正文':'Skip to content',
 '六卷七十五章':'Six Volumes · 75 Chapters','六卷书目':'The Six Volumes','共 75 章':'75 Chapters',
 '全书目录':'Contents','展开完整章目':'Full Contents','从第一章开始 →':'Start Reading →',
 '继续上次阅读 →':'Continue Reading →',
 '作者：细雨邻家 · 六卷七十五章':'By Xiyu Linjia (drizzletown) · Six Volumes · 75 Chapters',
 '六卷七十五章 · 历史传奇长篇小说':'An Alternate-History Epic in Six Volumes',
 '淝水东流，未央未央。':'The Fei flows east; the story is not yet done.',
 '版权与阅读声明':'Copyright and Reading Notice',
 '本站为架空历史文学作品，不应视为史实记录。无广告，无用户追踪。':'Alternate-history fiction, not a historical record. No advertising or tracking.',
 '《淝水未央》· 作者：细雨邻家（drizzletown）· 版权所有 · ':'The Fei River, Unending · © Xiyu Linjia (drizzletown) · ',
 '至少输入两个字进行全文检索。':'Enter at least two letters or Chinese characters to search.',
 '正在检索……':'Searching…','一诺经年，山河未定。':'A promise through the years. A realm still unsettled.'
};
function bilingual(el,zh,en,kind='text'){
 if(!el)return;
 if(el.dataset.originalZh===undefined){el.dataset.originalZh=zh;el.dataset.originalEn=en}
 if(kind==='html'){el.innerHTML=mode==='zh'?zh:mode==='en'?en:zh+'<span class="en-small">'+en+'</span>'}
 else{el.textContent=mode==='zh'?zh:mode==='en'?en:zh+' · '+en}
}
const originals=new WeakMap();
function label(el,en){if(!el)return;let z=originals.get(el);if(z===undefined){z=el.textContent.trim();originals.set(el,z)}bilingual(el,z,en)}
function setLangLabels(){
 doc.documentElement.lang=mode==='en'?'en':'zh-CN';doc.documentElement.dataset.readerMode=mode;
 const brand=doc.querySelector('.brand');if(brand){const t=brand.firstChild;if(t?.nodeType===3)t.textContent=mode==='en'?'The Fei River, Unending':'淝水未央';const sub=brand.querySelector('small');if(sub)sub.textContent=mode==='zh'?'细雨邻家 著 · 六卷七十五章':mode==='en'?'By Xiyu Linjia (drizzletown) · 75 Chapters':'细雨邻家 著 / By Xiyu Linjia'}
 doc.querySelectorAll('.top-nav a').forEach(a=>{const f=a.getAttribute('href')||'';label(a,f.endsWith('index.html')?'Home':f.endsWith('contents.html')?'Contents':'Search')});
 const skip=doc.querySelector('.skip');label(skip,'Skip to content');
 doc.querySelectorAll('.footer > div').forEach((node,i)=>{if(i===0)label(node,'The Fei flows east; the tale remains unfinished.');if(i===2)label(node,'A work of alternate-history fiction, not a historical record. No ads or tracking.')});
 const foot=doc.querySelector('.footer > div:nth-child(2)');if(foot){const a=foot.querySelector('a');if(a)label(a,'Copyright / Rights Reserved')}
 doc.querySelectorAll('.volcard').forEach((card,i)=>{const h=card.querySelector('h3'),v=M.volumes[i],zh=all.find(x=>x.volume===i+1)?.volume_title; if(h)label(h,v);const foot=card.querySelector('.foot');if(foot){const nums=[10,11,14,14,13,13];label(foot,`${nums[i]} chapters · Volume ${i+1}`)}});
 doc.querySelectorAll('.toc-vol').forEach((sec,i)=>{const h=sec.querySelector('h2');label(h,`Volume ${i+1} · ${M.volumes[i]}`)});
 doc.querySelectorAll('.chaplist a, .sidebar li a').forEach(a=>{const match=a.getAttribute('href')?.match(/(\d{3})\.html/);if(!match)return;const n=Number(match[1]);const meta=all[n-1];if(!meta)return;const slot=a.querySelector('span')||a;let zh=`第${meta.chapter}章　${meta.title}`;if(slot.closest('.sidebar'))zh=`第${meta.chapter}章　${meta.title}`;label(slot,`Chapter ${meta.chapter} · ${meta.title_en}`)});
 doc.querySelectorAll('.sidebar summary').forEach((node,i)=>label(node,`Volume ${i+1} · ${M.volumes[i]}`));
 if(chapter){
  const h=doc.querySelector('.reader-head h1');label(h,`Chapter ${chapter.chapter} · ${chapter.title_en}`);
  if(h&&mode==='both'){
   h.textContent='';const zh=doc.createElement('span'),en=doc.createElement('span');
   zh.className='chapter-title-zh';en.className='chapter-title-en';
   zh.textContent=`第${chapter.chapter}章　${chapter.title}`;
   en.textContent=`Chapter ${chapter.chapter} · ${chapter.title_en}`;
   h.append(zh,en)
  }
  const cr=doc.querySelector('.reader-head .crumbs');label(cr,`Volume ${chapter.volume} · ${chapter.volume_title_en} / Book Chapter ${chapter.id}`);
  const sh=doc.querySelector('.sidebar h2');label(sh,'Six Volumes · 75 Chapters');
  doc.querySelectorAll('.reader-nav a').forEach(a=>{let mm=a.getAttribute('href')?.match(/(\d{3})\.html/);if(mm)label(a,`${a.hasAttribute('data-prev')?'← Previous':'Next →'} · ${enTitle(Number(mm[1]))}`)});
  if(doc.title)doc.title=`${mode==='en'?chapter.title_en:chapter.title} · ${mode==='en'?'The Fei River, Unending':'淝水未央'}`;
 }
 const home=doc.querySelector('.hero .subtitle');label(home,'An Alternate-History Epic · By Xiyu Linjia');
 const hero=doc.querySelector('.hero h1');label(hero,'The Fei River, Unending');const byline=doc.querySelector('.book-byline');if(byline){byline.textContent=mode==='en'?'By Xiyu Linjia (drizzletown)':mode==='both'?'作者：细雨邻家 / By Xiyu Linjia (drizzletown)':'作者：细雨邻家 · drizzletown'}
 const intro=doc.querySelector('.intro');if(intro){if(intro.closest('main')?.querySelector('.hero')){
  let en='<span>Across decades, a promise shapes an empire.</span><span>An alternate history of the Fei River: rulers, soldiers, old loyalties, and ordinary lives.</span><span>Read the complete novel in Chinese or English, chapter by chapter.</span>';
  let cn='<span>一诺经年，山河未定。</span><span>一个从淝水分岔的历史故事，一部关于君臣、故国、军旅与普通人命运的长篇小说。</span><span>中文与英文均可逐章阅读。</span>';
  intro.innerHTML=mode==='zh'?cn:mode==='en'?en:cn+'<span class="en-small">'+en+'</span>';intro.classList.add('language-intro')
 } else {label(intro,'Six volumes, seventy-five chapters. Select any chapter to begin reading.')}}
 doc.querySelectorAll('.section-head h2').forEach(el=>label(el,'The Six Volumes'));
 doc.querySelectorAll('.section-head small').forEach(el=>label(el,'75 Chapters'));
 const mainH=doc.querySelector('main.page > h1');if(mainH){
   const text=mainH.dataset.originalZh||mainH.textContent;
   if(text.includes('目录'))label(mainH,'Contents');
   else if(text.includes('检索'))label(mainH,'Full-text Search');
   else if(text.includes('版权'))label(mainH,'Copyright and Reading Notice');
   else {const v=(location.pathname.match(/volumes\/(\d{2})\.html/)||[])[1];if(v)label(mainH,`Volume ${Number(v)} · ${M.volumes[Number(v)-1]}`)}
  }
  const volumePath=location.pathname.match(/volumes\/(\d{2})\.html/);
  if(volumePath){const n=Number(volumePath[1]);const para=doc.querySelector('main.page > .intro');label(para,`Volume ${n} of 6 · ${all.filter(x=>x.volume===n).length} chapters`)}
  if(location.pathname.endsWith('/search.html')){const para=doc.querySelector('.intro');label(para,'Search all 75 chapters by Chinese text or English chapter title. Searches are performed locally in your browser.')}
  if(location.pathname.endsWith('/copyright.html')){doc.querySelectorAll('.legal-en').forEach(x=>x.hidden=mode==='zh');doc.querySelectorAll('.legal-cn').forEach(x=>x.hidden=mode==='en')}
  doc.querySelectorAll('.chaplist em').forEach((el)=>{const txt=el.textContent;const mm=(txt.match(/\d+/)||[])[0];if(mm)label(el,`Book Chapter ${mm}`)})
 doc.querySelectorAll('.linkline a').forEach(a=>{let href=a.getAttribute('href')||'';if(a.id==='continue-reading')label(a,'Continue Reading →');else if(href.includes('001.html'))label(a,'Start Reading →');else if(href.includes('contents.html'))label(a,'Full Contents');else if(href.includes('guide.html'))label(a,'Reader’s Guide')});
 doc.querySelectorAll('.searchrow input').forEach(el=>el.placeholder=mode==='en'?'Search Chinese text or English chapter titles…':'检索中文正文或英文章题……');
 let sb=byId('site-search');if(sb)sb.setAttribute('aria-label',mode==='en'?'Search book':'检索全书');
 doc.querySelectorAll('[data-mode-choice]').forEach(el=>{const active=el.dataset.modeChoice===mode;el.setAttribute('aria-pressed',active?'true':'false')});
}
function buildToggle(){const tools=doc.querySelector('.mast .tools');if(!tools)return;const group=doc.createElement('div');group.className='language-toggle';group.setAttribute('role','group');group.setAttribute('aria-label','阅读语言 / Reading language');for(const [key,lbl] of [['zh','中文'],['en','EN'],['both','对照']]){const b=doc.createElement('button');b.type='button';b.dataset.modeChoice=key;b.textContent=lbl;b.title={'zh':'只读中文','en':'Read in English','both':'逐段中英对照'}[key];b.addEventListener('click',()=>changeMode(key));group.append(b)}tools.prepend(group)}
function makeParagraphs(){if(!chapter)return;const article=doc.querySelector('article.prose');if(!article)return;for(const [i,p] of [...article.querySelectorAll(':scope > p')].entries()){
 const cell=doc.createElement('div');cell.className='bilingual-paragraph';cell.dataset.p=i;const zh=p;p.classList.add('bilingual-zh');zh.lang='zh-Hans';const eng=doc.createElement('p');eng.className='bilingual-en';eng.lang='en';eng.hidden=true;cell.append(zh,eng);article.append(cell)}
}
async function loadCurated(){
 if(!chapter)return null;
 try{
  const r=await fetch('../data/english/'+String(chapter.id).padStart(3,'0')+'.json');
  if(!r.ok)return null;
  const x=await r.json();
  if(x.source_sha256!==chapter.sha256 || !Array.isArray(x.paragraphs) || x.paragraphs.length!==document.querySelectorAll('.bilingual-paragraph').length || x.paragraphs.some(v=>typeof v!=='string'||!v.trim()))return null;
  return x;
 }catch{return null}
}
async function readTranslations(){
 if(!chapter)return;
 translated=[];
 curated=await loadCurated();
 if(curated){translated=curated.paragraphs.slice();}
 drawTranslations();
}
function drawTranslations(){
 doc.querySelectorAll('.bilingual-paragraph').forEach((cell,i)=>{
  const en=cell.querySelector('.bilingual-en'),t=translated[i];
  en.textContent=t||'';en.hidden=!(t&&mode!=='zh');cell.classList.toggle('has-en',!!t);
 });
 doc.documentElement.dataset.readerMode=mode;
}
function changeMode(next){
 if(!['zh','en','both'].includes(next))return;
 mode=next;
 try{localStorage.setItem(store,mode)}catch{}
 setLangLabels();drawTranslations();
}
// Reading modes use locally hosted English paragraphs.
buildToggle();makeParagraphs();setLangLabels();
if(chapter){readTranslations()}
})();
