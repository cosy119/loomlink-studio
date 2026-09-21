"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Step = { id: string; name: string; prompt: string; source: string; enabled: boolean };
type Draft = { name: string; steps: Step[] };
const storageKey = "loomlink:local-skill-draft:v1";
const initial: Draft = { name: "床品 Etsy 完整上架流程", steps: ["SKU 原图保真修复", "更换背景", "标题、描述与标签"].map((name,i)=>({id:String(i),name,prompt:"保持 {product_name} 的颜色、织物纹理和比例真实。",source:i ? "previous" : "original",enabled:true})) };

export function SkillDraftEditor() {
  const [draft,setDraft] = useState<Draft>(initial);
  const [active,setActive] = useState(0);
  const [ready,setReady] = useState(false);
  const [message,setMessage] = useState("");
  useEffect(()=>{
    try { const raw=localStorage.getItem(storageKey); if(raw) { const d=JSON.parse(raw); if(!d.name || !Array.isArray(d.steps) || !d.steps.length || !d.steps.every((s:Step)=>typeof s.name==="string" && typeof s.prompt==="string" && typeof s.id==="string")) throw Error(); setDraft(d); setMessage("已恢复本机草稿"); } }
    catch { setMessage("无法读取本机草稿；请勿覆盖保存，可先检查浏览器存储设置。"); }
    setReady(true);
  },[]);
  const step=draft.steps[active];
  function update(values:Partial<Step>) { setDraft(d=>({...d,steps:d.steps.map((s,i)=>i===active?{...s,...values}:s)}));setMessage("有未保存修改"); }
  function save() { try { if(!draft.name.trim() || draft.steps.some(s=>!s.name.trim())) throw Error("请填写流程名和所有步骤名称");localStorage.setItem(storageKey,JSON.stringify(draft));setMessage("已保存到当前浏览器，未上传或公开"); } catch(e) {setMessage(e instanceof Error?e.message:"保存失败，请导出备份");} }
  function exportDraft() { const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="skill-draft.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  return <div className="mx-auto max-w-6xl space-y-5"><h1 className="text-3xl font-semibold">Skill 流程编辑器</h1><p className="text-slate-300">本机草稿：可编辑、保存和导出。云端版本、发布和模型试跑尚未接通。</p>
    <label className="block">流程名称<Input aria-label="流程名称" value={draft.name} onChange={e=>{setDraft({...draft,name:e.target.value});setMessage("有未保存修改");}}/></label>
    <div className="flex flex-wrap gap-3"><Button disabled={!ready} onClick={save}>保存本机草稿</Button><Button variant="outline" onClick={exportDraft}>导出流程 JSON</Button></div><p role="status">{message}</p>
    <div className="grid gap-5 md:grid-cols-[280px_1fr]"><section className="glass rounded-xl p-4 space-y-3">{draft.steps.map((s,i)=><button className={`block w-full rounded-lg p-3 text-left ${active===i?"bg-primary/20":"bg-white/5"}`} aria-pressed={active===i} key={s.id} onClick={()=>setActive(i)}>{i+1}. {s.name}{!s.enabled && "（停用）"}</button>)}<Button onClick={()=>{setDraft(d=>({...d,steps:[...d.steps,{id:crypto.randomUUID(),name:"新步骤",prompt:"",source:"previous",enabled:true}]}));setActive(draft.steps.length);setMessage("有未保存修改");}}>添加步骤</Button></section>
    <section className="glass rounded-xl p-5 space-y-4"><label className="block">步骤名称<Input aria-label="步骤名称" value={step.name} onChange={e=>update({name:e.target.value})}/></label><label className="block">输入来源<select aria-label="输入来源" className="block p-2 bg-slate-900 border rounded-md" value={step.source} onChange={e=>update({source:e.target.value})}><option value="original">SKU 原图</option><option value="previous">上一步输出</option></select></label><label className="flex gap-2"><input type="checkbox" checked={step.enabled} onChange={e=>update({enabled:e.target.checked})}/>启用此步骤</label><label className="block">步骤提示词<Textarea aria-label="步骤提示词" className="min-h-52" value={step.prompt} onChange={e=>update({prompt:e.target.value})}/></label><div className="flex flex-wrap gap-2">{["product_name","sku_name","sku_attributes","previous_text"].map(v=><Button variant="outline" key={v} onClick={()=>update({prompt:step.prompt+` {${v}}`})}>{`{${v}}`}</Button>)}</div><Button variant="outline" disabled={draft.steps.length===1} onClick={()=>{if(!window.confirm("删除当前步骤？保存后将覆盖本机草稿。"))return;setDraft(d=>({...d,steps:d.steps.filter((_,i)=>i!==active)}));setActive(Math.max(0,active-1));setMessage("有未保存修改");}}>删除当前步骤</Button></section></div>
  </div>;
}
