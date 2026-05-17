const parseRoles = (raw) =>
  String(raw || "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const tierSections = () => document.querySelectorAll(".tier-section");

const applyTierFilter = (activeKey) => {
  document.querySelectorAll("[data-role-filter]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.roleFilter === activeKey);
  });

  document.querySelectorAll(".tier-mon").forEach((el) => {
    const roles = parseRoles(el.dataset.roles);
    const show =
      activeKey === "all" || roles.length === 0 || roles.includes(activeKey);
    el.hidden = !show;
  });

  tierSections().forEach((section) => {
    const visible = [...section.querySelectorAll(".tier-mon")].some((m) => !m.hidden);
    section.classList.toggle("tier-section--empty", !visible);
  });
};

document.querySelectorAll("[data-role-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    applyTierFilter(btn.dataset.roleFilter || "all");
  });
});

applyTierFilter("all");
