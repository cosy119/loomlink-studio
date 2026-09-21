import { NextRequest, NextResponse } from "next/server";
type Ctx = {params: Promise<{path: string[]}>};
const unavailable = () => NextResponse.json({ok:false,error:"此云端服务尚未实现，未保存、发布或调用模型。请使用明确标注的本机功能。",code:"NOT_IMPLEMENTED"},{status:501});
export async function GET(_:NextRequest,{params}:Ctx) {
 const {path}=await params;
 if(path.join("/")==="models/public") return NextResponse.json({ok:true,data:[]});
 return NextResponse.json({ok:false,error:"接口不存在"},{status:404});
}
export async function POST(){return unavailable();}
export async function PUT(){return unavailable();}
export async function DELETE(){return unavailable();}
