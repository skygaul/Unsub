// cancel-guides.json -> supabase/seed.sql
// 사용: node scripts/generate-seed.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = JSON.parse(readFileSync("cancel-guides.json", "utf8"));
const lastVerified = (src.meta.updated ?? src.meta.collected).slice(0, 10);

const pgText = (v) =>
  v == null ? "null" : `$q$${String(v).replaceAll("$q$", "")}$q$`;
const pgJson = (v) => `${pgText(JSON.stringify(v))}::jsonb`;

// 신뢰도 문자열 정규화: 여러 수준이 섞여 있으면 'partial'
const normalizeVerification = (v) => {
  const levels = ["page_read", "official_search", "blog_only"].filter((l) =>
    v.includes(l),
  );
  return levels.length > 1 ? "partial" : (levels[0] ?? "blog_only");
};

const rows = src.services.map((s) => {
  const warnings = Array.isArray(s.warnings)
    ? s.warnings
    : s.warning
      ? [s.warning]
      : [];
  const verification = normalizeVerification(s.verification);
  const notes = [s.notes, s.corrections, s.verification.includes("(") ? s.verification : null]
    .filter(Boolean)
    .join(" / ");
  // 서비스별 확인일(last_verified)이 있으면 그것을, 없으면 meta의 날짜를 쓴다
  const verifiedOn = s.last_verified ?? lastVerified;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn)) {
    throw new Error(`${s.id}: last_verified는 YYYY-MM-DD 형식이어야 합니다 (${verifiedOn})`);
  }
  return `(${pgText(s.id)}, ${pgText(s.name)}, ${pgJson(s.channels ?? [])}, ${pgJson(s.cancel ?? {})}, ${pgText(s.after_cancel)}, ${pgText(s.refund)}, ${pgJson(warnings)}, ${pgText(notes || null)}, ${pgText(s.contact)}, ${pgJson(s.sources ?? [])}, ${pgText(verification)}, '${verifiedOn}')`;
});

const sql = `-- 자동 생성 파일. cancel-guides.json을 수정한 뒤 scripts/generate-seed.mjs로 다시 만드세요.
insert into public.services
  (id, name, channels, cancel, after_cancel, refund, warnings, notes, contact, sources, verification, last_verified)
values
${rows.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  channels = excluded.channels,
  cancel = excluded.cancel,
  after_cancel = excluded.after_cancel,
  refund = excluded.refund,
  warnings = excluded.warnings,
  notes = excluded.notes,
  contact = excluded.contact,
  sources = excluded.sources,
  verification = excluded.verification,
  last_verified = excluded.last_verified;
`;

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", sql);
console.log(`seed.sql 생성: ${rows.length}개 서비스`);
