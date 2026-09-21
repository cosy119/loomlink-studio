import test from 'node:test';
import assert from 'node:assert/strict';
const root=process.env.LOOMLINK_TEST_URL||'http://127.0.0.1:8787';
const auth={'oai-authenticated-user-id':'integration-user','oai-authenticated-user-email':'integration@example.com','oai-authenticated-user-full-name':'Integration%20User','oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'};
async function request(path,init={}){for(let attempt=0;attempt<2;attempt++){const r=await fetch(root+path,{...init,headers:{...auth,...init.headers}});const text=await r.text();if(r.status===503&&text.includes('worker restarted')&&attempt===0){await new Promise(resolve=>setTimeout(resolve,150));continue}let data;try{data=JSON.parse(text)}catch{throw new Error(`${r.status}: ${text.slice(0,500)}`)}if(!data.ok)throw new Error(`${r.status}: ${data.error}`);return data.data}throw new Error('request retry exhausted')}
test('cloud skill, project and R2 asset lifecycle',async()=>{
 const skill=await request('/api/skills',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Skill',category:'Etsy bedding',definition:{steps:[{name:'Listing copy',type:'listing_text',prompt:'Write {product_name}',source:'original',enabled:true}]}})});
 assert.equal(skill.version,1);
 const next=await request(`/api/skills/${skill.id}/versions`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Skill v2',category:'Etsy bedding',definition:{steps:[{name:'Listing copy',type:'listing_text',prompt:'Write honest copy for {product_name}',source:'original',enabled:true}]}})});
 assert.equal(next.version,2);
 const published=await request(`/api/skills/${skill.id}/publish`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(published.status,'published');
 await new Promise(resolve=>setTimeout(resolve,250));
 const project=await request('/api/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Product',category:'Bedding',description:'test'})});
 const form=new FormData();form.append('file',new File([new Uint8Array([137,80,78,71,13,10,26,10])],'sku.png',{type:'image/png'}));
 const asset=await request(`/api/projects/${project.id}/assets`,{method:'POST',body:form});assert.equal(asset.filename,'sku.png');
 const duplicate=await request(`/api/projects/${project.id}/assets`,{method:'POST',body:form});assert.equal(duplicate.duplicate,true);
 const run=await request('/api/runs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({projectId:project.id,skillId:skill.id})});assert.equal(run.status,'queued');
 const detail=await request(`/api/projects/${project.id}`);assert.equal(detail.assets.length,1);assert(detail.runs.some(x=>x.id===run.id));
 const noModel=await fetch(root+`/api/runs/${run.id}/advance`,{method:'POST',headers:{...auth,'content-type':'application/json','connection':'close'},body:'{}'});assert.equal(noModel.status,409);assert.match((await noModel.json()).error,/模型设置/);
 const cancelled=await request(`/api/runs/${run.id}/cancel`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(cancelled.status,'cancelled');
 await request(`/api/assets/${asset.id}`,{method:'DELETE'});const afterDelete=await request(`/api/projects/${project.id}`);assert.equal(afterDelete.assets.length,0);
});
