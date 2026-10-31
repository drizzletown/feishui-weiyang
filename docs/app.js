(()=>{
 const key='feishui-reader-v1', data=(()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}})();
 const root=document.documentElement;
 const setTheme=(v)=>{root.dataset.theme=v;data.theme=v;save()};
 const setFont=(v)=>{data.font=Math.max(15,Math.min(26,v));root.style.setProperty('--font',data.font+'px');save()};
 function save(){try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
 if(data.theme)root.dataset.theme=data.theme;
 if(data.font)root.style.setProperty('--font',data.font+'px');
 document.getElementById('theme-btn')?.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));
 document.getElementById('font-up')?.addEventListener('click',()=>setFont((data.font||19)+1));
 document.getElementById('font-down')?.addEventListener('click',()=>setFont((data.font||19)-1));
 const chapter=document.body.dataset.chapter;
 if(chapter){
  data.lastChapter=chapter;save();
  const prog=document.getElementById('reading-progress');
  let pending=false;
  function update(){const h=document.documentElement.scrollHeight-window.innerHeight;const ratio=h?Math.max(0,Math.min(1,window.scrollY/h)):1; if(prog)prog.style.width=(ratio*100)+'%';data.positions=data.positions||{};data.positions[chapter]=Math.round(ratio*10000)/10000;save();pending=false}
  window.addEventListener('scroll',()=>{if(!pending){pending=true;window.requestAnimationFrame(update)}},{passive:true});
  document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.key==='ArrowLeft'){const a=document.querySelector('a[data-prev]');if(a)location.href=a.href}if(e.key==='ArrowRight'){const a=document.querySelector('a[data-next]');if(a)location.href=a.href}});
  update();
 }
 const resume=document.getElementById('continue-reading');
 if(resume && data.lastChapter){resume.href='chapters/'+data.lastChapter+'.html';resume.hidden=false}
 const srch=document.getElementById('site-search'), results=document.getElementById('results');
 if(srch && results){
  let corpusPromise=null;
  const load=()=>corpusPromise||(corpusPromise=(async()=>{
    const rows=[];
    // Split fetching into short batches rather than publishing an all-in-one novel JSON.
    for(let k=1;k<=75;k+=8){
      const ids=Array.from({length:Math.min(8,76-k)},(_,i)=>k+i);
      const batch=await Promise.all(ids.map(async(n)=>{
        const id=String(n).padStart(3,'0');
        const res=await fetch('chapters/'+id+'.html');
        if(!res.ok)return null;
        const markup=await res.text();
        const doc=new DOMParser().parseFromString(markup,'text/html');
        const prose=doc.querySelector('article.prose');
        const title=doc.querySelector('.reader-head h1')?.textContent||'';
        const meta=window.FS_META?.chapters?.[n-1];
        return {id,title,volume:meta?.volume_title||'',title_en:meta?.title_en||'',text:prose?.textContent||''};
      }));
      rows.push(...batch.filter(Boolean));
    }
    return rows;
  })());
  let serial=0;
  srch.addEventListener('input',async()=>{
   const val=srch.value.trim(),my=++serial;
   if(val.length<2){results.textContent='至少输入两个字进行全文检索。';return}
   results.textContent='正在检索章节…… / Searching chapters…';
   try{const rows=await load();if(my!==serial)return;const matched=[];
    rows.forEach(row=>{const at=row.text.toLowerCase().indexOf(val.toLowerCase());if(at>=0||row.title.includes(val)||(row.title_en||'').toLowerCase().includes(val.toLowerCase()))matched.push({...row,at})});
    results.textContent='';const total=document.createElement('p');total.textContent=`找到 ${matched.length} 章匹配结果`;results.append(total);
    matched.slice(0,75).forEach(row=>{const a=document.createElement('a');a.href='chapters/'+row.id+'.html';const h=document.createElement('strong');h.textContent=document.documentElement.dataset.readerMode==='en'?row.title_en:row.volume+' · '+row.title;a.append(h);const d=document.createElement('small');let start=Math.max(0,row.at-42);d.textContent=row.at>=0?'……'+row.text.slice(start,row.at+val.length+85)+'……':'标题匹配';a.append(d);results.append(a)})
   }catch(e){corpusPromise=null;results.textContent='检索暂不可用，请稍后重试或通过卷目阅读。'}
  });
 }
})();