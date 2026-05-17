"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import "@/styles/login.css";
import pokemonData from "@/data/pokemon.json";
import { ITEMS } from "@/data/items";
import { ABILITY_CORRECTIONS } from "@/data/ability-corrections";
import champLearnsets from "@/data/champions-learnsets.json";
import movesKo from "@/data/moves-ko.json";

// ─── 상수 ────────────────────────────────────────────────────────────────────
// BUILD: 2026-05-10-v3
const THEME_KEY   = "poketier-theme";
const AVATAR_BUCKET = "avatars";
const DEFAULT_AVATAR = "/default-avatar.png";
const PARTY_COUNT = 3;
const SLOT_COUNT  = 6;
const EV_MAX       = 32;
const EV_TOTAL_MAX = 66;
const MOVE_COUNT   = 4;
const EV_STATS    = ["HP", "공격", "방어", "특공", "특방", "스피드"] as const;

// 타입 단언 헬퍼
const LEARNSETS = champLearnsets as Record<string, string[]>;
const MOVES_KO  = movesKo as Record<string, { name: string; type: string }>;

// 타입 → PokeAPI 스프라이트 ID 맵
const TYPE_SPRITE_ID: Record<string, number> = {
  normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5,
  rock: 6, bug: 7, ghost: 8, steel: 9, fire: 10, water: 11,
  grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16,
  dark: 17, fairy: 18,
};
const TYPE_KO: Record<string, string> = {
  normal: "노말", fighting: "격투", flying: "비행", poison: "독", ground: "땅",
  rock: "바위", bug: "벌레", ghost: "고스트", steel: "강철", fire: "불꽃",
  water: "물", grass: "풀", electric: "전기", psychic: "에스퍼", ice: "얼음",
  dragon: "드래곤", dark: "악", fairy: "페어리",
};
function typeIconUrl(type: string) {
  const id = TYPE_SPRITE_ID[type] ?? 1;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${id}.png`;
}

// PokeAPI slug → Showdown ID 변환
// Showdown: 소문자+공백·하이픈 없음, 기본 폼은 suffix 제거
const SLUG_EXCEPTIONS: Record<string, string> = {
  "aegislash-shield":    "aegislash",
  "mimikyu-disguised":   "mimikyu",
  "morpeko-full-belly":  "morpeko",
  "gourgeist-average":   "gourgeist",
  "pumpkaboo-average":   "pumpkaboo",
  "lycanroc-midday":     "lycanroc",
  "palafin-zero":        "palafin",
  "meowstic-male":       "meowstic",
  "basculegion-male":    "basculegion",
  "basculegion-female":  "basculegionf",
};

function toShowdownId(slug: string): string {
  if (SLUG_EXCEPTIONS[slug]) return SLUG_EXCEPTIONS[slug];
  return slug
    .replace(/-breed$/, "")   // tauros paldea combat-breed → -breed 제거
    .replace(/-male$/, "")    // 수컷 폼 기본형
    .replace(/-female$/, "f") // 암컷 폼
    .replace(/-/g, "")        // 나머지 하이픈 제거
    .toLowerCase();
}

const NATURES = [
  // 보정 없음
  { name: "노력",       note: "" },  { name: "온순",       note: "" },
  { name: "수줍음",     note: "" },  { name: "변덕",       note: "" },
  { name: "성실",       note: "" },
  // +공격
  { name: "외로움",     note: "+공/−방" },   { name: "용감",       note: "+공/−속" },
  { name: "고집",       note: "+공/−특공" }, { name: "개구장이",   note: "+공/−특방" },
  // +방어
  { name: "대담",       note: "+방/−공" },   { name: "무사태평",   note: "+방/−속" },
  { name: "장난꾸러기", note: "+방/−특공" }, { name: "능청스럽",   note: "+방/−특방" },
  // +스피드
  { name: "겁쟁이",     note: "+속/−공" },   { name: "성급",       note: "+속/−방" },
  { name: "명랑",       note: "+속/−특공" }, { name: "천진난만",   note: "+속/−특방" },
  // +특공
  { name: "조심",       note: "+특공/−공" }, { name: "의젓",       note: "+특공/−방" },
  { name: "냉정",       note: "+특공/−속" }, { name: "덜렁",       note: "+특공/−특방" },
  // +특방
  { name: "차분",       note: "+특방/−공" }, { name: "얌전",       note: "+특방/−방" },
  { name: "신중",       note: "+특방/−특공" },{ name: "건방",      note: "+특방/−속" },
] as const;

// ─── 타입 ────────────────────────────────────────────────────────────────────
type EvTuple = [number, number, number, number, number, number];

interface PokemonSlot {
  pokemon : string;
  nature  : string;
  ability : string;
  item    : string;
  evs     : EvTuple;
  moves   : string[];   // Showdown 기술 ID 최대 4개
  altMove : string;     // 대체 기술 (선택)
}

interface PartyBuild {
  slots: PokemonSlot[];
}

interface AbilityInfo { name: string; isHidden: boolean; }

const emptySlot = (): PokemonSlot => ({
  pokemon: "", nature: "", ability: "", item: "",
  evs: [0, 0, 0, 0, 0, 0],
  moves: [],
  altMove: "",
});
const emptyParty = (): PartyBuild => ({
  slots: Array.from({ length: SLOT_COUNT }, emptySlot),
});

const isSchemaMissing = (e: { message?: string; code?: string }) =>
  (e?.message || "").includes("schema cache") ||
  (e?.message || "").includes("does not exist") ||
  e?.code === "PGRST202";

// ─── 검색 셀렉트 컴포넌트 ─────────────────────────────────────────────────────
interface SearchSelectProps {
  value     : string;
  onChange  : (v: string) => void;
  options   : string[];
  placeholder?: string;
  listId    : string;
}
function SearchSelect({ value, onChange, options, placeholder, listId }: SearchSelectProps) {
  return (
    <>
      <datalist id={listId}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
      <input
        list={listId}
        className="party-field-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router  = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 프로필
  const [user,             setUser]           = useState<User | null>(null);
  const [nickname,         setNickname]        = useState("");
  const [displayNickname,  setDisplayNickname] = useState("");
  const [avatarUrl,        setAvatarUrl]       = useState(DEFAULT_AVATAR);
  const [avatarMsg,        setAvatarMsg]       = useState("");
  const [avatarError,      setAvatarError]     = useState(false);
  const [nicknameMsg,      setNicknameMsg]     = useState("");
  const [nicknameError,    setNicknameError]   = useState(false);
  const [theme,            setTheme]           = useState<"light"|"dark">("light");

  // 파티
  const [parties,     setParties]     = useState<PartyBuild[]>(
    Array.from({ length: PARTY_COUNT }, emptyParty)
  );
  const [activeParty, setActiveParty] = useState(0);
  const [partyMsg,    setPartyMsg]    = useState("");
  const [partySaving, setPartySaving] = useState(false);

  // 특성 캐시: { [slug]: AbilityInfo[] }
  const [abilityCache, setAbilityCache] = useState<Record<string, AbilityInfo[]>>({});

  // ── 초기 로드 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    setTheme(saved);

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      const u = data.user;
      setUser(u);
      setDisplayNickname(u.user_metadata?.nickname || "닉네임 미설정");
      setNickname(u.user_metadata?.nickname || "");
      setAvatarUrl(u.user_metadata?.avatar_url || DEFAULT_AVATAR);

      const saved: PartyBuild[] = u.user_metadata?.parties || [];
      setParties(
        Array.from({ length: PARTY_COUNT }, (_, pi) => {
          const sp = saved[pi];
          if (!sp) return emptyParty();
          return {
            slots: Array.from({ length: SLOT_COUNT }, (_, si) => {
              const ss = sp.slots?.[si];
              return ss ? { ...emptySlot(), ...ss, evs: ss.evs ?? [0,0,0,0,0,0], moves: ss.moves ?? [], altMove: ss.altMove ?? "" } : emptySlot();
            }),
          };
        })
      );

      supabase.from("profiles").upsert(
        { id: u.id, nickname: u.user_metadata?.nickname || null, avatar_url: u.user_metadata?.avatar_url || null, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    });
  }, []);

  // ── 특성 fetch (한국어 이름 포함) ──────────────────────────────────────────
  const fetchAbilities = useCallback(async (slug: string) => {
    if (!slug || abilityCache[slug]) return;
    try {
      const pkmRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
      if (!pkmRes.ok) return;
      const pkmJson = await pkmRes.json();

      const rawAbilities = pkmJson.abilities as {
        ability: { name: string; url: string };
        is_hidden: boolean;
      }[];

      // 각 특성의 한국어 이름을 병렬로 가져옴
      const list: AbilityInfo[] = await Promise.all(
        rawAbilities.map(async (a) => {
          try {
            const abilRes  = await fetch(a.ability.url);
            const abilJson = await abilRes.json();
            const koEntry  = (abilJson.names as { language: { name: string }; name: string }[])
              .find(n => n.language.name === "ko");
            const rawName  = koEntry?.name ?? a.ability.name;
            const corrected = ABILITY_CORRECTIONS[rawName] ?? rawName;
            return {
              name: corrected, // 교정 맵 적용 → 한국어 → fallback 영어
              isHidden: a.is_hidden,
            };
          } catch {
            return { name: a.ability.name, isHidden: a.is_hidden };
          }
        })
      );

      setAbilityCache(prev => ({ ...prev, [slug]: list }));
    } catch { /* ignore */ }
  }, [abilityCache]);

  // ── 슬롯 업데이트 ─────────────────────────────────────────────────────────
  const updateSlot = (pi: number, si: number, field: keyof PokemonSlot, value: PokemonSlot[keyof PokemonSlot]) => {
    setParties(prev => {
      const next  = [...prev];
      const party = { slots: [...next[pi].slots] };
      party.slots[si] = { ...party.slots[si], [field]: value };
      next[pi] = party;
      return next;
    });
    setPartyMsg("");
  };

  // EV 버튼 클릭: 0·−·+·최대 (합계 캡·개별 캡 hard clamp)
  const setEvBtn = (pi: number, si: number, ei: number, raw: number) => {
    setParties(prev => {
      const next   = [...prev];
      const party  = { slots: [...next[pi].slots] };
      const slot   = party.slots[si];
      const sumOther = slot.evs.reduce((a, v, i) => i === ei ? a : a + v, 0);
      const val    = Math.max(0, Math.min(EV_MAX, EV_TOTAL_MAX - sumOther, raw));
      const evs    = [...slot.evs] as EvTuple;
      evs[ei]      = val;
      party.slots[si] = { ...slot, evs };
      next[pi] = party;
      return next;
    });
    setPartyMsg("");
  };

  // EV 직접 입력: 범위 초과 시 경고 표시만 (soft)
  const updateEv = (pi: number, si: number, ei: number, raw: string) => {
    const parsed = parseInt(raw, 10);
    const val    = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setParties(prev => {
      const next  = [...prev];
      const party = { slots: [...next[pi].slots] };
      const evs   = [...party.slots[si].evs] as EvTuple;
      evs[ei] = val;
      party.slots[si] = { ...party.slots[si], evs };
      next[pi] = party;
      return next;
    });
    setPartyMsg("");
  };

  // 대체 기술 설정
  const setAltMove = (pi: number, si: number, moveId: string) => {
    setParties(prev => {
      const next  = [...prev];
      const party = { slots: [...next[pi].slots] };
      party.slots[si] = { ...party.slots[si], altMove: moveId };
      next[pi] = party;
      return next;
    });
    setPartyMsg("");
  };

  // 기술 토글 (최대 4개)
  const toggleMove = (pi: number, si: number, moveId: string) => {
    setParties(prev => {
      const next  = [...prev];
      const party = { slots: [...next[pi].slots] };
      const slot  = party.slots[si];
      const moves = slot.moves.includes(moveId)
        ? slot.moves.filter(m => m !== moveId)
        : slot.moves.length < MOVE_COUNT
          ? [...slot.moves, moveId]
          : slot.moves; // 이미 4개면 무시
      party.slots[si] = { ...slot, moves };
      next[pi] = party;
      return next;
    });
    setPartyMsg("");
  };

  const clearSlot = (pi: number, si: number) => {
    setParties(prev => {
      const next  = [...prev];
      const party = { slots: [...next[pi].slots] };
      party.slots[si] = emptySlot();
      next[pi] = party;
      return next;
    });
  };

  // 포켓몬 변경 시 특성 자동 fetch
  const handlePokemonChange = (pi: number, si: number, name: string) => {
    updateSlot(pi, si, "pokemon", name);
    const match = pokemonData.find(p => p.nameKo === name);
    if (match) fetchAbilities(match.slug);
  };

  // ── 파티 저장 ─────────────────────────────────────────────────────────────
  const handleSaveParty = async () => {
    if (!user) return;
    setPartySaving(true); setPartyMsg("저장 중...");
    const { error } = await supabase.auth.updateUser({ data: { parties } });
    setPartySaving(false);
    setPartyMsg(error ? "저장에 실패했습니다." : "파티가 저장되었습니다.");
  };

  // ── 복사 / 붙여넣기 ───────────────────────────────────────────────────────
  const handleCopyParty = async () => {
    try {
      const party = parties[activeParty];
      await navigator.clipboard.writeText(JSON.stringify(party));
      setPartyMsg(`파티 ${activeParty + 1} 복사됨 — 커뮤니티에 붙여넣기 가능`);
    } catch {
      setPartyMsg("클립보드 접근 실패 (브라우저 권한 확인)");
    }
  };

  const handlePasteParty = async () => {
    try {
      const text   = await navigator.clipboard.readText();
      const parsed = JSON.parse(text) as PartyBuild;
      if (!Array.isArray(parsed?.slots)) { setPartyMsg("파티 형식이 아닙니다."); return; }
      setParties(prev => {
        const next  = [...prev];
        next[activeParty] = {
          slots: Array.from({ length: SLOT_COUNT }, (_, i) => {
            const s = parsed.slots[i];
            return s ? { ...emptySlot(), ...s, evs: s.evs ?? [0,0,0,0,0,0], moves: s.moves ?? [] } : emptySlot();
          }),
        };
        return next;
      });
      setPartyMsg(`파티 ${activeParty + 1}에 붙여넣기 완료`);
    } catch {
      setPartyMsg("붙여넣기 실패 — 올바른 파티 코드인지 확인해 주세요");
    }
  };

  // ── 아바타 ───────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { setAvatarMsg("이미지는 2MB 이하로 올려주세요."); setAvatarError(true); e.target.value = ""; return; }
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview); setAvatarMsg("업로드 중..."); setAvatarError(false);
    const ext  = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    URL.revokeObjectURL(preview);
    if (upErr) { setAvatarUrl(user.user_metadata?.avatar_url || DEFAULT_AVATAR); setAvatarMsg(`업로드 실패: ${upErr.message}`); setAvatarError(true); e.target.value = ""; return; }
    const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    if (!pub?.publicUrl) { setAvatarMsg("공개 URL 실패"); setAvatarError(true); e.target.value = ""; return; }
    const { data: updated, error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
    if (metaErr) { setAvatarMsg("프로필 반영 실패"); setAvatarError(true); e.target.value = ""; return; }
    await supabase.from("profiles").upsert(
      { id: user.id, avatar_url: pub.publicUrl, nickname: updated.user?.user_metadata?.nickname || null, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    setAvatarUrl(`${pub.publicUrl}?v=${Date.now()}`);
    setAvatarMsg("프로필 사진이 변경되었습니다."); setAvatarError(false);
    e.target.value = "";
  };

  // ── 닉네임 ───────────────────────────────────────────────────────────────
  const handleCheckNickname = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) { setNicknameMsg("닉네임은 2자 이상 입력해주세요."); setNicknameError(true); return; }
    const { data, error } = await supabase.rpc("is_nickname_available", { p_nickname: trimmed });
    if (error) {
      if (isSchemaMissing(error)) { setNicknameMsg("supabase-schema.sql 적용 후 사용할 수 있습니다."); setNicknameError(false); return; }
      setNicknameMsg("중복 확인 중 오류가 났습니다."); setNicknameError(true); return;
    }
    if (data === true) { setNicknameMsg("사용 가능한 닉네임입니다."); setNicknameError(false); }
    else { setNicknameMsg("이미 사용 중인 닉네임입니다."); setNicknameError(true); }
  };

  const handleSaveNickname = async () => {
    if (!user) return;
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 16) { setNicknameMsg("2자 이상 16자 이하로 입력해주세요."); setNicknameError(true); return; }
    setNicknameMsg("저장 중..."); setNicknameError(false);
    const { data: updated, error } = await supabase.auth.updateUser({ data: { nickname: trimmed } });
    if (error) { setNicknameMsg("저장에 실패했습니다."); setNicknameError(true); return; }
    setDisplayNickname(updated.user?.user_metadata?.nickname || trimmed);
    const profileErr = await supabase.from("profiles").upsert(
      { id: user.id, nickname: trimmed, avatar_url: updated.user?.user_metadata?.avatar_url || null, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    if (profileErr.error && isSchemaMissing(profileErr.error)) {
      setNicknameMsg("닉네임 저장됨. profiles 테이블을 supabase-schema.sql로 생성해주세요."); setNicknameError(false); return;
    }
    setNicknameMsg("닉네임이 저장되었습니다."); setNicknameError(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); router.refresh();
  };

  // ── 렌더 ─────────────────────────────────────────────────────────────────
  const currentParty = parties[activeParty];

  return (
    <>
      <header className="login-header login-header--simple">
        <Link className="login-brand" href="/" aria-label="메인으로 이동">
          <span className="login-brand-badge">PT</span>
          <span className="login-brand-text">poketier</span>
        </Link>
      </header>

      <main className="profile-page-main">
        {/* ── 상단 2열 ── */}
        <div className="profile-grid">
          {/* 왼쪽: 프로필 */}
          <section className="login-card profile-card profile-card--identity">
            <p className="logo">프로필</p>
            <div className="profile-avatar-wrap">
              <Image className="profile-avatar profile-avatar--photo" src={avatarUrl} alt="프로필 사진"
                width={88} height={88} onError={() => setAvatarUrl(DEFAULT_AVATAR)} unoptimized />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleAvatarChange} />
            <button className="ghost-secondary-btn profile-avatar-btn" type="button" onClick={() => avatarInputRef.current?.click()}>
              프로필 사진 변경
            </button>
            {avatarMsg && <p className={`helper-text${avatarError ? " is-error" : ""}`}>{avatarMsg}</p>}

            <h1>{displayNickname}</h1>

            <div className="profile-nick-block">
              <label className="field-label profile-label-left" htmlFor="nicknameInput">닉네임</label>
              <div className="nickname-row">
                <input id="nicknameInput" className="login-input" type="text" maxLength={16} placeholder="닉네임"
                  value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <button className="ghost-secondary-btn nickname-check-btn" type="button" onClick={handleCheckNickname}>중복 확인</button>
              </div>
              <button className="login-btn profile-save-btn" type="button" onClick={handleSaveNickname}>닉네임 저장</button>
              {nicknameMsg && <p className={`helper-text${nicknameError ? " is-error" : ""}`}>{nicknameMsg}</p>}
            </div>

            <p className="helper-text profile-email">{user?.email || ""}</p>
            <Link href="/" className="login-btn profile-go-main" style={{ textAlign: "center", textDecoration: "none" }}>메인으로 이동</Link>
            <button className="ghost-secondary-btn profile-logout" type="button" onClick={handleLogout}>로그아웃</button>
          </section>

          {/* 오른쪽: 설정 */}
          <section className="login-card profile-card profile-card--settings">
            <h2 className="settings-title">설정</h2>
            <div className="settings-block">
              <span className="field-label">화면 테마</span>
              <div className="theme-toggle" role="group" aria-label="테마 선택">
                <button type="button" className={`theme-btn${theme === "light" ? " is-active" : ""}`} onClick={() => { document.documentElement.setAttribute("data-theme","light"); localStorage.setItem(THEME_KEY,"light"); setTheme("light"); }}>화이트</button>
                <button type="button" className={`theme-btn${theme === "dark"  ? " is-active" : ""}`} onClick={() => { document.documentElement.setAttribute("data-theme","dark");  localStorage.setItem(THEME_KEY,"dark");  setTheme("dark");  }}>다크</button>
              </div>
            </div>
            <div className="settings-block settings-block--contact">
              <span className="field-label">문의</span>
              <p className="contact-copy">서비스 이용·버그 제보·제휴 등은 아래로 연락 주세요.</p>
              <a className="contact-link" href="mailto:poketier@example.com">이메일 문의하기</a>
              <p className="helper-text contact-hint">운영 메일 주소는 배포 시 실제 주소로 바꿔주세요.</p>
            </div>
          </section>
        </div>

        {/* ── 파티 빌더 ── */}
        <section className="party-section">
          {/* 파티 탭 + 액션 */}
          <div className="party-top-bar">
            <div className="party-tabs">
              {Array.from({ length: PARTY_COUNT }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`party-tab${activeParty === i ? " is-active" : ""}`}
                  onClick={() => setActiveParty(i)}
                >
                  파티 {i + 1}
                </button>
              ))}
            </div>

            <div className="party-actions">
              <button type="button" className="ghost-secondary-btn party-action-btn" onClick={handleCopyParty} title="현재 파티를 클립보드에 복사">복사</button>
              <button type="button" className="ghost-secondary-btn party-action-btn" onClick={handlePasteParty} title="클립보드에서 파티 붙여넣기">붙여넣기</button>
              <button type="button" className="login-btn party-save-btn" disabled={partySaving} onClick={handleSaveParty}>
                {partySaving ? "저장 중..." : "파티 저장"}
              </button>
            </div>
          </div>

          {partyMsg && <p className="helper-text party-msg">{partyMsg}</p>}

          {/* 6슬롯 그리드 */}
          {/* datalist: 포켓몬 자동완성 */}
          <datalist id="pkm-list">
            {pokemonData.map(p => <option key={p.slug} value={p.nameKo} />)}
          </datalist>
          {/* datalist: 아이템 자동완성 */}
          <datalist id="item-list">
            {ITEMS.map(it => <option key={it} value={it} />)}
          </datalist>

          <div className="party-slots-grid">
            {currentParty.slots.map((slot, si) => {
              const match      = pokemonData.find(p => p.nameKo === slot.pokemon);
              const abilities  = match ? (abilityCache[match.slug] ?? []) : [];
              const sdId       = match ? toShowdownId(match.slug) : "";
              const learnset   = (sdId ? (LEARNSETS[sdId] ?? []) : [])
                .slice()
                .sort((a, b) =>
                  (MOVES_KO[a]?.name ?? a).localeCompare(MOVES_KO[b]?.name ?? b, "ko")
                );
              const evTotal    = slot.evs.reduce((a, b) => a + b, 0);
              const moveFull   = slot.moves.length >= MOVE_COUNT;

              return (
                <div key={si} className="login-card party-slot-card">
                  {/* 헤더 */}
                  <div className="party-slot-header">
                    <span className="party-slot-num">{si + 1}</span>
                    <button type="button" className="party-slot-reset" onClick={() => clearSlot(activeParty, si)}>초기화</button>
                  </div>

                  {/* 포켓몬 */}
                  <div className="party-field">
                    <label className="party-field-label">포켓몬</label>
                    <div className="party-pokemon-row">
                      {match?.artwork
                        ? <Image src={match.artwork} alt={match.nameKo} width={44} height={44} className="party-pokemon-sprite" unoptimized />
                        : <div className="party-pokemon-sprite party-pokemon-sprite--empty" />}
                      <input
                        list="pkm-list"
                        className="party-field-input"
                        type="text"
                        placeholder="포켓몬 검색..."
                        value={slot.pokemon}
                        onChange={(e) => handlePokemonChange(activeParty, si, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 성격 + 도구 */}
                  <div className="party-two-col">
                    <div className="party-field">
                      <label className="party-field-label">성격</label>
                      <select
                        className="party-field-select"
                        value={slot.nature}
                        onChange={(e) => updateSlot(activeParty, si, "nature", e.target.value)}
                      >
                        <option value="">선택</option>
                        {NATURES.map(n => (
                          <option key={n.name} value={n.name}>
                            {n.name}{n.note ? ` (${n.note})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="party-field">
                      <label className="party-field-label">도구</label>
                      <SearchSelect
                        listId={`item-${si}`}
                        value={slot.item}
                        onChange={(v) => updateSlot(activeParty, si, "item", v)}
                        options={ITEMS}
                        placeholder="지닌물건 검색..."
                      />
                    </div>
                  </div>

                  {/* 특성 */}
                  <div className="party-field">
                    <label className="party-field-label">특성</label>
                    {abilities.length > 0 ? (
                      <div className="party-ability-chips">
                        {abilities.map(ab => (
                          <button
                            key={ab.name}
                            type="button"
                            className={`party-ability-chip${ab.isHidden ? " is-hidden" : ""}${slot.ability === ab.name ? " is-selected" : ""}`}
                            onClick={() => updateSlot(activeParty, si, "ability", slot.ability === ab.name ? "" : ab.name)}
                            title={ab.isHidden ? "숨겨진특성" : ""}
                          >
                            {ab.name}
                            {ab.isHidden && <span className="party-ability-hidden-mark">숨</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="party-field-input"
                        type="text"
                        placeholder={match ? "로딩 중..." : "포켓몬 선택 후 자동 표시"}
                        value={slot.ability}
                        onChange={(e) => updateSlot(activeParty, si, "ability", e.target.value)}
                        readOnly={!!match}
                      />
                    )}
                  </div>

                  {/* 기술 */}
                  <div className="party-field">
                    <div className="party-ev-header">
                      <label className="party-field-label">기술</label>
                      <span className="party-ev-total">{slot.moves.length} / {MOVE_COUNT}</span>
                    </div>

                    {/* 검색 datalist */}
                    {learnset.length > 0 && !moveFull && (
                      <>
                        <datalist id={`move-list-${activeParty}-${si}`}>
                          {learnset
                            .filter(id => !slot.moves.includes(id))
                            .map(id => (
                              <option
                                key={id}
                                value={MOVES_KO[id]?.name ?? id}
                                data-id={id}
                              />
                            ))}
                        </datalist>
                        <input
                          list={`move-list-${activeParty}-${si}`}
                          className="party-field-input party-move-search"
                          type="text"
                          placeholder="기술 검색..."
                          value=""
                          onChange={(e) => {
                            const typed = e.target.value;
                            const found = learnset.find(
                              id => (MOVES_KO[id]?.name ?? id) === typed
                            );
                            if (found) {
                              toggleMove(activeParty, si, found);
                              e.target.value = "";
                            }
                          }}
                        />
                      </>
                    )}

                    {/* 선택된 기술 목록 */}
                    {slot.moves.length > 0 ? (
                      <ul className="party-move-list">
                        {slot.moves.map(moveId => {
                          const mv = MOVES_KO[moveId];
                          const type = mv?.type ?? "normal";
                          return (
                            <li key={moveId} className="party-move-item">
                              <img
                                src={typeIconUrl(type)}
                                alt={TYPE_KO[type] ?? type}
                                className="party-move-type-icon"
                                title={TYPE_KO[type] ?? type}
                              />
                              <span className="party-move-name">{mv?.name ?? moveId}</span>
                              <button
                                type="button"
                                className="party-move-remove"
                                onClick={() => toggleMove(activeParty, si, moveId)}
                                aria-label="기술 제거"
                              >✕</button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="party-moves-empty">
                        {learnset.length > 0 ? "위에서 기술 검색" : match ? "기술 데이터 없음" : "포켓몬 선택 후 표시"}
                      </p>
                    )}
                  </div>

                  {/* 대체 기술 (선택) */}
                  <div className="party-field party-alt-move-field">
                    <label className="party-field-label">
                      대체 기술&nbsp;<span className="party-alt-optional">(선택)</span>
                    </label>
                    {learnset.length > 0 ? (
                      slot.altMove ? (
                        <div className="party-move-item party-alt-move-item">
                          <img
                            src={typeIconUrl(MOVES_KO[slot.altMove]?.type ?? "normal")}
                            alt={TYPE_KO[MOVES_KO[slot.altMove]?.type ?? "normal"] ?? ""}
                            className="party-move-type-icon"
                          />
                          <span className="party-move-name">{MOVES_KO[slot.altMove]?.name ?? slot.altMove}</span>
                          <button
                            type="button"
                            className="party-move-remove"
                            onClick={() => setAltMove(activeParty, si, "")}
                            aria-label="대체 기술 제거"
                          >✕</button>
                        </div>
                      ) : (
                        <>
                          <datalist id={`alt-move-${activeParty}-${si}`}>
                            {learnset.map(id => (
                              <option key={id} value={MOVES_KO[id]?.name ?? id} />
                            ))}
                          </datalist>
                          <input
                            list={`alt-move-${activeParty}-${si}`}
                            className="party-field-input party-move-search"
                            type="text"
                            placeholder="대체 기술 검색..."
                            value=""
                            onChange={(e) => {
                              const typed = e.target.value;
                              const found = learnset.find(id => (MOVES_KO[id]?.name ?? id) === typed);
                              if (found) {
                                setAltMove(activeParty, si, found);
                                e.target.value = "";
                              }
                            }}
                          />
                        </>
                      )
                    ) : (
                      <p className="party-moves-empty">
                        {match ? "기술 데이터 없음" : "포켓몬 선택 후 표시"}
                      </p>
                    )}
                  </div>

                  {/* 노력치 */}
                  <div className="party-field">
                    <div className="party-ev-header">
                      <label className="party-field-label">노력치</label>
                      <span className={`party-ev-total${evTotal > EV_TOTAL_MAX ? " is-over" : ""}`}>
                        합계 {evTotal} / {EV_TOTAL_MAX}
                      </span>
                    </div>
                    <div className="party-ev-grid">
                      {EV_STATS.map((stat, ei) => {
                        const val      = slot.evs[ei];
                        const sumOther = slot.evs.reduce((a, v, i) => i === ei ? a : a + v, 0);
                        const maxForThis = Math.max(0, Math.min(EV_MAX, EV_TOTAL_MAX - sumOther));
                        const isOver   = val > EV_MAX || val + sumOther > EV_TOTAL_MAX;
                        return (
                          <div key={stat} className="party-ev-cell">
                            <span className="party-ev-label">{stat}</span>
                            <div className="party-ev-controls">
                              <button
                                type="button"
                                className="party-ev-btn"
                                title="0으로"
                                onClick={() => setEvBtn(activeParty, si, ei, 0)}
                              >0</button>
                              <button
                                type="button"
                                className="party-ev-btn"
                                title="-1"
                                onClick={() => setEvBtn(activeParty, si, ei, val - 1)}
                              >−</button>
                              <input
                                className={`party-ev-input${isOver ? " is-invalid" : ""}`}
                                type="number"
                                min={0}
                                value={val === 0 ? "" : val}
                                placeholder="0"
                                title={isOver ? (val > EV_MAX ? "최대 32까지 가능" : `합계 초과 (${evTotal}/${EV_TOTAL_MAX})`) : ""}
                                onChange={(e) => updateEv(activeParty, si, ei, e.target.value)}
                              />
                              <button
                                type="button"
                                className="party-ev-btn"
                                title="+1"
                                onClick={() => setEvBtn(activeParty, si, ei, val + 1)}
                              >+</button>
                              <button
                                type="button"
                                className="party-ev-btn party-ev-btn--max"
                                title={`최대 ${maxForThis}`}
                                onClick={() => setEvBtn(activeParty, si, ei, maxForThis)}
                              >최대</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
