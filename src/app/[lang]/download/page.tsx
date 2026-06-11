import type { Metadata } from "next";
import DownloadContent from "./DownloadContent";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata({
    lang,
    titleZh: "下载龟迹APP | 智能养龟助手 | 龟迹 CheloniaTrace",
    titleEn: "Download Gui Ji App | Turtle Care Assistant | CheloniaTrace",
    descZh: "龟迹APP提供长期饲养记录、定期喂食提醒、动态策略更新和米家设备联动，是你专属的智能养龟助手。",
    descEn: "Gui Ji app offers long-term records, feeding reminders, dynamic strategy updates, and Mijia smart home automation.",
    path: "/download",
    keywords: ["龟迹APP", "养龟助手", "喂食提醒", "米家设备", "乌龟饲养", "下载"],
  });
}

export default async function DownloadPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as "zh" | "en";
  return <DownloadContent lang={lang} />;
}
