"""Build the offline prompt extension and standalone preview; no network/runtime dependencies."""
from pathlib import Path
import json,html

folder=Path(__file__).resolve().parent
source=folder/'src'
catalog=json.loads((source/'prompts.json').read_text(encoding='utf-8'))
assert catalog['schema']=='toolhub.prompts/v1'
categories={row['id'] for row in catalog['categories']}
assert len(categories)==len(catalog['categories'])==6
ids=set()
for prompt in catalog['prompts']:
    assert prompt['id'] not in ids;ids.add(prompt['id'])
    assert prompt['category'] in categories
    assert 1<=len(prompt['title'])<=48 and 1<=len(prompt['description'])<=180
    assert 40<=len(prompt['content'])<=5000 and 1<=len(prompt['tags'])<=4
    assert all(isinstance(tag,str) and 0<len(tag)<=20 for tag in prompt['tags'])
assert len(ids)==48
package=json.loads((source/'manifest.json').read_text(encoding='utf-8'))
view=package['views'][0]
data=json.dumps(catalog,ensure_ascii=False,separators=(',',':'))
view['html']=(source/'view.html').read_text(encoding='utf-8')+'\n<template id="prompt-data">'+html.escape(data,quote=False)+'</template>'
view['css']=(source/'view.css').read_text(encoding='utf-8')
view['script']=(source/'model.js').read_text(encoding='utf-8')+'\n'+(source/'view.js').read_text(encoding='utf-8')
sizes={key:len(view[key].encode()) for key in ('html','css','script')}
assert sizes['html']<=65536 and sizes['css']<=32768 and sizes['script']<=65536,sizes
raw=(json.dumps(package,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
assert len(raw)<=262144
(folder/'ai-prompts.toolhub-extension.json').write_bytes(raw)
preview='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI 提示词 · ToolHub</title><style>'+view['css']+'</style></head><body>'+view['html']+'<script>'+view['script']+'</script></body></html>'
(folder/'preview.html').write_text(preview,encoding='utf-8',newline='\n')
print(json.dumps({'prompts':len(ids),'bytes':len(raw),**sizes},ensure_ascii=False))
