import test from 'node:test';
import assert from 'node:assert/strict';
const root=process.env.LOOMLINK_TEST_URL||'http://127.0.0.1:8787';
const auth={'oai-authenticated-user-id':'integration-user','oai-authenticated-user-email':'integration@example.com','oai-authenticated-user-full-name':'Integration%20User','oai-authenticated-user-full-name-encoding':'percent-encoded-utf-8'};
async function request(path,init={}){const r=await fetch(root+path,{...init,headers:{...auth,...init.headers}});const data=await r.json();if(!data.ok)throw new Error(`${r.status}: ${data.error}`);return data.data;}
test('cloud skill, project and R2 asset lifecycle',async()=>{
 const skill=await request('/api/skills',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Skill',category:'Etsy bedding',definition:{steps:[{name:'Listing copy',type:'listing_text',prompt:'Write {product_name}',source:'original',enabled:true}]}})});
 assert.equal(skill.version,1);
 const next=await request(`/api/skills/${skill.id}/versions`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Skill v2',category:'Etsy bedding',definition:{steps:[{name:'Listing copy',type:'listing_text',prompt:'Write honest copy for {product_name}',source:'original',enabled:true}]}})});
 assert.equal(next.version,2);
 const published=await request(`/api/skills/${skill.id}/publish`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(published.status,'published');
 const publicSkills=await request('/api/skills/public');assert(publicSkills.some(x=>x.id===skill.id));
 const project=await request('/api/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Integration Product',category:'Bedding',description:'test'})});
 const form=new FormData();form.append('file',new File([new Uint8Array([137,80,78,71,13,10,26,10])],'sku.png',{type:'image/png'}));
 const asset=await request(`/api/projects/${project.id}/assets`,{method:'POST',body:form});assert.equal(asset.filename,'sku.png');
 const duplicate=await request(`/api/projects/${project.id}/assets`,{method:'POST',body:form});assert.equal(duplicate.duplicate,true);
 const detail=await request(`/api/projects/${project.id}`);assert.equal(detail.assets.length,1);
 const forbidden=await fetch(root+`/api/projects/${project.id}`,{headers:{...auth,'oai-authenticated-user-id':'another-user','oai-authenticated-user-email':'another@example.com'}});assert.equal(forbidden.status,404);
 const image=await fetch(root+`/api/assets/${asset.id}`,{headers:auth});assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
 await request(`/api/assets/${asset.id}`,{method:'DELETE'});const missing=await fetch(root+`/api/assets/${asset.id}`,{headers:auth});assert.equal(missing.status,404);
});
