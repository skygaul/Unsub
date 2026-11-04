import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// 브라우저가 Supabase(로그인·DB)에 접속하는 것만 허용하기 위한 주소. 환경변수를 못 읽으면 supabase.co 전체를 허용한다.
function supabaseOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "https://*.supabase.co";
  }
}

// 기본 CSP. 외부 스크립트·프레임 삽입, 플러그인, base 태그 바꿔치기를 막는다.
// Next.js가 화면을 붙일 때 인라인 스크립트를 쓰므로 script-src에 'unsafe-inline'이 필요하다.
// (그래서 인라인 스크립트 주입(XSS)까지 막지는 못한다. 더 강하게 하려면 nonce 방식으로 바꿔야 하고,
//  그러면 모든 페이지가 요청마다 렌더링돼야 한다.)
// 개발 서버는 eval과 웹소켓을 쓰므로 운영 빌드에서만 적용한다.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin()}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  // 응답 헤더에 "X-Powered-By: Next.js"를 싣지 않는다
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
