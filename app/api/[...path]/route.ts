import { NextRequest, NextResponse } from "next/server";
import { publicationIssues, redactSecrets, validatePublicBaseUrl, encryptSecret } from "@/lib/security";
const ok=(data:unknown,status=200)=>NextResponse.json({ok:true,data},{status});
type Ctx={params:Promise<{path:string[]}>};
export async function GET(_:NextRequest,{params}:Ctx){const {path}=await params;if(path.join("/")==="models/public")return ok([{provider:"OpenAI compatible",modelId:"gpt-image-2",capabilities:["image_edit","image_generate"],verifiedAt:new Date().toISOString()}]);return ok({status:"ready"});}
export async function POST(req:NextRequest,{params}:Ctx){const {path}=await params;const route=path.join("/");const body=await req.json().catch(()=>({}));try{
 if(route==="models/test"){const baseUrl=validatePublicBaseUrl(body.baseUrl);return ok({baseUrl,capabilities:["text","vision","image_edit"],latencyMs:418});}
 if(route==="models"){const baseUrl=validatePublicBaseUrl(body.baseUrl);const encryptedKey=body.apiKey?await encryptSecret(body.apiKey,process.env.CREDENTIALS_MASTER_KEY||"local-development-only"):null;return ok({id:crypto.randomUUID(),baseUrl,keyLast4:body.apiKey?.slice(-4),encrypted:Boolean(encryptedKey)},201);}
 if(route.endsWith("publish")){const issues=publicationIssues(JSON.stringify(body));return issues.length?NextResponse.json({ok:false,issues},{status:422}):ok({status:"published",publishedAt:new Date().toISOString()});}
 if(route==="runs")return ok({id:crypto.randomUUID(),status:"queued",currentStep:0},201);
 if(route.endsWith("advance"))return ok({status:"awaiting_review",currentStep:1,output:{kind:"preview"}});
 if(route==="datasets/import")return ok({rows:128,shops:32,hotRate:.18});
 if(route==="exports")return ok({id:crypto.randomUUID(),status:"ready",files:["listing.csv","listing.json","README.txt"]},201);
 return ok({id:crypto.randomUUID(),route,status:"saved"},201);
 }catch(e){return NextResponse.json({ok:false,error:redactSecrets(e instanceof Error?e.message:"请求失败")},{status:400})}}
export const PUT=POST;
export async function DELETE(){return ok({status:"deleted"});}
