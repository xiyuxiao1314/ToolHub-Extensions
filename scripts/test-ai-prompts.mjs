import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const source=new URL('../packages/ai-prompts/1.1.2/src/',import.meta.url)
vm.runInThisContext(fs.readFileSync(new URL('model.js',source),'utf8'))
const M=globalThis.PromptLibraryModel,seed=JSON.parse(fs.readFileSync(new URL('prompts.json',source),'utf8'))
const base=seed.prompts.map(p=>({...p,category:seed.categories.find(c=>c.id===p.category).label}))
for(const p of base)assert.deepEqual(M.parse(M.markdown(p),'单条.md'),[p])
const special={id:'user.test',title:'引用 "标题"',category:'我的分类',description:'<script>不会执行</script>',tags:['特殊字符','模板'],content:'# 标题\n真实换行：\n\n---\n```js\nalert("test")\n```\n\n保留末尾\n'.replaceAll('\\n','\n')}
assert.deepEqual(M.parse(M.markdown(special),'one.md'),[special])
assert.deepEqual(M.parse('\uFEFF'+M.markdown(special).replaceAll('\n','\r\n'),'one.md'),[special])
assert.deepEqual(M.parse(M.bundle([...base,special]),'all.json'),[...base,special])
const generic=M.parse('# 我的提示词\n\n正文 <img src=x onerror=alert(1)>','a.md',()=> 'user.generic')[0]
assert.equal(generic.title,'我的提示词');assert.equal(generic.content,'# 我的提示词\n\n正文 <img src=x onerror=alert(1)>')
assert.equal(M.parse('正文','无标题.md',()=> 'user.other')[0].title,'无标题')
assert.equal(M.merge(base,base).stats.skipped,48)
const changed={...base[0],content:'修改的正文'}
assert.equal(M.merge(base,[changed]).prompts[0].content,base[0].content)
assert.equal(M.merge(base,[changed],'replace').prompts[0].content,'修改的正文')
assert.equal(M.merge(base,[changed],'copy',()=> 'user.copy').prompts.length,49)
assert.equal(M.merge(base,[{...changed,id:'user.different'}],'replace').prompts[0].id,base[0].id)
assert.deepEqual(M.restore(M.state([])),[])
assert.deepEqual(M.restore(M.state([special])),[special])
for(const bad of ['{bad','{"schema":"unknown","prompts":[]}'])assert.throws(()=>M.parse(bad,'bad.json'))
assert.throws(()=>M.rows([special,special]))
assert.throws(()=>M.prompt({...special,content:' '}))
assert.throws(()=>M.prompt({...special,tags:Array(9).fill('标签')}))
assert.throws(()=>M.parse('---\ntoolhub: prompt/v1\ntitle: bad yaml\n---\ntext','bad.md'))
assert.throws(()=>M.parse('中'.repeat(700000),'large.md'))
assert.throws(()=>M.state(Array.from({length:100},(_,i)=>({...special,id:'user.'+i,content:'中'.repeat(20000)}))))
assert.throws(()=>M.merge(base,[changed],'unknown'))
console.log('PASS 48 builtin Markdown round trips, Unicode/BOM/CRLF, JSON whole-library round trip, plain text import, conflict policies, stable IDs, empty-library persistence and malformed/oversized input rejection')
