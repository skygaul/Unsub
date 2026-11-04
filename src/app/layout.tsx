import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import IdleLogout from "@/components/IdleLogout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "구독 해지 도우미",
  description:
    "결제 문자를 붙여넣으면 구독을 정리하고, 서비스별 해지 방법과 환불 규정을 안내해요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <IdleLogout />
      </body>
    </html>
  );
}
