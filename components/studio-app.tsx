"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkillDraftEditor } from "@/components/skill-draft-editor";
import { AppWindow, Boxes, ChevronRight, CircleUserRound, Database, Download, ImagePlus, Layers3, Library, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, Star, Upload, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { parseCsv, exportCsv } from "@/lib/csv";
import { cleanLandropRows } from "@/lib/landrop";

function Link({href,className,children,...props}:{href:string;className?:string;children:React.ReactNode;[key:string]:unknown}){
  return <a href={href} className={className} {...props}>{children}</a>;
}

export type StudioView="workspace"|"skill-editor"|"skill-market"|"model-market"|"datasets"|"project"|"profile"|"models"|"skill-detail";
const baseSteps=["SKU 原图保真修复","更换卧室场景背景","视觉分析与属性提取","标题、描述与标签","定价建议","生成 Etsy 上架包"];
const nav=[["/workspace","工作台",AppWindow],["/marketplace/skills","Skill 广场",Library],["/marketplace/models","模型广场",Boxes],["/datasets","数据清洗",Database],["/projects/demo","商品项目",Layers3],["/settings/models","模型设置",Settings2]] as const;
const skills=[
 {title:"床品场景图 · 轻法式卧室",author:"Mira Studio",rating:"4.9",runs:"2.8k",tag:"背景生成",color:"from-[#243d72] to-[#111b2e]"},
 {title:"商品图片保真清晰化",author:"LoomLink 官方",rating:"4.8",runs:"8.6k",tag:"官方",color:"from-[#28574f] to-[#102621]"},
 {title:"Etsy 标题与 13 标签",author:"NorthPeak",rating:"4.7",runs:"5.1k",tag:"文案",color:"from-[#593e76] to-[#21172d]"},
 {title:"Etsy 竞品数据清洗",author:"LoomLink 官方",rating:"4.9",runs:"3.2k",tag:"数据",color:"from-[#6a4928] to-[#271b11]"},
];
const download=(name:string,text:string,type="text/plain")=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)};

