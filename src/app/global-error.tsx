"use client";

// 루트 레이아웃이 깨졌을 때만 쓰이는 마지막 안전망이다. 전역 스타일이 적용되지 않으므로 인라인 스타일을 쓴다.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>문제가 생겼어요</h1>
        <p style={{ fontSize: 14, color: "#52525b", margin: 0 }}>
          서비스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={() => retry()}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 14,
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
