/**
 * 포켓몬 챔피언스 입국 포켓몬 목록
 * slug = PokeAPI 식별자 (https://pokeapi.co/api/v2/pokemon/{slug})
 * 순서 기준: pochmaslist.txt / 한글명 기준: rightname.txt
 */

export interface PokechampEntry {
  nameKo: string;
  slug: string;
}

export const POKECHAMPS_LIST: PokechampEntry[] = [
  // ─── 1세대 ────────────────────────────────────────
  { nameKo: "이상해꽃",              slug: "venusaur" },
  { nameKo: "리자몽",                slug: "charizard" },
  { nameKo: "거북왕",                slug: "blastoise" },
  { nameKo: "독침붕",                slug: "beedrill" },
  { nameKo: "피죤투",                slug: "pidgeot" },
  { nameKo: "아보크",                slug: "arbok" },
  { nameKo: "피카츄",                slug: "pikachu" },
  { nameKo: "라이츄",                slug: "raichu" },
  { nameKo: "라이츄(알로라)",        slug: "raichu-alola" },
  { nameKo: "픽시",                  slug: "clefable" },
  { nameKo: "나인테일",              slug: "ninetales" },
  { nameKo: "나인테일(알로라)",      slug: "ninetales-alola" },
  { nameKo: "윈디",                  slug: "arcanine" },
  { nameKo: "윈디(히스이)",          slug: "arcanine-hisui" },
  { nameKo: "후딘",                  slug: "alakazam" },
  { nameKo: "괴력몬",                slug: "machamp" },
  { nameKo: "우츠보트",              slug: "victreebel" },
  { nameKo: "야도란",                slug: "slowbro" },
  { nameKo: "야도란(가라르)",        slug: "slowbro-galar" },
  { nameKo: "팬텀",                  slug: "gengar" },
  { nameKo: "캥카",                  slug: "kangaskhan" },
  { nameKo: "아쿠스타",              slug: "starmie" },
  { nameKo: "쁘사이저",              slug: "pinsir" },        // Pinsir (was scyther ❌)
  { nameKo: "켄타로스",              slug: "tauros" },
  { nameKo: "켄타로스(팔데아·격투)", slug: "tauros-paldea-combat-breed" },
  { nameKo: "켄타로스(팔데아·화염)", slug: "tauros-paldea-blaze-breed" },
  { nameKo: "켄타로스(팔데아·수류)", slug: "tauros-paldea-aqua-breed" },
  { nameKo: "갸라도스",              slug: "gyarados" },
  { nameKo: "메타몽",                slug: "ditto" },
  { nameKo: "샤미드",                slug: "vaporeon" },
  { nameKo: "쥬피썬더",              slug: "jolteon" },
  { nameKo: "부스터",                slug: "flareon" },
  { nameKo: "프테라",                slug: "aerodactyl" },
  { nameKo: "잠만보",                slug: "snorlax" },
  { nameKo: "망나뇽",                slug: "dragonite" },

  // ─── 2세대 ────────────────────────────────────────
  { nameKo: "메가니움",              slug: "meganium" },
  { nameKo: "블레이범",              slug: "typhlosion" },
  { nameKo: "블레이범(히스이)",      slug: "typhlosion-hisui" },
  { nameKo: "장크로다일",            slug: "feraligatr" },
  { nameKo: "아리아도스",            slug: "ariados" },
  { nameKo: "전룡",                  slug: "ampharos" },
  { nameKo: "마릴리",                slug: "azumarill" },
  { nameKo: "왕구리",                slug: "politoed" },
  { nameKo: "에브이",                slug: "espeon" },        // Espeon (was eevee ❌)
  { nameKo: "블래키",                slug: "umbreon" },
  { nameKo: "야도킹",                slug: "slowking" },
  { nameKo: "야도킹(가라르)",        slug: "slowking-galar" },
  { nameKo: "쏘콘",                  slug: "forretress" },
  { nameKo: "강철톤",                slug: "steelix" },
  { nameKo: "핫삼",                  slug: "scizor" },
  { nameKo: "헤라크로스",            slug: "heracross" },
  { nameKo: "무장조",                slug: "skarmory" },
  { nameKo: "헬가",                  slug: "houndoom" },
  { nameKo: "마기라스",              slug: "tyranitar" },

  // ─── 3세대 ────────────────────────────────────────
  { nameKo: "페리퍼",                slug: "pelipper" },
  { nameKo: "가디안",                slug: "gardevoir" },
  { nameKo: "깜까미",                slug: "sableye" },
  { nameKo: "보스로라",              slug: "aggron" },        // Aggron (was breloom ❌)
  { nameKo: "요가램",                slug: "medicham" },
  { nameKo: "썬더볼트",              slug: "manectric" },
  { nameKo: "샤크니아",              slug: "sharpedo" },
  { nameKo: "폭타",                  slug: "camerupt" },
  { nameKo: "코터스",                slug: "torkoal" },
  { nameKo: "파비코리",              slug: "altaria" },       // Altaria (was flygon ❌)
  { nameKo: "밀로틱",                slug: "milotic" },
  { nameKo: "캐스퐁",                slug: "castform" },
  { nameKo: "다크펫",                slug: "banette" },
  { nameKo: "치렁",                  slug: "chimecho" },
  { nameKo: "앱솔",                  slug: "absol" },
  { nameKo: "얼음귀신",              slug: "glalie" },

  // ─── 4세대 ────────────────────────────────────────
  { nameKo: "토대부기",              slug: "torterra" },
  { nameKo: "초염몽",                slug: "infernape" },
  { nameKo: "엠페르트",              slug: "empoleon" },
  { nameKo: "렌트라",                slug: "luxray" },
  { nameKo: "로즈레이드",            slug: "roserade" },
  { nameKo: "램펄드",                slug: "rampardos" },
  { nameKo: "바리톱스",              slug: "bastiodon" },
  { nameKo: "이어롭",                slug: "lopunny" },       // Lopunny (was floatzel ❌)
  { nameKo: "화강돌",                slug: "spiritomb" },     // Spiritomb (was gastrodon ❌)
  { nameKo: "한카리아스",            slug: "garchomp" },
  { nameKo: "루카리오",              slug: "lucario" },
  { nameKo: "하마돈",                slug: "hippowdon" },
  { nameKo: "독개굴",                slug: "toxicroak" },
  { nameKo: "눈설왕",                slug: "abomasnow" },
  { nameKo: "포푸니라",              slug: "weavile" },
  { nameKo: "거대코뿌리",            slug: "rhyperior" },
  { nameKo: "리피아",                slug: "leafeon" },
  { nameKo: "글레이시아",            slug: "glaceon" },
  { nameKo: "글라이온",              slug: "gliscor" },
  { nameKo: "맘모꾸리",              slug: "mamoswine" },
  { nameKo: "엘레이드",              slug: "gallade" },
  { nameKo: "눈여아",                slug: "froslass" },
  { nameKo: "로토무",                slug: "rotom" },
  { nameKo: "로토무(열기)",          slug: "rotom-heat" },
  { nameKo: "로토무(세탁)",          slug: "rotom-wash" },
  { nameKo: "로토무(냉기)",          slug: "rotom-frost" },
  { nameKo: "로토무(선풍)",          slug: "rotom-fan" },
  { nameKo: "로토무(깎기)",          slug: "rotom-mow" },

  // ─── 5세대 ────────────────────────────────────────
  { nameKo: "샤로다",                slug: "serperior" },
  { nameKo: "염무왕",                slug: "emboar" },
  { nameKo: "대검귀",                slug: "samurott" },
  { nameKo: "대검귀(히스이)",        slug: "samurott-hisui" },
  { nameKo: "보르그",                slug: "watchog" },       // Watchog (was gigalith ❌)
  { nameKo: "레파르다스",            slug: "liepard" },
  { nameKo: "야나키",                slug: "simisage" },
  { nameKo: "바오키",                slug: "simisear" },
  { nameKo: "앗차키",                slug: "simipour" },
  { nameKo: "몰드류",                slug: "excadrill" },
  { nameKo: "다부니",                slug: "audino" },
  { nameKo: "노보청",                slug: "conkeldurr" },    // Conkeldurr (was sawsbuck ❌)
  { nameKo: "엘풍",                  slug: "whimsicott" },
  { nameKo: "악비아르",              slug: "krookodile" },    // Krookodile (was bisharp ❌)
  { nameKo: "데스니칸",              slug: "cofagrigus" },
  { nameKo: "더스트나",              slug: "garbodor" },      // Garbodor (was vanilluxe ❌)
  { nameKo: "조로아크",              slug: "zoroark" },
  { nameKo: "조로아크(히스이)",      slug: "zoroark-hisui" },
  { nameKo: "란쿨루스",              slug: "reuniclus" },
  { nameKo: "에몽가",                slug: "emolga" },
  { nameKo: "샹델라",                slug: "chandelure" },
  { nameKo: "툰베어",                slug: "beartic" },
  { nameKo: "메더",                  slug: "stunfisk" },      // Stunfisk (was yamask ❌)
  { nameKo: "메더(가라르)",          slug: "stunfisk-galar" },// Stunfisk Galar (was yamask-galar ❌)
  { nameKo: "골루그",                slug: "golurk" },
  { nameKo: "삼삼드래",              slug: "hydreigon" },
  { nameKo: "불카모스",              slug: "volcarona" },

  // ─── 6세대 ────────────────────────────────────────
  { nameKo: "브리가론",              slug: "chesnaught" },
  { nameKo: "마폭시",                slug: "delphox" },
  { nameKo: "개굴닌자",              slug: "greninja" },
  { nameKo: "파르토",                slug: "diggersby" },
  { nameKo: "파이어로",              slug: "talonflame" },
  { nameKo: "비비용",                slug: "vivillon" },
  { nameKo: "플라엣테",              slug: "floette" },       // Floette (was floette-eternal ❌)
  { nameKo: "플라제스",              slug: "florges" },
  { nameKo: "부란다",                slug: "pangoro" },
  { nameKo: "트리비앙",              slug: "furfrou" },       // Furfrou (was trevenant ❌)
  { nameKo: "냐오닉스",              slug: "meowstic-male" },
  { nameKo: "킬가르도",              slug: "aegislash-shield" },
  { nameKo: "프레프티르",            slug: "aromatisse" },
  { nameKo: "나루림",                slug: "slurpuff" },
  { nameKo: "블로스터",              slug: "clawitzer" },
  { nameKo: "일렉도리자드",          slug: "heliolisk" },
  { nameKo: "견고라스",              slug: "tyrantrum" },
  { nameKo: "아마루르가",            slug: "aurorus" },
  { nameKo: "님피아",                slug: "sylveon" },
  { nameKo: "루차불",                slug: "hawlucha" },
  { nameKo: "데덴네",                slug: "dedenne" },
  { nameKo: "미끄래곤",              slug: "goodra" },
  { nameKo: "미끄래곤(히스이)",      slug: "goodra-hisui" },
  { nameKo: "클레피",                slug: "klefki" },
  { nameKo: "대로트",                slug: "trevenant" },     // Trevenant (was gourgeist ❌)
  { nameKo: "펌킨인",                slug: "gourgeist-average" }, // Gourgeist (was pumpkaboo ❌)
  { nameKo: "크레베이스",            slug: "avalugg" },
  { nameKo: "크레베이스(히스이)",    slug: "avalugg-hisui" },

  // ─── 7세대 ────────────────────────────────────────
  { nameKo: "음번",                  slug: "noivern" },       // Noivern (was primarina ❌)
  { nameKo: "모크나이퍼",            slug: "decidueye" },
  { nameKo: "모크나이퍼(히스이)",    slug: "decidueye-hisui" },
  { nameKo: "어흥염",                slug: "incineroar" },
  { nameKo: "누리레르",              slug: "primarina" },     // Primarina (was ribombee ❌)
  { nameKo: "왕큰부리",              slug: "toucannon" },
  { nameKo: "모단단게",              slug: "crabominable" },
  { nameKo: "루가루암(낮)",          slug: "lycanroc-midday" },
  { nameKo: "루가루암(밤)",          slug: "lycanroc-midnight" },
  { nameKo: "루가루암(황혼)",        slug: "lycanroc-dusk" },
  { nameKo: "더시마사리",            slug: "toxapex" },       // Toxapex (was golisopod ❌)
  { nameKo: "만마드",                slug: "mudsdale" },
  { nameKo: "깨비물거미",            slug: "araquanid" },
  { nameKo: "염뉴트",                slug: "salazzle" },
  { nameKo: "달코퀸",                slug: "tsareena" },      // Tsareena (was comfey ❌)
  { nameKo: "하랑우탄",              slug: "oranguru" },
  { nameKo: "내던숭이",              slug: "passimian" },
  { nameKo: "따라큐",                slug: "mimikyu-disguised" },
  { nameKo: "할비롱",                slug: "drampa" },        // Drampa (was dhelmise ❌)
  { nameKo: "짜랑고우거",            slug: "kommo-o" },

  // ─── 8세대 ────────────────────────────────────────
  { nameKo: "아머까오",              slug: "corviknight" },   // Corviknight (was komala ❌)
  { nameKo: "애프룡",                slug: "flapple" },       // Flapple (was dreepy ❌)
  { nameKo: "단지래플",              slug: "appletun" },      // Appletun (was polteageist ❌)
  { nameKo: "사다이사",              slug: "sandaconda" },    // Sandaconda (was cursola ❌)
  { nameKo: "포트데스",              slug: "polteageist" },   // Polteageist (was dracovish ❌)
  { nameKo: "브리무음",              slug: "hatterene" },     // Hatterene (was grimmsnarl ❌)
  { nameKo: "마임꽁꽁",              slug: "mr-rime" },
  { nameKo: "데스판",                slug: "runerigus" },
  { nameKo: "마휘핑",                slug: "alcremie" },
  { nameKo: "모르페코",              slug: "morpeko-full-belly" },
  { nameKo: "드래펄트",              slug: "dragapult" },
  { nameKo: "신비록",                slug: "wyrdeer" },       // Wyrdeer (was spectrier ❌)
  { nameKo: "사마자르",              slug: "kleavor" },       // Kleavor (was mabosstiff ❌)
  { nameKo: "대쓰여너(수컷)",        slug: "basculegion-male" },
  { nameKo: "대쓰여너(암컷)",        slug: "basculegion-female" },
  { nameKo: "포푸니크",              slug: "sneasler" },

  // ─── 9세대 ────────────────────────────────────────
  { nameKo: "마스카나",              slug: "meowscarada" },
  { nameKo: "라우드본",              slug: "skeledirge" },
  { nameKo: "웨이니발",              slug: "quaquaval" },
  { nameKo: "파밀리쥐",              slug: "maushold-family-of-four" }, // Maushold (was tandemaus ❌)
  { nameKo: "콜로솔트",              slug: "garganacl" },
  { nameKo: "카디나르마",            slug: "armarouge" },
  { nameKo: "파라블레이즈",          slug: "ceruledge" },
  { nameKo: "찌리배리",              slug: "bellibolt" },
  { nameKo: "스코빌런",              slug: "scovillain" },
  { nameKo: "클레스퍼트라",          slug: "espathra" },      // Espathra (was glimmora ❌)
  { nameKo: "두드리짱",              slug: "tinkaton" },      // Tinkaton (was palafin-zero ❌)
  { nameKo: "돌핀맨",                slug: "palafin-zero" },  // Palafin (hero form is palafin-hero)
  { nameKo: "꿈트렁",                slug: "orthworm" },      // Orthworm (was houndstone ❌)
  { nameKo: "킬라플로르",            slug: "glimmora" },      // Glimmora (was iron-thorns ❌)
  { nameKo: "키키링",                slug: "farigiraf" },     // Farigiraf (was tinkaton ❌)
  { nameKo: "대도각참",              slug: "kingambit" },     // Kingambit (was lokix ❌)
  { nameKo: "그우린차",              slug: "sinistcha" },     // Sinistcha (was grafaiai ❌)
  { nameKo: "브리두라스",            slug: "archaludon" },    // Archaludon (was duraludon ❌)
  { nameKo: "과미드라",              slug: "hydrapple" },     // Hydrapple (was roaring-moon ❌)
];
