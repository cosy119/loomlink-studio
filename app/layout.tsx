import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "织链 LoomLink｜Etsy 商品 Skill 工作台",
  description: "为床品卖家编排图片、文案、定价与 Etsy 上架包的 AI 商品流程。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className="dark"><body>{children}</body></html>;
}
