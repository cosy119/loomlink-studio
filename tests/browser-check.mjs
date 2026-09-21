const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8787/skills/new');
 await page.getByLabel('流程名称',{exact:true}).fill('回归测试流程');
 await page.getByLabel('步骤提示词',{exact:true}).fill('第一步专用提示');
 await page.getByRole('button',{name:'2. 更换背景'}).click();
 assert.notEqual(await page.getByLabel('步骤提示词',{exact:true}).inputValue(),'第一步专用提示');
 await page.getByLabel('步骤提示词',{exact:true}).fill('第二步独立提示');
 await page.getByRole('button',{name:'保存本机草稿'}).click();
 await page.reload();
 await page.getByText('已恢复本机草稿',{exact:true}).waitFor();
 assert.equal(await page.getByLabel('流程名称',{exact:true}).inputValue(),'回归测试流程');
 assert.equal(await page.getByLabel('步骤提示词',{exact:true}).inputValue(),'第一步专用提示');
 await page.getByRole('button',{name:'2. 更换背景'}).click();
 assert.equal(await page.getByLabel('步骤提示词',{exact:true}).inputValue(),'第二步独立提示');
 await page.getByRole('link',{name:'数据清洗',exact:true}).click();
 await page.getByLabel('导入 Landrop CSV').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('listing_id,shop_name,sales,shop_age\n1,Shop,120,1 year\n1,Shop,120,1 year\n2,Other,,')});
 await page.getByRole('button',{name:'开始清洗'}).click();
 await page.getByText('2 条有效记录 · 移除 1 条重复或无效记录 · 2 家店铺').waitFor();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'下载 CSV',exact:true}).click();
 const download=await pending;const stream=await download.createReadStream();let csv='';for await(const chunk of stream)csv+=chunk.toString();assert.match(csv,/monthly_sales/);assert.match(csv,/Shop/);
 const response=await page.request.post('http://127.0.0.1:8787/api/models/test',{data:{baseUrl:'https://api.example.com/v1'}});assert.equal(response.status(),501);assert.equal((await response.json()).ok,false);
 assert.deepEqual(errors,[]);console.log('PASS: per-step prompts, persisted draft, navigation, CSV download, fail-closed API, no browser errors');
} finally {await browser.close();}
