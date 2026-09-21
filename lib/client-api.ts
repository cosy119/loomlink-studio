export type ApiResult<T>={ok:true;data:T}|{ok:false;error:string;code?:string;issues?:string[]};
export async function api<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch(path,{...init,headers:init?.body instanceof FormData?init.headers:{"content-type":"application/json",...init?.headers}});
 const result=await response.json().catch(()=>({ok:false,error:`服务返回了无效响应（${response.status}）`})) as ApiResult<T>;
 if(!response.ok||!result.ok){const e=new Error(!result.ok?result.error:`请求失败（${response.status}）`) as Error&{code?:string;issues?:string[]};if(!result.ok){e.code=result.code;e.issues=result.issues}throw e;}
 return result.data;
}
export function signIn(returnTo:string){window.location.assign(`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`);}
