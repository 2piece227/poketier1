"use client";
import { useState, useCallback } from "react";
import pokemonData from "@/data/pokemon.json";
import { ITEMS } from "@/data/items";
import { ABILITY_CORRECTIONS } from "@/data/ability-corrections";
import champLearnsets from "@/data/champions-learnsets.json";
import movesKo from "@/data/moves-ko.json";
import {
  NATURES, EV_MAX, EV_TOTAL_MAX, MOVE_COUNT, EV_STATS,
  TYPE_KO, typeIconUrl, toShowdownId,
  emptySlot,
  type PokemonSlot, type EvTuple,
} from "@/lib/party-constants";

const LEARNSETS = champLearnsets as Record<string, string[]>;
const MOVES_KO  = movesKo as Record<string, { name: string; type: string }>;

interface AbilityInfo { name: string; isHidden: boolean; }

interface PartyBuilderProps {
  slots    : PokemonSlot[];
  onChange : (newSlots: PokemonSlot[]) => void;
  idPrefix ?: string;  // datalist ID 충돌 방지 (기본 "pb")
}

export default function PartyBuilder({ slots, onChange, idPrefix = "pb" }: PartyBuilderProps) {
  const [abilityCache, setAbilityCache] = useState<Record<string, AbilityInfo[]>>({});

  const fetchAbility = useCallback(async (slug: string) => {
    if (abilityCache[slug]) return;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}/`);
      if (!res.ok) return;
      const json = await res.json();
      const abilities: AbilityInfo[] = (json.abilities as { ability: { name: string }; is_hidden: boolean }[]).map(a => ({
        name: (ABILITY_CORRECTIONS as Record<string, string>)[a.ability.name] ?? a.ability.name,
        isHidden: a.is_hidden,
      }));
      setAbilityCache(prev => ({ ...prev, [slug]: abilities }));
    } catch { /* 무시 */ }
  }, [abilityCache]);

  // ── 슬롯 업데이트 헬퍼 ────────────────────────────────────────────────────
  const updateSlot = (si: number, patch: Partial<PokemonSlot>) => {
    onChange(slots.map((s, i) => i === si ? { ...s, ...patch } : s));
  };
  const resetSlot = (si: number) => {
    onChange(slots.map((s, i) => i === si ? emptySlot() : s));
  };

  // ── 노력치 ─────────────────────────────────────────────────────────────────
  const setEvBtn = (si: number, ei: number, raw: number) => {
    const slot = slots[si];
    const sumOther = slot.evs.reduce((a, v, i) => i === ei ? a : a + v, 0);
    const val = Math.max(0, Math.min(EV_MAX, EV_TOTAL_MAX - sumOther, raw));
    const evs = [...slot.evs] as EvTuple;
    evs[ei] = val;
    updateSlot(si, { evs });
  };
  const updateEv = (si: number, ei: number, raw: string) => {
    const parsed = parseInt(raw, 10);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    const evs = [...slots[si].evs] as EvTuple;
    evs[ei] = val;
    updateSlot(si, { evs });
  };

  // ── 기술 ──────────────────────────────────────────────────────────────────
  const toggleMove = (si: number, moveId: string) => {
    const slot = slots[si];
    if (slot.moves.includes(moveId)) {
      updateSlot(si, { moves: slot.moves.filter(m => m !== moveId) });
    } else if (slot.moves.length < MOVE_COUNT) {
      updateSlot(si, { moves: [...slot.moves, moveId] });
    }
  };

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="party-slots-grid">
      {slots.map((slot, si) => {
        const match     = pokemonData.find(p => p.nameKo === slot.pokemon);
        const abilities = match ? (abilityCache[match.slug] ?? []) : [];
        const sdId      = match ? toShowdownId(match.slug) : "";
        const learnset  = (sdId ? (LEARNSETS[sdId] ?? []) : [])
          .slice()
          .sort((a, b) => (MOVES_KO[a]?.name ?? a).localeCompare(MOVES_KO[b]?.name ?? b, "ko"));
        const evTotal   = slot.evs.reduce((a, b) => a + b, 0);
        const moveFull  = slot.moves.length >= MOVE_COUNT;

        if (match && !abilityCache[match.slug]) fetchAbility(match.slug);

        const p = `${idPrefix}-${si}`;   // datalist prefix

        return (
          <div key={si} className="login-card party-slot-card">
            {/* 헤더 */}
            <div className="party-slot-header">
              <span className="party-slot-num">{si + 1}</span>
              <button type="button" className="party-slot-reset" onClick={() => resetSlot(si)}>초기화</button>
            </div>

            {/* 포켓몬 */}
            <div className="party-field">
              <label className="party-field-label">포켓몬</label>
              <div className="party-pokemon-row">
                {match?.artwork
                  ? <img src={match.artwork} alt={match.nameKo} className="party-pokemon-sprite" />
                  : <span className="party-pokemon-sprite--empty" />}
                <datalist id={`${p}-pkm`}>
                  {pokemonData.map(pk => <option key={pk.slug} value={pk.nameKo} />)}
                </datalist>
                <input
                  list={`${p}-pkm`}
                  className="party-field-input"
                  type="text"
                  placeholder="포켓몬 검색..."
                  value={slot.pokemon}
                  onChange={e => {
                    const val = e.target.value;
                    const found = pokemonData.find(pk => pk.nameKo === val);
                    updateSlot(si, {
                      pokemon: val,
                      ...(found ? {} : { ability: "", moves: [], altMove: "" }),
                    });
                    if (found) fetchAbility(found.slug);
                  }}
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
                  onChange={e => updateSlot(si, { nature: e.target.value })}
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
                <datalist id={`${p}-item`}>
                  {ITEMS.map(it => <option key={it} value={it} />)}
                </datalist>
                <input
                  list={`${p}-item`}
                  className="party-field-input"
                  type="text"
                  placeholder="도구 검색..."
                  value={slot.item}
                  onChange={e => updateSlot(si, { item: e.target.value })}
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
                      className={`party-ability-chip${slot.ability === ab.name ? " is-selected" : ""}${ab.isHidden ? " is-hidden" : ""}`}
                      onClick={() => updateSlot(si, { ability: ab.name })}
                    >
                      {ab.name}
                      {ab.isHidden && <span className="party-ability-hidden-mark">숨</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="party-moves-empty">
                  {match ? "특성 로딩 중..." : "포켓몬 선택 후 자동 표시"}
                </p>
              )}
            </div>

            {/* 기술 */}
            <div className="party-field">
              <div className="party-ev-header">
                <label className="party-field-label">기술</label>
                <span className="party-ev-total">{slot.moves.length} / {MOVE_COUNT}</span>
              </div>
              {learnset.length > 0 && !moveFull && (
                <>
                  <datalist id={`${p}-move`}>
                    {learnset.filter(id => !slot.moves.includes(id)).map(id => (
                      <option key={id} value={MOVES_KO[id]?.name ?? id} />
                    ))}
                  </datalist>
                  <input
                    list={`${p}-move`}
                    className="party-field-input party-move-search"
                    type="text"
                    placeholder="기술 검색..."
                    value=""
                    onChange={e => {
                      const typed = e.target.value;
                      const found = learnset.find(id => (MOVES_KO[id]?.name ?? id) === typed);
                      if (found) { toggleMove(si, found); e.target.value = ""; }
                    }}
                  />
                </>
              )}
              {slot.moves.length > 0 ? (
                <ul className="party-move-list">
                  {slot.moves.map(moveId => {
                    const mv = MOVES_KO[moveId];
                    return (
                      <li key={moveId} className="party-move-item">
                        <img src={typeIconUrl(mv?.type ?? "normal")} alt={TYPE_KO[mv?.type ?? "normal"] ?? ""} className="party-move-type-icon" />
                        <span className="party-move-name">{mv?.name ?? moveId}</span>
                        <button type="button" className="party-move-remove" onClick={() => toggleMove(si, moveId)}>✕</button>
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

            {/* 대체 기술 */}
            <div className="party-field party-alt-move-field">
              <label className="party-field-label">
                대체 기술&nbsp;<span className="party-alt-optional">(선택)</span>
              </label>
              {learnset.length > 0 ? (
                slot.altMove ? (
                  <div className="party-move-item party-alt-move-item">
                    <img src={typeIconUrl(MOVES_KO[slot.altMove]?.type ?? "normal")} alt="" className="party-move-type-icon" />
                    <span className="party-move-name">{MOVES_KO[slot.altMove]?.name ?? slot.altMove}</span>
                    <button type="button" className="party-move-remove" onClick={() => updateSlot(si, { altMove: "" })}>✕</button>
                  </div>
                ) : (
                  <>
                    <datalist id={`${p}-alt`}>
                      {learnset.map(id => <option key={id} value={MOVES_KO[id]?.name ?? id} />)}
                    </datalist>
                    <input
                      list={`${p}-alt`}
                      className="party-field-input"
                      type="text"
                      placeholder="대체 기술 검색..."
                      value=""
                      onChange={e => {
                        const typed = e.target.value;
                        const found = learnset.find(id => (MOVES_KO[id]?.name ?? id) === typed);
                        if (found) { updateSlot(si, { altMove: found }); e.target.value = ""; }
                      }}
                    />
                  </>
                )
              ) : (
                <p className="party-moves-empty">{match ? "기술 데이터 없음" : "포켓몬 선택 후 표시"}</p>
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
                  const isOver = slot.evs[ei] > EV_MAX || evTotal > EV_TOTAL_MAX;
                  return (
                    <div key={stat} className="party-ev-cell">
                      <span className="party-ev-label">{stat}</span>
                      <div className="party-ev-controls">
                        <button type="button" className="party-ev-btn" onClick={() => setEvBtn(si, ei, 0)}>0</button>
                        <button type="button" className="party-ev-btn" onClick={() => setEvBtn(si, ei, slot.evs[ei] - 1)}>−</button>
                        <input
                          type="number"
                          min={0}
                          max={EV_MAX}
                          className={`party-ev-input${isOver ? " is-invalid" : ""}`}
                          value={slot.evs[ei]}
                          onChange={e => updateEv(si, ei, e.target.value)}
                        />
                        <button type="button" className="party-ev-btn" onClick={() => setEvBtn(si, ei, slot.evs[ei] + 1)}>+</button>
                        <button type="button" className="party-ev-btn party-ev-btn--max" onClick={() => setEvBtn(si, ei, EV_MAX)}>최대</button>
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
  );
}
