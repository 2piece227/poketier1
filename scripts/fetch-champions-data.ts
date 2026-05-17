/**
 * Champions mod 데이터 fetch 스크립트
 * 실행: npx tsx scripts/fetch-champions-data.ts
 *
 * 생성 파일:
 *   data/champions-learnsets.json  — { "charizard": ["fireblast", ...] }
 *   data/champions-items-raw.json  — ["lifeorb", "choiceband", ...] (Showdown ID)
 */

import * as fs from "fs";
import * as path from "path";

const BASE =
  "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/mods/champions";

// ── fetch helpers ────────────────────────────────────────────────────────────
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch 실패: ${url} (${res.status})`);
  return res.text();
}

// ── learnsets 파싱 ───────────────────────────────────────────────────────────
function parseLearnsets(src: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  // 각 포켓몬 블록 추출: "pokemonId: {\n\t\tlearnset: {" 형태
  const pokemonBlockRe = /^\t(\w+): \{/gm;
  let pokemonMatch: RegExpExecArray | null;

  while ((pokemonMatch = pokemonBlockRe.exec(src)) !== null) {
    const pokemonId = pokemonMatch[1];
    const blockStart = pokemonMatch.index;

    // learnset: { ... } 블록 찾기
    const learnsetStart = src.indexOf("\t\tlearnset: {", blockStart);
    if (learnsetStart === -1) continue;

    // learnset 블록 끝 찾기 (중첩 {} 추적)
    let depth = 0;
    let i = learnsetStart + "\t\tlearnset: {".length;
    const learnsetContent: string[] = [];

    while (i < src.length) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        if (depth === 0) break;
        depth--;
      } else if (depth === 0) {
        // 기술명 추출: \t\t\tmoveId: [...]
        const lineEnd = src.indexOf("\n", i);
        const line = src.slice(i, lineEnd === -1 ? undefined : lineEnd).trim();
        const moveMatch = line.match(/^(\w+):\s*\[/);
        if (moveMatch) {
          learnsetContent.push(moveMatch[1]);
          i = lineEnd === -1 ? src.length : lineEnd;
          continue;
        }
      }
      i++;
    }

    if (learnsetContent.length > 0) {
      result[pokemonId] = learnsetContent;
    }
  }

  return result;
}

// ── items 파싱 (isNonstandard: null 인 것만) ──────────────────────────────────
function parseAllowedItems(src: string): string[] {
  const allowed: string[] = [];

  // 패턴: itemId: {\n\t\tinherit: true,\n\t\tisNonstandard: null,
  const re = /^\t(\w+): \{[\s\S]*?isNonstandard: null,/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    allowed.push(m[1]);
  }

  return allowed;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Champions mod 데이터 fetch 중...\n");

  // 1. Learnsets
  console.log("📖 learnsets.ts fetch...");
  const learnsetsText = await fetchText(`${BASE}/learnsets.ts`);
  const learnsets = parseLearnsets(learnsetsText);
  const pokemonCount = Object.keys(learnsets).length;
  const moveIds = new Set<string>();
  Object.values(learnsets).forEach((moves) => moves.forEach((m) => moveIds.add(m)));

  console.log(`   포켓몬: ${pokemonCount}마리`);
  console.log(`   고유 기술: ${moveIds.size}개`);

  const learnsetsPath = path.join(process.cwd(), "data", "champions-learnsets.json");
  fs.writeFileSync(learnsetsPath, JSON.stringify(learnsets, null, 2), "utf-8");
  console.log(`   ✅ data/champions-learnsets.json 저장\n`);

  // 2. Items
  console.log("🎒 items.ts fetch...");
  const itemsText = await fetchText(`${BASE}/items.ts`);
  const allowedItems = parseAllowedItems(itemsText);
  console.log(`   허용 아이템: ${allowedItems.length}개`);

  const itemsRawPath = path.join(process.cwd(), "data", "champions-items-raw.json");
  fs.writeFileSync(itemsRawPath, JSON.stringify(allowedItems, null, 2), "utf-8");
  console.log(`   ✅ data/champions-items-raw.json 저장\n`);

  // 3. 고유 기술 ID 목록 저장 (다음 스크립트에서 사용)
  const moveIdsPath = path.join(process.cwd(), "data", "champions-move-ids.json");
  fs.writeFileSync(moveIdsPath, JSON.stringify([...moveIds].sort(), null, 2), "utf-8");
  console.log(`✅ data/champions-move-ids.json 저장 (fetch-moves-ko.ts에서 사용)\n`);

  console.log("완료! 다음 실행: npx tsx scripts/fetch-moves-ko.ts");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
