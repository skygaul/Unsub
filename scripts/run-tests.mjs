// scripts/test-*.mjs를 모두 실행하고 결과를 모아 보여 준다. 하나라도 실패하면 종료 코드 1.
// 사용: npm test            (전체)
//       npm test -- idle    (이름에 "idle"이 들어간 것만)
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 실제 Claude를 호출해서 비용이 들고 API 키가 필요한 시험은 전체 실행에서 뺀다. (npm run test:ai)
const SKIP = new Set(["test-ai-parse.mjs"]);
const TIMEOUT_MS = 60_000;

const dir = fileURLToPath(new URL(".", import.meta.url));
const filter = process.argv[2];
const files = readdirSync(dir)
  .filter((f) => /^test-.+\.mjs$/.test(f) && !SKIP.has(f))
  .filter((f) => !filter || f.includes(filter))
  .sort();

if (files.length === 0) {
  console.error(`실행할 시험이 없어요${filter ? ` (필터: ${filter})` : ""}.`);
  process.exit(1);
}

const failures = [];
for (const file of files) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [`${dir}${file}`], {
    encoding: "utf8",
    timeout: TIMEOUT_MS,
  });
  const ms = Date.now() - started;
  const name = file.replace(/\.mjs$/, "");

  if (run.status === 0) {
    console.log(`✓ ${name} (${ms}ms)`);
  } else {
    console.log(`✗ ${name} (${ms}ms)${run.error ? `: ${run.error.message}` : ""}`);
    // 실패한 시험만 자세한 출력을 보여 준다. 실행 환경의 경고 문구는 걸러서 원인이 묻히지 않게 한다.
    const noise = /DeprecationWarning|--trace-deprecation|MODULE_TYPELESS|Reparsing as ES module|eliminate this warning|--trace-warnings/;
    const output = `${run.stdout ?? ""}${run.stderr ?? ""}`
      .split("\n")
      .filter((line) => line.trim() && !noise.test(line))
      .map((line) => `    ${line}`)
      .join("\n");
    if (output) console.log(output);
    failures.push(name);
  }
}

console.log(
  failures.length === 0
    ? `\n시험 ${files.length}개 모두 통과`
    : `\n시험 ${files.length}개 중 ${failures.length}개 실패: ${failures.join(", ")}`,
);
process.exit(failures.length === 0 ? 0 : 1);
