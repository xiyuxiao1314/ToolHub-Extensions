/** Serve only the generated offline preview; no RPC, disk browsing or network relay. */
import http from 'node:http'
import fs from 'node:fs'
import {fileURLToPath} from 'node:url'
const file=fileURLToPath(new URL('../packages/ai-prompts/1.1.0/preview.html',import.meta.url))
const port=Number(process.env.TOOLHUB_PROMPT_PREVIEW_PORT||19344)
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local preview port')
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:'+port)
 if(req.method!=='GET'||!['/','/preview.html','/sandbox'].includes(url.pathname)){res.writeHead(404).end();return}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff')
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-src 'self'; base-uri 'none'; form-action 'none'")
 if(url.pathname==='/sandbox'){
  const width=Number(url.searchParams.get('width')||0),height=Number(url.searchParams.get('height')||0)
  const size=width>=320&&width<=1600&&height>=360&&height<=1200?`width:min(${Math.floor(width)}px,100vw);height:min(${Math.floor(height)}px,100dvh)`:'width:100%;height:100%'
  res.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI 提示词 · 隔离预览</title><style>html,body{margin:0;height:100%;overflow:hidden}body{display:grid;place-items:center;background:#e8ede7}iframe{display:block;border:0;'+size+'}</style></head><body><iframe title="AI 提示词" sandbox="allow-scripts" src="/preview.html"></iframe></body></html>')
 }
 else res.end(fs.readFileSync(file))
})
server.listen(port,'127.0.0.1',()=>console.log(`AI prompts preview: http://127.0.0.1:${port}/sandbox`))
