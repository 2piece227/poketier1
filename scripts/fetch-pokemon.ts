/**
 * PokeAPI에서 포챔스 포켓몬 데이터를 받아와 data/pokemon.json 생성
 *
 * 실행:
 *   npx tsx scripts/fetch-pokemon.ts
 *
 * 처음 실행 시:
 *   npm install -D tsx
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { POKECHAMPS_LIST } from "../data/pokechamps-list";

interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
    front_default: string | null;
  };
  types: { type: { name: string } }[];
}

export interface PokemonData {
  nameKo: string;
  slug: string;
  id: number;
  artwork: string | null;
  types: string[];
}

const POKEAPI = "https://pokeapi.co/api/v2/pokemon";
const DELAY_MS = 300; // PokeAPI rate-limit 배려

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPokemon(slug: string): Promise<PokeApiPokemon | null> {
  try {
    const res = await fetch(`${POKEAPI}/${slug}`);
    if (!res.ok) {
      console.warn(`  ⚠️  ${slug} → HTTP ${res.status} (slug 확인 필요)`);
      return null;
    }
    return (await res.json()) as PokeApiPokemon;
  } catch (e) {
    console.error(`  ❌ ${slug} 네트워크 오류:`, e);
    return null;
  }
}

async function main() {
  const results: PokemonData[] = [];
  const failed: string[] = [];

  console.log(`\n포켓몬 ${POKECHAMPS_LIST.length}마리 fetch 시작...\n`);

  for (let i = 0; i < POKECHAMPS_LIST.length; i++) {
    const { nameKo, slug } = POKECHAMPS_LIST[i];
    process.stdout.write(`[${String(i + 1).padStart(3)}/${POKECHAMPS_LIST.length}] ${nameKo} (${slug})... `);

    const data = await fetchPokemon(slug);

    if (!data) {
      failed.push(`${nameKo} → ${slug}`);
      results.push({ nameKo, slug, id: 0, artwork: null, types: [] });
      process.stdout.write("실패\n");
    } else {
      const artwork =
        data.sprites.other?.["official-artwork"]?.front_default ??
        data.sprites.front_default ??
        null;
      const types = data.types.map((t) => t.type.name);
      results.push({ nameKo, slug, id: data.id, artwork, types });
      process.stdout.write(`✅ #${data.id}\n`);
    }

    await sleep(DELAY_MS);
  }

  const outPath = join(process.cwd(), "data", "pokemon.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");

  console.log(`\n✅ data/pokemon.json 저장 완료 (${results.length}마리)`);

  if (failed.length > 0) {
    console.log(`\n⚠️  아래 ${failed.length}마리는 slug가 틀렸거나 PokeAPI에 없음:`);
    failed.forEach((f) => console.log(`   - ${f}`));
    console.log("\ndata/pokechamps-list.ts에서 slug를 수정 후 재실행하세요.");
  }
}

main().catch(console.error);
