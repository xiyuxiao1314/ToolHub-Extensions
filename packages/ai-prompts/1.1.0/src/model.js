/* Portable text-only data contract. No file paths, executable Markdown or network. */
(() => {
  'use strict';
  const schema='toolhub.prompts.bundle/v1', stateSchema='toolhub.prompt-library/v1';
  const bytes=value=>new TextEncoder().encode(JSON.stringify(value)).length;
  const uid=()=> 'user.'+crypto.randomUUID();
  const identity=p=>[p.category,p.title].map(s=>s.normalize('NFKC').toLowerCase()).join('\0');
  function field(value,name,max,empty=false){
    if(typeof value!=='string'||value.length>max||(!empty&&!value.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw Error(name+'格式不正确（最多 '+max+' 字）');
    return value;
  }
  function prompt(value){
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('提示词须为对象');
    const p={id:field(value.id,'ID',100),title:field(value.title,'标题',80).trim(),category:field(value.category,'分类',24).trim(),description:field(value.description??'','摘要',180,true).trim(),tags:value.tags??[],content:field(value.content,'正文',20000)};
    if(!/^[a-zA-Z0-9._-]+$/.test(p.id))throw Error('提示词 ID 格式不正确');
    if(!Array.isArray(p.tags)||p.tags.length>8)throw Error('最多 8 个标签');
    p.tags=[...new Set(p.tags.map(tag=>field(tag,'标签',24).trim()))];
    return p;
  }
  function rows(values){
    if(!Array.isArray(values)||values.length>500)throw Error('一个提示词库最多 500 条');
    const seen=new Set(),result=values.map(prompt);
    for(const p of result){if(seen.has(p.id))throw Error('提示词 ID 重复：'+p.id);seen.add(p.id)}
    return result;
  }
  function state(values){const data={schema:stateSchema,prompts:rows(values)};if(bytes(data)>1048576)throw Error('提示词库已超过 1 MiB，请先导出备份并减少内容');return data}
  function restore(value){if(value?.schema!==stateSchema)throw Error('已保存的提示词库格式无法识别，未覆盖原数据');return state(value.prompts).prompts}
  function bundle(values){return JSON.stringify({schema,prompts:rows(values)},null,2)+'\n'}
  function markdown(value){
    const p=prompt(value),lines=['---','toolhub: prompt/v1'];
    for(const key of ['id','title','category','description','tags'])lines.push(key+': '+JSON.stringify(p[key]));
    return lines.join('\n')+'\n---\n'+p.content;
  }
  function parse(text,name='导入的提示词.md',newId=uid){
    if(typeof text!=='string'||new TextEncoder().encode(text).length>2097152)throw Error('单个导入文件最多 2 MiB');
    text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    if(/\.json$/i.test(name)){
      let value;try{value=JSON.parse(text)}catch{throw Error('JSON 格式不正确')}
      if(value?.schema!==schema)throw Error('不是受支持的 ToolHub 提示词预设包');
      return rows(value.prompts);
    }
    if(!/\.(md|markdown|txt)$/i.test(name))throw Error('请选择 .md、.txt 或 ToolHub 导出的 .json 文件');
    const header=text.match(/^---\n([\s\S]*?)\n---\n/);
    if(header&&/^toolhub: prompt\/v1$/m.test(header[1])){
      const metadata={};
      for(const line of header[1].split('\n')){
        if(line==='toolhub: prompt/v1'||!line.trim())continue;
        const match=line.match(/^(id|title|category|description|tags): (.+)$/);
        if(!match||Object.hasOwn(metadata,match[1]))throw Error('ToolHub Markdown 元信息不正确');
        try{metadata[match[1]]=JSON.parse(match[2])}catch{throw Error('ToolHub Markdown 元信息不是有效 JSON 值')}
      }
      return [prompt({...metadata,content:text.slice(header[0].length)})];
    }
    const title=(text.match(/^#\s+(.+)$/m)?.[1]||name.replace(/\.(md|markdown|txt)$/i,'')).slice(0,80);
    return [prompt({id:newId(),title,category:'我的提示词',description:'',tags:[],content:text})];
  }
  function merge(existing,incoming,policy='keep',newId=uid){
    if(!['keep','replace','copy'].includes(policy))throw Error('无效的冲突处理方式');
    const result=rows(existing).map(p=>({...p,tags:[...p.tags]})),stats={added:0,replaced:0,skipped:0,conflicts:0};
    for(const p of rows(incoming)){
      const index=result.findIndex(r=>r.id===p.id||identity(r)===identity(p));
      if(index<0){result.push(p);stats.added++;continue}
      if(JSON.stringify({...result[index],id:''})===JSON.stringify({...p,id:''})){stats.skipped++;continue}
      stats.conflicts++;
      if(policy==='keep'){stats.skipped++;continue}
      if(policy==='replace'){result[index]={...p,id:result[index].id};stats.replaced++;continue}
      result.push({...p,id:newId()});stats.added++;
    }
    return {prompts:state(result).prompts,stats};
  }
  globalThis.PromptLibraryModel=Object.freeze({schema,stateSchema,uid,prompt,rows,state,restore,bundle,markdown,parse,merge,bytes});
})();
