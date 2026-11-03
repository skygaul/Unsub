// Node에서 src/의 TypeScript 파일을 그대로 불러오기 위한 최소 로더.
// "@/..." 별칭과 확장자 없는 상대 경로를 .ts 파일로 연결한다. (시험 스크립트 전용)
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = path.join(root, "src", specifier.slice(2));
    specifier = pathToFileURL(path.extname(file) ? file : `${file}.ts`).href;
  } else if (/^\.\.?\//.test(specifier) && !path.extname(specifier)) {
    specifier = `${specifier}.ts`;
  }
  return nextResolve(specifier, context);
}
