/**
 * 기술 한국어 이름 fetch 스크립트
 * 실행: npx tsx scripts/fetch-moves-ko.ts
 *
 * 입력:  data/champions-move-ids.json (Showdown 기술 ID 목록)
 * 생성:  data/moves-ko.json  — { "fireblast": "화염방사", ... }
 */

import * as fs from "fs";
import * as path from "path";

const SHOWDOWN_MOVES_URL =
  "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/moves.ts";

const DELAY_MS = 150; // PokeAPI rate limit 대응

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Showdown moves.ts 에서 { moveId → num } 맵 추출 ───────────────────────────
async function fetchShowdownNums(): Promise<Record<string, number>> {
  console.log("📥 Showdown moves.ts fetch...");
  const res = await fetch(SHOWDOWN_MOVES_URL);
  if (!res.ok) throw new Error(`fetch 실패: ${res.status}`);
  const text = await res.text();

  const result: Record<string, number> = {};

  // 패턴: moveId: {\n\t\tnum: 126,
  const re = /^\t(\w+): \{[\s\S]*?\tnum: (\d+),/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    result[m[1]] = parseInt(m[2], 10);
  }

  console.log(`   기술 num 맵: ${Object.keys(result).length}개\n`);
  return result;
}

// ── PokeAPI에서 한국어 기술 이름 + 타입 fetch ────────────────────────────────
async function fetchMoveData(num: number): Promise<{ name: string | null; type: string | null }> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${num}/`);
    if (!res.ok) return { name: null, type: null };
    const json = await res.json();
    const names = json.names as { language: { name: string }; name: string }[];
    const ko = names.find((n) => n.language.name === "ko");
    return {
      name: ko?.name ?? null,
      type: (json.type?.name as string) ?? null,
    };
  } catch {
    return { name: null, type: null };
  }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Champions 기술 ID 목록 로드
  const moveIdsPath = path.join(process.cwd(), "data", "champions-move-ids.json");
  if (!fs.existsSync(moveIdsPath)) {
    console.error("❌ data/champions-move-ids.json 없음. 먼저 fetch-champions-data.ts 실행");
    process.exit(1);
  }
  const moveIds: string[] = JSON.parse(fs.readFileSync(moveIdsPath, "utf-8"));
  console.log(`기술 ${moveIds.length}개 한국어 이름 fetch 시작...\n`);

  // 2. Showdown num 맵
  const numMap = await fetchShowdownNums();

  // 3. PokeAPI에서 한국어 이름 + 타입 fetch
  const movesKo: Record<string, { name: string; type: string }> = {};
  let ok = 0, fallback = 0, missing = 0;

  for (let i = 0; i < moveIds.length; i++) {
    const id = moveIds[i];
    const num = numMap[id];

    if (!num || num <= 0) {
      movesKo[id] = { name: id, type: "normal" };
      missing++;
      if ((i + 1) % 50 === 0 || i === moveIds.length - 1)
        process.stdout.write(`\r[${i + 1}/${moveIds.length}] ✅${ok} ⚠️${fallback} ❌${missing}`);
      continue;
    }

    await sleep(DELAY_MS);
    const { name, type } = await fetchMoveData(num);

    movesKo[id] = {
      name: name ?? id.replace(/([a-z])([A-Z])/g, "$1 $2"),
      type: type ?? "normal",
    };
    if (name) ok++; else fallback++;

    if ((i + 1) % 50 === 0 || i === moveIds.length - 1)
      process.stdout.write(`\r[${i + 1}/${moveIds.length}] ✅${ok} ⚠️${fallback} ❌${missing}`);
  }

  console.log(`\n\n결과: 한국어 ${ok}개 | 영어 fallback ${fallback}개 | num 없음 ${missing}개`);

  // 4. 저장
  const outPath = path.join(process.cwd(), "data", "moves-ko.json");
  fs.writeFileSync(outPath, JSON.stringify(movesKo, null, 2), "utf-8");
  console.log(`\n✅ data/moves-ko.json 저장 완료 (${Object.keys(movesKo).length}개)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
