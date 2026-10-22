"""Add/update local catalog metadata for this source package. No GitHub mutations."""
from pathlib import Path
import json,hashlib,argparse
parser=argparse.ArgumentParser();parser.add_argument('--windows-verified',action='store_true');options=parser.parse_args()
root=Path(__file__).resolve().parents[1]
path='packages/ai-prompts/1.1.2/ai-prompts.toolhub-extension.json'
raw=(root/path).read_bytes();package=json.loads(raw)
catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))
row={key:package[key] for key in ['id','name','version','description','platforms','min_toolhub_version','license']}
row.update(category='page',tags=['AI','提示词','离线','Markdown','导入导出'],path=path,sha256=hashlib.sha256(raw).hexdigest(),execution_support='No execution or network. Windows WebView CRUD/import/reload checked; native Save picker needs manual verification; macOS unverified.')
if options.windows_verified:row['execution_support']='No execution or network. Windows WebView CRUD/import/reload checked; native Save picker needs manual verification; macOS unverified.'
catalog['extensions']=[r for r in catalog['extensions'] if r['id']!=package['id']]+[row]
(root/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
(root/'catalog.js').write_text('window.TOOLHUB_CATALOG='+json.dumps(catalog,ensure_ascii=False,indent=2)+';\n',encoding='utf-8',newline='\n')
(root/'SHA256SUMS.txt').write_text(''.join(r['sha256']+'  '+r['path']+'\n' for r in catalog['extensions']),encoding='utf-8',newline='\n')
print('Catalog registered:',package['id'],package['version'])
