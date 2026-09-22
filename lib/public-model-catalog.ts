export type PublicModelCatalogItem={id:string;provider:string;name:string;baseUrl:string;modelId:string;protocol:"openai"|"gemini"|"claude";capabilitiesJson:string;verifiedAt:string;source:"official";description:string};
const updated="2026-09-22T00:00:00.000Z";
const item=(provider:string,name:string,baseUrl:string,modelId:string,protocol:PublicModelCatalogItem["protocol"],capabilities:string[],description:string):PublicModelCatalogItem=>({id:`official-${provider.toLowerCase()}-${modelId}`.replace(/[^a-z0-9-]/g,"-"),provider,name,baseUrl,modelId,protocol,capabilitiesJson:JSON.stringify(capabilities),verifiedAt:updated,source:"official",description});
export const officialModelCatalog:PublicModelCatalogItem[]=[
 item("OpenAI","GPT-5.6 Sol","https://api.openai.com/v1","gpt-5.6-sol","openai",["text","vision"],"复杂推理、代码与专业任务"),
 item("OpenAI","GPT-5.6 Terra","https://api.openai.com/v1","gpt-5.6-terra","openai",["text","vision"],"兼顾能力、速度与成本"),
 item("OpenAI","GPT-5.6 Luna","https://api.openai.com/v1","gpt-5.6-luna","openai",["text","vision"],"高频、成本敏感型任务"),
 item("OpenAI","GPT-Image-2","https://api.openai.com/v1","gpt-image-2","openai",["image_generate","image_edit"],"高质量图片生成与编辑"),
 item("Google","Gemini 3.8 Flash","https://generativelanguage.googleapis.com/v1beta","gemini-3.8-flash","gemini",["text","vision"],"快速多模态理解与商品文案"),
 item("Google","Gemini 3.1 Pro","https://generativelanguage.googleapis.com/v1beta","gemini-3.1-pro-preview","gemini",["text","vision"],"复杂推理、编码与多模态理解"),
 item("Google","Nano Banana 2","https://generativelanguage.googleapis.com/v1beta","gemini-3.1-flash-image","gemini",["text","vision","image_generate","image_edit"],"高效率图片生成与编辑"),
 item("Google","Nano Banana Pro","https://generativelanguage.googleapis.com/v1beta","gemini-3-pro-image","gemini",["text","vision","image_generate","image_edit"],"高质量设计、文字渲染与图片编辑"),
 item("Anthropic","Claude Sonnet 5","https://api.anthropic.com/v1","claude-sonnet-5","claude",["text","vision"],"速度与智能均衡的多模态模型"),
 item("Anthropic","Claude Opus 5","https://api.anthropic.com/v1","claude-opus-5","claude",["text","vision"],"深度推理与长流程专业任务"),
 item("Anthropic","Claude Fable 5","https://api.anthropic.com/v1","claude-fable-5","claude",["text","vision"],"高效日常任务与长上下文处理"),
 item("DeepSeek","DeepSeek V4.1 Flash","https://api.deepseek.com","deepseek-flash","openai",["text","vision"],"高性价比推理、图像理解与商品文案"),
 item("DeepSeek","DeepSeek V4 Pro","https://api.deepseek.com","deepseek-v4-pro","openai",["text"],"复杂推理、代码与智能体任务")
];
