(() => {
  'use strict';
  const byId=id=>document.getElementById(id), M=PromptLibraryModel, seed=JSON.parse(byId('prompt-data').content.textContent);
  const builtin=seed.categories.map(c=>({...c,id:c.label}));
  let prompts=seed.prompts.map(p=>({...p,category:seed.categories.find(c=>c.id===p.category).label})),categories=[];
  const library=byId('library'),grid=byId('grid'),queryInput=byId('query'),overlay=byId('detail-overlay'),manager=byId('manage-overlay'),output=byId('prompt-text');
  let category='all',categoryOffset=0,categoryKey='',query='',sort='recommended',page=0,pageSize=6,current=null,returnFocus=null,manageFocus=null,noticeTimer,revision=0,ready=false,busy=false,editing=null,editorInitial='',discard=false,incoming=[],importPage=0,policy='keep',deleted=null,pendingDelete=null;
  const normalize=text=>String(text).normalize('NFKC').toLowerCase();
  const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
  const group=p=>categories.find(c=>c.id===p.category)||{label:p.category,color:'#647a66'};
  function notify(text){clearTimeout(noticeTimer);byId('notice').textContent=text;byId('notice').hidden=false;noticeTimer=setTimeout(()=>byId('notice').hidden=true,3500)}
  function error(text){byId('manage-error').textContent=text;byId('manage-error').hidden=!text}
  function matched(ignoreCategory=false){const words=normalize(query).trim().split(/\s+/).filter(Boolean);const rows=prompts.filter(p=>(ignoreCategory||category==='all'||p.category===category)&&words.every(w=>normalize([p.title,p.description,p.content,...p.tags,p.category].join(' ')).includes(w)));return sort==='name'?rows.slice().sort((a,b)=>a.title.localeCompare(b.title,'zh-CN')):rows}
  function tags(p){const node=element('div','tags');p.tags.forEach(t=>node.append(element('span','',t)));return node}
  function renderCategories(){
    const next=[...builtin,...[...new Set(prompts.map(p=>p.category))].filter(id=>!builtin.some(c=>c.id===id)).map(id=>({id,label:id,color:'#647a66'}))];
    const changed=categories.map(c=>c.id).join('\0')!==next.map(c=>c.id).join('\0');categories=next;
    if(!categories.some(c=>c.id===category)&&category!=='all')category='all';
    if(categoryOffset>=categories.length)categoryOffset=0;
    const shown=categories.slice(categoryOffset,categoryOffset+6),key=shown.map(c=>c.id).join('\0');
    if(changed||categoryKey!==key||!byId('categories').children.length){categoryKey=key;byId('categories').replaceChildren(...[{id:'all',label:'全部'},...shown].map(c=>{const b=element('button','',c.label);b.type='button';b.dataset.category=c.id;b.append(element('small','',''));b.onclick=()=>{category=c.id;page=0;render()};return b}));if(categories.length>6){const more=element('button','','更多分类 →');more.type='button';more.onclick=()=>{categoryOffset=categoryOffset+6>=categories.length?0:categoryOffset+6;render()};byId('categories').append(more)}}
    const rows=matched(true);[...byId('categories').querySelectorAll('[data-category]')].forEach(b=>{b.setAttribute('aria-pressed',String(category===b.dataset.category));b.querySelector('small').textContent=String(b.dataset.category==='all'?rows.length:rows.filter(p=>p.category===b.dataset.category).length)});
  }
  function render(){
    renderCategories();const rows=matched(),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.max(0,Math.min(page,pages-1));
    grid.replaceChildren(...rows.slice(page*pageSize,(page+1)*pageSize).map(p=>{
      const card=element('article','prompt-card'),heading=element('div','card-heading');card.style.setProperty('--cat-ink',group(p).color);
      heading.append(element('span','category-mark',p.category),element('span','card-number',String(prompts.indexOf(p)+1).padStart(2,'0')));
      const title=element('h2','prompt-title',p.title);title.title=p.title;const description=element('p','prompt-description',p.description);description.title=p.description;
      const snippet=element('div','snippet-wrap');snippet.append(element('p','prompt-snippet',p.content.replace(/\s+/g,' ')));
      const chips=tags(p);chips.classList.add('card-tags');const footer=element('div','card-footer'),view=element('button','open-prompt','查看'),copyButton=element('button','copy-prompt','❐ 复制');
      view.type=copyButton.type='button';view.setAttribute('aria-label','查看「'+p.title+'」全文');copyButton.setAttribute('aria-label','复制「'+p.title+'」提示词');view.onclick=()=>open(p,view);copyButton.onclick=()=>copy(p,copyButton);
      const cardActions=element('div','card-actions'),editButton=element('button','card-action','编辑'),deleteButton=element('button','card-action card-delete','删除');
      for(const [button,action] of [[editButton,'编辑'],[deleteButton,'删除']]){button.type='button';button.disabled=!ready||busy;button.setAttribute('aria-label',action+'「'+p.title+'」提示词')}
      editButton.onclick=()=>edit(p);deleteButton.onclick=()=>requestDelete(p);cardActions.append(view,editButton,deleteButton);footer.append(cardActions,copyButton);card.append(heading,title,description,snippet,chips,footer);return card;
    }));
    byId('library-total').textContent=prompts.length+' 条 · 本机提示词库';byId('empty').hidden=rows.length!==0;grid.hidden=!rows.length;
    byId('results-label').textContent=(category==='all'?'全部提示词':category)+' · '+rows.length+' 条';byId('reset').hidden=category==='all'&&!query;
    byId('range').textContent=(rows.length?page*pageSize+1:0)+'–'+Math.min((page+1)*pageSize,rows.length)+' / '+rows.length+' 条';byId('page-label').textContent=page+1+' / '+pages+' 页';byId('previous').disabled=page===0;byId('next').disabled=page===pages-1;
    ['add','import','export-all'].forEach(id=>byId(id).disabled=!ready||busy);byId('export-all').disabled||=prompts.length===0;
  }
  function open(p,opener){current=p;returnFocus=opener||document.activeElement;byId('detail-title').textContent=p.title;byId('detail-category').textContent=p.category;byId('detail-description').textContent=p.description;byId('detail-tags').replaceChildren(...tags(p).children);byId('detail-length').textContent=Array.from(p.content).length+' 字符';output.value=p.content;output.scrollTop=0;byId('copy-hint').textContent='按需替换方括号里的内容。';overlay.hidden=false;library.inert=true;byId('close-detail').focus({preventScroll:true})}
  function close(){overlay.hidden=true;library.inert=false;current=null;(returnFocus?.isConnected?returnFocus:queryInput).focus({preventScroll:true})}
  function copy(p,opener){const node=element('textarea','');node.value=p.content;node.setAttribute('aria-hidden','true');node.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';document.body.append(node);node.focus({preventScroll:true});node.select();let ok=false;try{ok=document.execCommand('copy')}catch{}node.remove();if(ok){opener?.focus({preventScroll:true});notify('已复制「'+p.title+'」');return}if(overlay.hidden)open(p,opener);output.focus();output.select();byId('copy-hint').textContent='已全选，请按 Ctrl+C / Command+C 复制。'}
  function showManager(panel,title){manageFocus=document.activeElement;byId('manage-title').textContent=title;['editor','import-panel','delete-panel'].forEach(id=>byId(id).hidden=id!==panel);manager.hidden=false;overlay.inert=true;library.inert=true;error('');byId('close-manage').focus({preventScroll:true})}
  function editorValue(){return {id:editing||M.uid(),title:byId('edit-title').value,category:byId('edit-category').value,description:byId('edit-description').value,tags:byId('edit-tags').value.split(/[,，]/).map(v=>v.trim()).filter(Boolean),content:byId('edit-content').value}}
  const editorDraft=()=>['title','category','description','tags','content'].map(k=>byId('edit-'+k).value).join('\0');
  function closeManager(force=false){if(busy)return;if(!force&&!byId('editor').hidden&&editorDraft()!==editorInitial&&!discard){discard=true;error('有尚未保存的更改。再次关闭将放弃本次更改。');return}manager.hidden=true;pendingDelete=null;overlay.inert=false;library.inert=!overlay.hidden;error('');(manageFocus?.isConnected?manageFocus:queryInput).focus({preventScroll:true})}
  function edit(p=null){editing=p?.id||null;showManager('editor',p?'编辑提示词':'新增提示词');for(const key of ['title','category','description','content'])byId('edit-'+key).value=p?.[key]??(key==='category'?'我的提示词':'');byId('edit-tags').value=p?.tags.join(', ')||'';editorInitial=editorDraft();discard=false;updateLength();byId('edit-title').focus()}
  function updateLength(){byId('edit-length').textContent=byId('edit-content').value.length+' / 20,000'}
  async function commit(next){
    if(!ready||busy)throw Error('提示词库尚未就绪或正在保存');const snapshot=M.state(next);busy=true;render();byId('save').disabled=byId('confirm-import').disabled=byId('confirm-delete').disabled=true;
    manager.inert=true;try{if(globalThis.toolhub?.storage){const saved=await toolhub.storage.set(snapshot,revision);revision=saved.revision}prompts=snapshot.prompts;render()}
    finally{manager.inert=false;busy=false;byId('save').disabled=byId('confirm-import').disabled=byId('confirm-delete').disabled=false;render()}
  }
  function finish(){closeManager(true);if(!overlay.hidden)close();render()}
  async function exportText(name,text){
    if(busy)return;busy=true;render();try{
      if(globalThis.toolhub?.files){const saved=await toolhub.files.exportText(name,text);notify(saved?'已导出文件':'已取消导出，内容未改变')}
      else if(globalThis.toolhub)throw Error('导出文件需要 ToolHub beta.8 或更高版本');
      else{const a=element('a','');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('浏览器已收到导出请求')}
    }catch(e){notify('导出失败：'+e.message)}finally{busy=false;render()}
  }
  const filename=p=>(p.title.replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,55)||'提示词')+'.md';
  function previewImport(){
    const count=Math.max(1,Math.ceil(incoming.length/4));importPage=Math.max(0,Math.min(importPage,count-1));const result=M.merge(prompts,incoming,policy);
    byId('import-summary').textContent='已读取 '+incoming.length+' 条提示词，确认后才写入本机。';byId('import-effect').textContent='新增 '+result.stats.added+' · 覆盖 '+result.stats.replaced+' · 跳过 '+result.stats.skipped;
    byId('import-list').replaceChildren(...incoming.slice(importPage*4,(importPage+1)*4).map(p=>{const row=element('div','import-row');row.append(element('strong','',p.title),element('span','',p.category+' · '+p.content.length+' 字符'));return row}));
    byId('import-page').textContent=importPage+1+' / '+count;byId('import-prev').disabled=importPage===0;byId('import-next').disabled=importPage===count-1;document.querySelectorAll('[data-conflict]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.conflict===policy)));
  }
  byId('add').onclick=()=>edit();byId('import').onclick=()=>byId('import-files').click();byId('export-all').onclick=()=>exportText('toolhub-prompts.json',M.bundle(prompts));
  byId('import-files').onchange=async event=>{
    const files=[...event.target.files];event.target.value='';if(!files.length||busy||!ready)return;busy=true;render();
    try{if(files.length>50||files.reduce((n,f)=>n+f.size,0)>2097152)throw Error('每批最多 50 个文件、合计 2 MiB');const rows=[];for(const file of files){if(file.size>2097152)throw Error(file.name+' 超过 2 MiB');let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer())}catch{throw Error(file.name+' 不是 UTF-8 文本')}try{rows.push(...M.parse(text,file.name))}catch(e){throw Error(file.name+'：'+e.message)}}incoming=M.rows(rows);if(!incoming.length)throw Error('文件中没有提示词');policy='keep';importPage=0;showManager('import-panel','导入预览');byId('confirm-import').disabled=true;previewImport();byId('confirm-import').disabled=false}
    catch(e){if(!manager.hidden)error(e.message);else notify('导入失败：'+e.message)}finally{busy=false;render()}
  };
  document.querySelectorAll('[data-conflict]').forEach(b=>b.onclick=()=>{policy=b.dataset.conflict;try{error('');previewImport();byId('confirm-import').disabled=false}catch(e){error(e.message);byId('confirm-import').disabled=true}});
  byId('import-prev').onclick=()=>{importPage--;previewImport()};byId('import-next').onclick=()=>{importPage++;previewImport()};
  byId('confirm-import').onclick=async()=>{try{await commit(M.merge(prompts,incoming,policy).prompts);finish();notify('已导入并保存到本机')}catch(e){error('导入未保存：'+e.message)}};
  byId('save').onclick=async()=>{try{const p=M.prompt(editorValue()),next=editing?prompts.map(row=>row.id===editing?p:row):[p,...prompts];await commit(next);finish();notify(globalThis.toolhub?'已保存到本机':'演示已更新（刷新后重置）')}catch(e){error('未保存：'+e.message)}};
  byId('editor').oninput=()=>{discard=false;error('');updateLength()};byId('close-manage').onclick=()=>closeManager();byId('cancel-delete').onclick=()=>closeManager(true);
  const actions=element('div','detail-actions');for(const [id,label]of [['edit','编辑'],['export-one','导出 .md'],['delete','删除']]){const b=element('button','small-button',label);b.id=id;b.type='button';actions.append(b)}byId('prompt-text').before(actions);
  byId('edit').onclick=()=>current&&edit(current);byId('export-one').onclick=()=>current&&exportText(filename(current),M.markdown(current));byId('delete').onclick=()=>current&&requestDelete(current);
  function requestDelete(p){if(!ready||busy)return;showManager('delete-panel','删除提示词');pendingDelete=p;byId('delete-message').textContent='删除「'+p.title+'」？';byId('cancel-delete').focus()}
  byId('confirm-delete').onclick=async()=>{if(!pendingDelete)return;try{const p=pendingDelete,index=prompts.findIndex(row=>row.id===p.id);await commit(prompts.filter(row=>row.id!==p.id));deleted={prompt:p,index};finish();byId('undo-bar').hidden=false;byId('undo').focus()}catch(e){error('删除未保存：'+e.message)}};
  byId('undo').onclick=async()=>{if(!deleted||busy)return;try{const next=[...prompts];if(next.some(p=>p.id===deleted.prompt.id))throw Error('同 ID 已存在，请先核对');next.splice(Math.min(deleted.index,next.length),0,deleted.prompt);await commit(next);deleted=null;byId('undo-bar').hidden=true;notify('已恢复提示词');queryInput.focus()}catch(e){notify('撤销失败：'+e.message)}};
  byId('dismiss-undo').onclick=()=>{deleted=null;byId('undo-bar').hidden=true;queryInput.focus()};
  function reset(){category='all';query='';queryInput.value='';page=0;render();queryInput.focus({preventScroll:true})}
  queryInput.oninput=()=>{query=queryInput.value;page=0;render()};document.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{sort=b.dataset.sort;page=0;document.querySelectorAll('[data-sort]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));render()});
  byId('reset').onclick=byId('empty-reset').onclick=reset;byId('previous').onclick=()=>{page--;render()};byId('next').onclick=()=>{page++;render()};byId('close-detail').onclick=()=>{if(!busy)close()};overlay.onclick=event=>{if(event.target===overlay&&!busy)close()};byId('copy-detail').onclick=event=>current&&copy(current,event.currentTarget);
  document.addEventListener('keydown',event=>{
    const active=!manager.hidden?manager:!overlay.hidden?overlay:null;
    if(active){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(!busy){if(active===manager)closeManager();else close()}}
      if(event.key==='Tab'){const items=[...active.querySelectorAll('button,input,textarea')].filter(el=>!el.disabled&&el.getClientRects().length),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
    }else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();queryInput.focus();queryInput.select()}
  });
  new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect,columns=Math.max(1,Math.min(3,Math.floor((width+12)/252))),rows=Math.max(1,Math.min(3,Math.floor((height+12)/(innerHeight<650?148:172)))),capacity=columns*rows,anchor=page*pageSize;grid.style.setProperty('--cols',columns);grid.style.setProperty('--rows',rows);if(capacity!==pageSize){pageSize=capacity;page=Math.floor(anchor/pageSize);render()}}).observe(byId('grid-space'));
  async function load(){try{if(globalThis.toolhub?.storage){const saved=await toolhub.storage.get();revision=saved.revision;if(saved.data!==null)prompts=M.restore(saved.data)}else{document.querySelector('.offline').textContent='演示模式 · 刷新后重置'}ready=true;render()}catch(e){byId('load-error').hidden=false;byId('load-error').textContent='无法读取本机提示词：'+e.message+'。请重新打开页面后重试。';ready=false;render()}}
  render();void load();
})();
