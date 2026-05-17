// 프로필 & 커뮤니티 파티 빌더 공통 상수/타입

export const EV_MAX       = 32;
export const EV_TOTAL_MAX = 66;
export const MOVE_COUNT   = 4;
export const SLOT_COUNT   = 6;
export const EV_STATS     = ["HP", "공격", "방어", "특공", "특방", "스피드"] as const;

export const TYPE_SPRITE_ID: Record<string, number> = {
  normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5,
  rock: 6, bug: 7, ghost: 8, steel: 9, fire: 10, water: 11,
  grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16,
  dark: 17, fairy: 18,
};

export const TYPE_KO: Record<string, string> = {
  normal: "노말", fighting: "격투", flying: "비행", poison: "독", ground: "땅",
  rock: "바위", bug: "벌레", ghost: "고스트", steel: "강철", fire: "불꽃",
  water: "물", grass: "풀", electric: "전기", psychic: "에스퍼", ice: "얼음",
  dragon: "드래곤", dark: "악", fairy: "페어리",
};

export function typeIconUrl(type: string): string {
  const id = TYPE_SPRITE_ID[type] ?? 1;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${id}.png`;
}

export const SLUG_EXCEPTIONS: Record<string, string> = {
  "aegislash-shield":   "aegislash",
  "mimikyu-disguised":  "mimikyu",
  "morpeko-full-belly": "morpeko",
  "gourgeist-average":  "gourgeist",
  "pumpkaboo-average":  "pumpkaboo",
  "lycanroc-midday":    "lycanroc",
  "palafin-zero":       "palafin",
  "meowstic-male":      "meowstic",
  "basculegion-male":   "basculegion",
  "basculegion-female": "basculegionf",
};

export function toShowdownId(slug: string): string {
  if (SLUG_EXCEPTIONS[slug]) return SLUG_EXCEPTIONS[slug];
  return slug
    .replace(/-breed$/, "")
    .replace(/-male$/, "")
    .replace(/-female$/, "f")
    .replace(/-/g, "")
    .toLowerCase();
}

export const NATURES = [
  { name: "노력",       note: "" },  { name: "온순",       note: "" },
  { name: "수줍음",     note: "" },  { name: "변덕",       note: "" },
  { name: "성실",       note: "" },
  { name: "외로움",     note: "+공/−방" },   { name: "용감",       note: "+공/−속" },
  { name: "고집",       note: "+공/−특공" }, { name: "개구장이",   note: "+공/−특방" },
  { name: "대담",       note: "+방/−공" },   { name: "무사태평",   note: "+방/−속" },
  { name: "장난꾸러기", note: "+방/−특공" }, { name: "능청스럽",   note: "+방/−특방" },
  { name: "겁쟁이",     note: "+속/−공" },   { name: "성급",       note: "+속/−방" },
  { name: "명랑",       note: "+속/−특공" }, { name: "천진난만",   note: "+속/−특방" },
  { name: "조심",       note: "+특공/−공" }, { name: "의젓",       note: "+특공/−방" },
  { name: "냉정",       note: "+특공/−속" }, { name: "덜렁",       note: "+특공/−특방" },
  { name: "차분",       note: "+특방/−공" }, { name: "얌전",       note: "+특방/−방" },
  { name: "신중",       note: "+특방/−특공" },{ name: "건방",      note: "+특방/−속" },
] as const;

export type EvTuple = [number, number, number, number, number, number];

export interface PokemonSlot {
  pokemon : string;
  nature  : string;
  ability : string;
  item    : string;
  evs     : EvTuple;
  moves   : string[];
  altMove : string;
}

export const emptySlot = (): PokemonSlot => ({
  pokemon: "", nature: "", ability: "", item: "",
  evs: [0, 0, 0, 0, 0, 0],
  moves: [],
  altMove: "",
});

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
