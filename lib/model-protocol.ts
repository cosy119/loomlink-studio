export type ProtocolMapping={modelsPath:string;modelsArrayPath:string;modelIdPath:string;authHeader:string;authPrefix:string;chatPath:string;textResponsePath:string};

export const defaultProtocolMapping:ProtocolMapping={modelsPath:"/models",modelsArrayPath:"data",modelIdPath:"id",authHeader:"Authorization",authPrefix:"Bearer",chatPath:"/chat/completions",textResponsePath:"choices.0.message.content"};

const safeHeader=/^(authorization|x-api-key|x-goog-api-key)$/i;
const safePath=/^\/[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*$/;
const safeJsonPath=/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

export function normalizeMapping(value:unknown):ProtocolMapping{
 const input=value&&typeof value==="object"?value as Partial<Record<keyof ProtocolMapping,unknown>>:{};
 const mapping={...defaultProtocolMapping};
 for(const key of Object.keys(mapping) as Array<keyof ProtocolMapping>){const text=String(input[key]??mapping[key]).trim();if(text)mapping[key]=text.slice(0,300)}
 if(!safePath.test(mapping.modelsPath)||!safePath.test(mapping.chatPath))throw new Error("自定义接口路径无效");
 if(!safeJsonPath.test(mapping.modelsArrayPath)||!safeJsonPath.test(mapping.modelIdPath)||!safeJsonPath.test(mapping.textResponsePath))throw new Error("自定义响应字段路径无效");
 if(!safeHeader.test(mapping.authHeader))throw new Error("鉴权 Header 仅支持 Authorization、X-API-Key 或 X-Goog-Api-Key");
 if(/[\r\n]/.test(mapping.authPrefix))throw new Error("鉴权前缀无效");
 return mapping;
}

export function joinEndpoint(base:string,path:string){return `${base.replace(/\/$/,"")}/${path.replace(/^\//,"")}`}
export function valueAt(input:unknown,path:string):unknown{return path.split(".").reduce<unknown>((value,key)=>value&&typeof value==="object"?(value as Record<string,unknown>)[key]:undefined,input)}
export function authHeaders(mapping:ProtocolMapping,key:string){return {[mapping.authHeader]:mapping.authPrefix?`${mapping.authPrefix} ${key}`:key}}
export function parseDiscoveredModels(payload:unknown,mapping:ProtocolMapping){const list=valueAt(payload,mapping.modelsArrayPath);if(!Array.isArray(list))throw new Error(`响应中未找到模型数组字段 ${mapping.modelsArrayPath}`);const ids=list.map(item=>typeof item==="string"?item:valueAt(item,mapping.modelIdPath)).filter((x):x is string=>typeof x==="string"&&x.trim().length>0).map(x=>x.replace(/^models\//,"").trim().slice(0,200));return [...new Set(ids)].sort().slice(0,500)}
