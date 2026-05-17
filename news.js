const parseCats = (raw) =>
  String(raw || "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

const applyNewsFilter = (activeKey) => {
  document.querySelectorAll("[data-news-filter]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.newsFilter === activeKey);
  });

  document.querySelectorAll(".news-card[data-cats]").forEach((card) => {
    const cats = parseCats(card.dataset.cats);
    const show =
      activeKey === "all" || cats.length === 0 || cats.includes(activeKey);
    card.hidden = !show;
  });

  const featured = document.querySelector(".news-featured");
  if (!featured) return;
  const fc = featured.dataset.cats;
  const fCats = parseCats(fc);
  const showFeatured =
    activeKey === "all" || fCats.length === 0 || fCats.includes(activeKey);
  featured.hidden = !showFeatured;
};

document.querySelectorAll("[data-news-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    applyNewsFilter(btn.dataset.newsFilter || "all");
  });
});

applyNewsFilter("all");