function Brand(){return <Link href="/workspace" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary text-white"><Layers3 className="size-5"/></span><span><b className="block text-[15px] text-white">织链 LoomLink</b><small className="text-xs text-slate-500">Commerce Skill Studio</small></span></Link>}
function Shell({children}:{children:React.ReactNode}){const path=usePathname(),router=useRouter();const[mobile,setMobile]=useState(false);const[q,setQ]=useState("");return <div className="min-h-screen text-slate-100"><aside className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-white/8 bg-[#090d13]/95 px-4 py-5 backdrop-blur-xl transition-transform lg:translate-x-0 ${mobile?"translate-x-0":"-translate-x-full"}`}><div className="flex items-center justify-between px-2"><Brand/><Button aria-label="关闭菜单" variant="ghost" size="icon-sm" className="lg:hidden" onClick={()=>setMobile(false)}><X/></Button></div><nav className="mt-9 space-y-1">{nav.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setMobile(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${path.startsWith(href.replace("/demo",""))?"bg-[#172234] text-white":"text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon className="size-[18px]"/>{label}</Link>)}</nav><div className="absolute inset-x-4 bottom-5 rounded-2xl border border-white/8 bg-white/[.025] p-3"><div className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="size-4 text-emerald-400"/>尚未保存模型密钥</div><div className="mt-2 h-1.5 rounded-full bg-white/8"><div className="h-full w-2/3 rounded-full bg-primary"/></div><p className="mt-2 text-[11px] text-slate-600">演示环境 · 需配置真实模型</p></div></aside><div className="lg:pl-[248px]"><header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/8 bg-[#080b10]/80 px-4 backdrop-blur-xl md:px-7"><Button aria-label="打开菜单" variant="ghost" size="icon" className="lg:hidden" onClick={()=>setMobile(true)}><Menu/></Button><form className="relative max-w-xl flex-1" onSubmit={e=>{e.preventDefault();if(q.trim())window.location.assign(`/marketplace/skills?q=${encodeURIComponent(q)}`)}}><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"/><Input value={q} onChange={e=>setQ(e.target.value)} className="h-9 border-white/8 bg-white/[.035] pl-9" placeholder="搜索示例 Skill…"/></form><Badge variant="outline" className="hidden border-amber-400/20 bg-amber-400/5 text-amber-200 sm:flex">演示模式</Badge><Link aria-label="个人主页" href="/profile/me" className="grid size-9 place-items-center rounded-full border border-white/10 bg-[#18243a]"><CircleUserRound className="size-5"/></Link></header><main className="grid-fade min-h-[calc(100vh-4rem)] p-4 md:p-7">{children}</main></div><Toaster richColors position="top-center"/></div>}

function Workspace(){const[files,setFiles]=useState<File[]>([]),[running,setRunning]=useState(false),[progress,setProgress]=useState(0),[extra,setExtra]=useState(false);function run(){toast.error(files.length ? "真实生成服务尚未接通，未执行模型调用，也没有生成结果。" : "请先选择至少一张 SKU 图片");}return <div className="mx-auto max-w-[1480px]"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-primary">商品生成工作台</p><h1 className="text-2xl font-semibold md:text-3xl">把一组 SKU，变成完整上架包</h1></div><div className="flex gap-2"><Button variant="outline" asChild><Link href="/projects/demo"><Download/>历史导出</Link></Button><Button asChild><Link href="/skills/new"><Plus/>创建 Skill</Link></Button></div></div><div className="grid gap-4 xl:grid-cols-[1fr_340px]"><section className="glass rounded-2xl p-4 md:p-6"><div className="grid gap-5 lg:grid-cols-2"><div><label className="text-sm font-medium">本次使用的 Skill</label><Link href="/skills/demo" className="mt-2 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary"><WandSparkles/></span><div><b className="text-sm">床品 Etsy 完整上架流程</b><p className="text-xs text-slate-500">6 步 · 图片 + 文案 + 定价</p></div></div><ChevronRight/></Link><div className="mt-5 grid grid-cols-2 gap-3"><Input aria-label="商品名称" defaultValue="法式水洗亚麻被套"/><Input aria-label="商品分类" defaultValue="Bedding / Duvet cover"/></div><Textarea className="mt-3 min-h-28 bg-black/20" defaultValue="天然亚麻触感，低饱和燕麦色。请保持织物纹理与颜色真实，生成适合 Etsy 的图片和英文文案。"/>{extra&&<Input className="mt-3" autoFocus placeholder="例如：背景不要出现人物"/>}<div className="mt-3 flex items-center justify-between"><Button variant="ghost" size="sm" onClick={()=>setExtra(v=>!v)}><Plus/>{extra?"收起补充要求":"添加步骤要求"}</Button><span className="text-xs text-slate-600">表单尚未自动保存</span></div></div><div><label className="text-sm font-medium">上传 SKU 图片</label><label className="mt-2 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center hover:border-primary/60"><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{const f=Array.from(e.target.files||[]);if(f.some(x=>!["image/jpeg","image/png","image/webp"].includes(x.type)||x.size>20*1024*1024)){toast.error("请选择 JPG、PNG、WebP，单张不能超过 20MB");e.target.value="";return}setFiles(f);if(f.length)toast.success(`已载入 ${f.length} 张 SKU 图片`)}}/><Upload className="size-9 text-primary"/><b className="mt-4 text-sm">选择多张图片</b><p className="mt-1 text-xs text-slate-500">JPG、PNG、WebP · 单张不超过 20MB</p></label>{files.length>0&&<div className="mt-3 flex flex-wrap gap-2">{files.map(f=><Badge key={f.name} variant="secondary"><ImagePlus/>{f.name}</Badge>)}</div>}</div></div><div className="mt-6 border-t border-white/8 pt-5">{progress>0&&<div className="mb-4 rounded-xl bg-white/[.025] p-3"><div className="mb-2 flex justify-between text-xs"><span>{running?"正在执行商品流程":"流程已完成"}</span><b>{progress}%</b></div><Progress value={progress}/></div>}<div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">真实生成服务尚未接通；当前仅可选择素材和编辑流程</p><Button size="lg" onClick={run} disabled={running}>{running?"生成中…":"开始生成上架包"}<ChevronRight/></Button></div></div></section><aside className="space-y-4"><div className="glass rounded-2xl p-4"><div className="flex justify-between"><b className="text-sm">流程步骤</b><Badge variant="secondary">6 步</Badge></div><div className="mt-4 space-y-1">{baseSteps.map((s,i)=><div key={s} className="flex items-center gap-3 rounded-xl p-2.5"><span className={`grid size-7 place-items-center rounded-lg text-xs ${i===0?"bg-primary":"bg-white/5 text-slate-500"}`}>{i+1}</span><span className="text-sm text-slate-300">{s}</span></div>)}</div></div><div className="overflow-hidden rounded-2xl border border-white/8 bg-[#10151d]"><img className="h-40 w-full object-cover opacity-80" src="https://images.unsplash.com/photo-1582224163312-0735047647c6?auto=format&fit=crop&q=75&w=900" alt="自然光下的亚麻床品"/><div className="p-4"><p className="text-xs text-slate-500">风格参考</p><b className="mt-1 block text-sm">自然光 · 真实亚麻质感</b></div></div></aside></div></div>}

function ModelsPanel(){const[baseUrl,setBaseUrl]=useState("https://api.example.com/v1"),[model,setModel]=useState("image-model-v1"),[key,setKey]=useState("");async function test(){if(!key.trim() || !model.trim()){toast.error("请填写 Model ID 和 API Key");return}try{toast.loading("正在检查连接…",{id:"model"});const r=await fetch("/api/models/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({baseUrl,modelId:model,apiKey:key})});const j=await r.json() as {ok:boolean;data:{capabilities:string[]};error?:string};j.ok?toast.success(`连接正常：${j.data.capabilities.join("、")}`,{id:"model"}):toast.error(j.error||"连接失败",{id:"model"})}catch{toast.error("请求失败，请检查网络后重试",{id:"model"})}}return <div className="mx-auto max-w-6xl"><div className="flex justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Model Gateway</p><h1 className="mt-2 text-3xl font-semibold">模型与 API 密钥</h1><p className="mt-2 text-slate-400">保存真实密钥前请先配置托管环境的加密主密钥。</p></div><Button onClick={()=>toast.info("请在右侧填写新模型配置")}><Plus/>添加模型</Button></div><div className="mt-7 grid gap-4 lg:grid-cols-[1fr_360px]"><section className="space-y-3">{[["GPT Image 2","OpenAI 兼容"],["Gemini 3 Pro Image","Google Gemini"],["Claude Sonnet","Anthropic"]].map((m,i)=><div key={m[0]} className="glass flex items-center justify-between rounded-2xl p-4"><div><b>{m[0]}</b><p className="text-xs text-slate-500">{m[1]} · 示例配置</p></div><Button variant="outline" size="sm" onClick={()=>{setModel(m[0]);toast.info(`已载入 ${m[0]} 配置`)}}>编辑</Button></div>)}</section><aside className="glass rounded-2xl p-5"><b>连接测试</b><label className="mt-5 block text-sm">Base URL<Input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} className="mt-2"/></label><label className="mt-4 block text-sm">Model ID<Input value={model} onChange={e=>setModel(e.target.value)} className="mt-2"/></label><label className="mt-4 block text-sm">API Key<Input value={key} onChange={e=>setKey(e.target.value)} className="mt-2" type="password" placeholder="仅用于本次测试"/></label><Button className="mt-5 w-full" onClick={test}><ShieldCheck/>检查连接与能力</Button></aside></div></div>}

function DatasetPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removed, setRemoved] = useState(0);
  async function clean() {
    if (!file) return;
    setBusy(true); setError(""); setRows([]);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("CSV 不能超过 10MB");
      const input = parseCsv(await file.text());
      if (!input.length) throw new Error("CSV 没有数据记录");
      if (!("listing_id" in input[0]) && !("listing_url" in input[0])) throw new Error("缺少 listing_id 或 listing_url 列");
      const cleaned = cleanLandropRows(input);
      setRows(cleaned); setRemoved(input.length - cleaned.length);
      if (!cleaned.length) throw new Error("没有有效的 Etsy 商品记录");
    } catch (e) { setError(e instanceof Error ? e.message : "文件读取失败"); }
    finally { setBusy(false); }
  }
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return <div className="mx-auto max-w-6xl">
    <h1 className="text-3xl font-semibold">Etsy 竞品数据清洗</h1>
    <p className="my-4 text-slate-300">按商品 ID 去重，规范 Etsy 链接、店龄和销量。缺失数值保留为空。</p>
    <section className="glass rounded-2xl p-5 space-y-4">
      <label className="block">导入 Landrop CSV<input aria-label="导入 Landrop CSV" className="block mt-2" type="file" accept=".csv,text/csv" onChange={e=>{setFile(e.target.files?.[0] || null);setRows([]);setError("");}}/></label>
      <Button disabled={!file || busy} onClick={clean}>{busy ? "清洗中…" : "开始清洗"}</Button>
      {error && <p role="alert" className="text-red-300">{error}</p>}
      {!!rows.length && <><p role="status">{rows.length} 条有效记录 · 移除 {removed} 条重复或无效记录 · {new Set(rows.map(r=>r.shop_name).filter(Boolean)).size} 家店铺</p>
      <Button onClick={()=>download("cleaned-etsy-data.csv",exportCsv(rows),"text/csv;charset=utf-8")}>下载 CSV</Button>
      <div className="overflow-auto"><table className="w-full text-sm"><thead><tr>{headers.map(h=><th className="p-3 text-left" key={h}>{h}</th>)}</tr></thead><tbody>{rows.slice(0,100).map((r,i)=><tr key={i}>{headers.map(h=><td className="p-3 border-t whitespace-pre-wrap" key={h}>{r[h] == null ? "—" : String(r[h])}</td>)}</tr>)}</tbody></table></div>
      <p className="text-sm text-slate-300">预览前 100 条；下载包含全部清洗记录。</p></>}
    </section>
  </div>;
}

function Marketplace({view}:{view:StudioView}) {
 const path=usePathname();
 const [query,setQuery]=useState("");
 useEffect(()=>{setQuery(new URLSearchParams(window.location.search).get("q") || "");},[]);
 const titles:Record<string,string>={"skill-market":"Skill 广场","model-market":"模型广场",project:"商品项目",profile:"个人主页","skill-detail":"Skill 详情"};
 if(view==="skill-detail") { const i=Number(path.split("/").pop())-1;const item=skills[i];return <section className="glass rounded-xl p-6"><h1 className="text-2xl">{item?.title || "流程未找到"}</h1><p className="my-4">这是流程示例，不是已发布的社区 Skill。暂不提供评分或虚构使用量。</p><Button asChild><Link href={i===3?"/datasets":"/skills/new"}>{i===3?"打开数据清洗":"创建自己的流程"}</Link></Button></section>; }
 return <div className="mx-auto max-w-6xl space-y-5"><h1 className="text-3xl">{titles[view]}</h1>
 {view==="skill-market"?<><p>流程示例 · 社区发布与排行榜尚未接通</p><Input aria-label="筛选流程" placeholder="按流程名称搜索" value={query} onChange={e=>setQuery(e.target.value)}/><div className="grid gap-4 md:grid-cols-2">{skills.map((s,i)=>({...s,i})).filter(s=>s.title.toLowerCase().includes(query.toLowerCase())).map(s=><Link className="glass rounded-xl p-5" key={s.title} href={"/skills/"+(s.i+1)}><h2>{s.title}</h2><p className="mt-3 text-slate-300">查看示例与可用操作 →</p></Link>)}</div>{!skills.some(s=>s.title.toLowerCase().includes(query.toLowerCase()))&&<p role="status">没有匹配的流程</p>}<Button asChild><Link href="/skills/new">创建 Skill</Link></Button></>:view==="model-market"?<><p>暂无经过真实验证的公共模型。模型目录不会展示未经检测的能力。</p><Button asChild><Link href="/settings/models">模型设置</Link></Button></>:view==="profile"?<><p>账号与云端个人主页尚未接通。当前草稿仅保存在本机浏览器，不会公开。</p><Button asChild><Link href="/skills/new">打开本机草稿</Link></Button></>:<><p>暂无已完成的生成任务或上架包。不会提供示例 CSV 冒充生成结果。</p><Button asChild><Link href="/workspace">返回工作台</Link></Button></>}</div>;
}

export function StudioApp({view}:{view:StudioView}){return <Shell>{view==="workspace"?<Workspace/>:view==="skill-editor"?<SkillDraftEditor/>:view==="models"?<ModelsPanel/>:view==="datasets"?<DatasetPanel/>:<Marketplace view={view}/>}</Shell>}
