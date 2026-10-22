/** Native WebView regression. Only run against an isolated QA registry/profile. */
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
const {chromium}=await import(process.env.TOOLHUB_PLAYWRIGHT_MODULE||'playwright');
const expectedRegistry=process.env.TOOLHUB_PROMPT_QA_REGISTRY;
if(!expectedRegistry)throw Error('Set TOOLHUB_PROMPT_QA_REGISTRY to the isolated test registry');
const browser=await chromium.connectOverCDP(process.env.TOOLHUB_PROMPT_QA_CDP||'http://127.0.0.1:19331');
try {
 const page=browser.contexts()[0].pages()[0];page.setDefaultTimeout(10000);
 const status=await page.evaluate(()=>window.__TAURI_INTERNALS__.invoke('rpc',{method:'status',params:{}}));
 assert.equal(path.resolve(status.registry_path).toLowerCase(),path.resolve(expectedRegistry).toLowerCase());
 assert.notEqual(path.resolve(status.registry_path).toLowerCase(),path.resolve(os.homedir(),'.toolhub/registry.sqlite').toLowerCase());
 const frame=page.frameLocator('iframe[title="AI 提示词"]');
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('th.extension-state.v1.community.ai-prompts'))?.data);
 async function open(){await page.getByRole('navigation',{name:'一级导航',exact:true}).getByRole('button',{name:'扩展中心',exact:true}).click();await page.getByLabel('筛选二级导航',{exact:true}).fill('');await page.getByRole('navigation',{name:'二级导航',exact:true}).getByRole('button',{name:'AI 提示词',exact:true}).click();await frame.locator('#add').click({trial:true})}
 const card=title=>frame.locator('.prompt-card').filter({has:frame.getByRole('heading',{name:title,exact:true})});
 const fixture='卡片直达管理验收 '+Date.now(),edited=fixture+' 已编辑';
 await page.reload();await open();const baseline=Number((await frame.locator('#library-total').textContent()).split(' ')[0]);
 await frame.locator('#add').click();await frame.getByLabel('标题',{exact:true}).fill(fixture);await frame.locator('#edit-content').fill('# 临时验收\n保持用户库外的测试数据。');await frame.locator('#save').click();await card(fixture).waitFor();assert.equal((await state()).prompts.length,baseline+1);
 // Edit directly from the card, without opening details.
 await card(fixture).getByRole('button',{name:'编辑「'+fixture+'」提示词',exact:true}).click();assert.equal(await frame.locator('#detail-overlay').isVisible(),false);await frame.getByLabel('标题',{exact:true}).fill(edited);await frame.locator('#save').click();await card(edited).waitFor();
 await page.reload();await open();await card(edited).waitFor();assert((await state()).prompts.some(p=>p.title===edited));
 const beforeDelete=await state();
 await card(edited).getByRole('button',{name:'删除「'+edited+'」提示词',exact:true}).click();assert.equal(await frame.locator('#detail-overlay').isVisible(),false);assert.deepEqual(await state(),beforeDelete,'Opening confirmation must not delete');await frame.locator('#cancel-delete').click();assert.deepEqual(await state(),beforeDelete);
 await card(edited).getByRole('button',{name:'删除「'+edited+'」提示词',exact:true}).click();await frame.locator('#confirm-delete').click();await frame.locator('#undo').waitFor();assert.equal((await state()).prompts.length,baseline);
 await frame.locator('#undo').click();await card(edited).waitFor();assert.deepEqual(await state(),beforeDelete,'Undo restores the same position/content');
 // Detail action must still delete the current record after canceling a card deletion.
 await card(edited).getByRole('button',{name:'查看「'+edited+'」全文',exact:true}).click();await frame.locator('#delete').click();await frame.locator('#confirm-delete').click();await frame.locator('#undo').waitFor();assert.equal((await state()).prompts.length,baseline);await frame.locator('#dismiss-undo').click();
 await page.reload();await open();assert(!(await state()).prompts.some(p=>p.title===edited));
 for(const [width,height] of [[1440,900],[1100,760],[900,640]]){
  await page.setViewportSize({width,height});
  await frame.locator('.prompt-card').first().getByRole('button',{name:/删除/}).click({trial:true});
  const geometry=await frame.locator('body').evaluate(()=>({scroll:document.documentElement.scrollHeight>innerHeight+1,clipped:[...document.querySelectorAll('.prompt-card')].some(card=>{const box=card.getBoundingClientRect();return [...card.querySelectorAll('.card-footer button')].some(button=>{const r=button.getBoundingClientRect();return r.left<box.left||r.right>box.right||r.top<box.top||r.bottom>box.bottom})})}));
  assert.equal(geometry.scroll,false,'Library stays paginated');assert.equal(geometry.clipped,false,'Card management actions stay in view');
 }
 console.log('PASS native card create/edit, save/reload, delete confirmation/cancel, undo, detail delete and persistent removal');
}finally{await browser.close()}
