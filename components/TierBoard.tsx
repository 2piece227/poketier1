"use client";
import { useState } from "react";

const ROLES = [
  { key: "all", label: "전체" },
  { key: "physical", label: "물리 딜러" },
  { key: "special", label: "특수 딜러" },
  { key: "physical-tank", label: "물리 막이" },
  { key: "special-tank", label: "특수 막이" },
  { key: "pivot", label: "기점잡이" },
] as const;

type RoleKey = (typeof ROLES)[number]["key"];

const TAG_LABELS: Record<string, string> = {
  physical: "물딜",
  special: "특딜",
  "physical-tank": "물막",
  "special-tank": "특막",
  pivot: "기점",
};

interface Mon {
  name: string;
  roles: string[];
}

interface Tier {
  num: number;
  title: string;
  hint: string;
  mons: Mon[];
}

const TIERS: Tier[] = [
  { num: 1, title: "1티어", hint: "최상위", mons: [
    { name: "샘플 A", roles: ["physical", "special"] },
    { name: "샘플 B", roles: ["pivot", "physical-tank"] },
  ]},
  { num: 2, title: "2티어", hint: "상위권", mons: [
    { name: "샘플 C", roles: ["special", "special-tank"] },
    { name: "샘플 D", roles: ["physical"] },
  ]},
  { num: 3, title: "3티어", hint: "중위", mons: [
    { name: "샘플 E", roles: ["physical-tank", "pivot"] },
    { name: "샘플 F", roles: ["special"] },
  ]},
  { num: 4, title: "4티어", hint: "실전 보조", mons: [
    { name: "샘플 G", roles: ["special-tank"] },
  ]},
  { num: 5, title: "5티어", hint: "참고", mons: [
    { name: "샘플 H", roles: ["physical", "pivot"] },
  ]},
];

export default function TierBoard() {
  const [active, setActive] = useState<RoleKey>("all");

  const visible = (roles: string[]) =>
    active === "all" || roles.length === 0 || roles.includes(active);

  return (
    <>
      <div className="tier-filter">
        <span className="tier-filter-label">역할 범주</span>
        <div className="tier-filter-chips" role="group" aria-label="역할 필터">
          {ROLES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={active === key ? "is-active" : undefined}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="tier-board">
        {TIERS.map((tier) => {
          const visibleMons = tier.mons.filter((m) => visible(m.roles));
          const isEmpty = visibleMons.length === 0;
          return (
            <section
              key={tier.num}
              className={`tier-section${isEmpty ? " tier-section--empty" : ""}`}
              aria-labelledby={`tier-${tier.num}-title`}
            >
              <div className="tier-section-inner">
                <div className="tier-rank">
                  <span className={`tier-num tier-num--${tier.num}`} aria-hidden="true">
                    {tier.num}
                  </span>
                  <div>
                    <p id={`tier-${tier.num}-title`} className="tier-rank-title">{tier.title}</p>
                    <p className="tier-rank-hint">{tier.hint}</p>
                  </div>
                </div>
                <div className="tier-mons">
                  {visibleMons.map((mon) => (
                    <div key={mon.name} className="tier-mon">
                      <span>{mon.name}</span>
                      <span className="tier-mon-roles">
                        {mon.roles.map((r) => (
                          <span key={r} className={`tier-tag tier-tag--${r}`}>
                            {TAG_LABELS[r] ?? r}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                  {isEmpty && (
                    <p className="tier-empty-hint">
                      이 티어에서 선택한 역할에 맞는 포켓몬이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
