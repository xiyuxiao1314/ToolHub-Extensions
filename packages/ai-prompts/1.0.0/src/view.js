(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const data = JSON.parse(byId('prompt-data').content.textContent);
  const categories = data.categories;
  const prompts = data.prompts;
  const library = byId('library'), grid = byId('grid'), queryInput = byId('query');
  const overlay = byId('detail-overlay'), output = byId('prompt-text');
  let category = 'all', query = '', sort = 'recommended', page = 0, pageSize = 6, current = null, returnFocus = null, noticeTimer;
  const normalize = text => String(text).normalize('NFKC').toLowerCase();
  const haystacks = new Map(prompts.map(p => [p.id, normalize([p.title,p.description,p.content,...p.tags,categories.find(c=>c.id===p.category).label].join(' '))]));
  const element = (tag, className, text) => { const node = document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node; };
  function matched(ignoreCategory=false) {
    const words = normalize(query).trim().split(/\s+/).filter(Boolean);
    const rows = prompts.filter(p => (ignoreCategory || category==='all' || p.category===category) && words.every(word=>haystacks.get(p.id).includes(word)));
    return sort==='name' ? rows.slice().sort((a,b)=>a.title.localeCompare(b.title,'zh-CN')) : rows;
  }
  function notify(text) {clearTimeout(noticeTimer);byId('notice').textContent=text;byId('notice').hidden=false;noticeTimer=setTimeout(()=>{byId('notice').hidden=true},2800);}
  function tags(p) {const box=element('div','tags');p.tags.forEach(tag=>box.append(element('span','',tag)));return box;}
  function open(p, opener) {
    current=p;returnFocus=opener||document.activeElement;
    byId('detail-title').textContent=p.title;byId('detail-category').textContent=categories.find(c=>c.id===p.category).label+' / '+p.id;
    byId('detail-description').textContent=p.description;byId('detail-tags').replaceChildren(...tags(p).children);
    byId('detail-length').textContent=Array.from(p.content).length+' 字符';output.value=p.content;output.scrollTop=0;
    byId('copy-hint').textContent='按需替换方括号里的内容。';overlay.hidden=false;library.inert=true;byId('close-detail').focus({preventScroll:true});
  }
  function close() {overlay.hidden=true;library.inert=false;current=null;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else queryInput.focus({preventScroll:true});}
  function copy(p, opener) {
    const text=element('textarea','');text.value=p.content;text.setAttribute('aria-hidden','true');text.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';document.body.append(text);text.focus({preventScroll:true});text.select();
    let copied=false;try{copied=document.execCommand('copy')}catch{}text.remove();
    if(copied){opener?.focus({preventScroll:true});notify('已复制「'+p.title+'」');return true;}
    if(current?.id!==p.id||overlay.hidden)open(p,opener);
    output.focus({preventScroll:true});output.select();byId('copy-hint').textContent='已全选，请按 Ctrl+C / Command+C 复制。';notify('请使用键盘复制已选中的提示词');return false;
  }
  function renderCategories() {
    const rows=matched(true);
    if(!byId('categories').children.length)byId('categories').append(...[{id:'all',label:'全部'},...categories].map(c=>{
      const button=element('button','',c.label);button.type='button';button.dataset.category=c.id;button.append(element('small','',''));
      button.onclick=()=>{category=c.id;page=0;render()};return button;
    }));
    [...byId('categories').children].forEach(button=>{const id=button.dataset.category;button.setAttribute('aria-pressed',String(category===id));button.querySelector('small').textContent=String(id==='all'?rows.length:rows.filter(p=>p.category===id).length)});
  }
  function render() {
    const rows=matched(), pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.max(0,Math.min(page,pages-1));
    const shown=rows.slice(page*pageSize,(page+1)*pageSize);
    grid.replaceChildren(...shown.map(p=>{
      const article=element('article','prompt-card'),group=categories.find(c=>c.id===p.category);article.style.setProperty('--cat-ink',group.color);
      const heading=element('div','card-heading');heading.append(element('span','category-mark',group.label),element('span','card-number',String(prompts.indexOf(p)+1).padStart(2,'0')));
      const title=element('h2','prompt-title',p.title);title.title=p.title;
      const description=element('p','prompt-description',p.description);description.title=p.description;
      const snippet=element('div','snippet-wrap');snippet.append(element('p','prompt-snippet',p.content.replace(/\s+/g,' ')));
      const chips=tags(p);chips.classList.add('card-tags');
      const footer=element('div','card-footer'),view=element('button','open-prompt','查看全文 ↗'),copyButton=element('button','copy-prompt','❐ 复制');
      view.type=copyButton.type='button';view.setAttribute('aria-label','查看「'+p.title+'」全文');copyButton.setAttribute('aria-label','复制「'+p.title+'」提示词');
      view.onclick=()=>open(p,view);copyButton.onclick=()=>copy(p,copyButton);footer.append(view,copyButton);article.append(heading,title,description,snippet,chips,footer);return article;
    }));
    byId('empty').hidden=rows.length!==0;grid.hidden=!rows.length;byId('results-label').textContent=(category==='all'?'全部提示词':categories.find(c=>c.id===category).label)+' · '+rows.length+' 条';
    byId('reset').hidden=category==='all'&&!query;byId('range').textContent=(rows.length?page*pageSize+1:0)+'–'+Math.min((page+1)*pageSize,rows.length)+' / '+rows.length+' 条';
    byId('page-label').textContent=(page+1)+' / '+pages+' 页';byId('previous').disabled=page===0;byId('next').disabled=page===pages-1;renderCategories();
  }
  function reset(){category='all';query='';queryInput.value='';page=0;render();queryInput.focus({preventScroll:true});}
  queryInput.addEventListener('input',()=>{query=queryInput.value;page=0;render()});
  document.querySelectorAll('[data-sort]').forEach(button=>{button.onclick=()=>{sort=button.dataset.sort;page=0;document.querySelectorAll('[data-sort]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render()};});
  byId('reset').onclick=byId('empty-reset').onclick=reset;
  byId('previous').onclick=()=>{page--;render()};byId('next').onclick=()=>{page++;render()};
  byId('close-detail').onclick=close;overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
  byId('copy-detail').onclick=event=>{if(current)copy(current,event.currentTarget)};
  document.addEventListener('keydown',event=>{
    if(!overlay.hidden){
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close()}
      if(event.key==='Tab'){
        const items=[...overlay.querySelectorAll('button,textarea')],first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }
    }else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();queryInput.focus();queryInput.select()}
  });
  const observer=new ResizeObserver(([entry])=>{
    const width=entry.contentRect.width,height=entry.contentRect.height;
    const columns=Math.max(1,Math.min(3,Math.floor((width+12)/252))),rows=Math.max(1,Math.min(3,Math.floor((height+12)/(innerHeight<650?148:172))));
    const capacity=columns*rows,anchor=page*pageSize;grid.style.setProperty('--cols',columns);grid.style.setProperty('--rows',rows);
    if(capacity!==pageSize){pageSize=capacity;page=Math.floor(anchor/pageSize);render();}
  });
  byId('library-total').textContent=prompts.length+' 条 · 6 个分类';observer.observe(byId('grid-space'));render();
})();
