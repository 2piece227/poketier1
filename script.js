const track = document.querySelector("#issueTrack");
const prevButton = document.querySelector("#slidePrev");
const nextButton = document.querySelector("#slideNext");
const GAP = 16;
let currentIndex = 0;
let isAnimating = false;
let stepPx = 300;
/** transitionend 미발생(이동량 0·브라우저 이슈) 시 잠금 해제 */
let slideAnimTimer = null;
const SLIDE_ANIM_FALLBACK_MS = 400;

const getGapPx = () => {
  const computed = track ? getComputedStyle(track) : null;
  const gapStr = computed?.gap || computed?.columnGap || computed?.rowGap;
  const parsed = Number.parseFloat(gapStr || "");
  return Number.isFinite(parsed) ? parsed : GAP;
};

const recalcStep = () => {
  if (!track) return;
  const firstCard = track.querySelector(".issue-card");
  if (!firstCard) return;
  const gapPx = getGapPx();
  stepPx = firstCard.getBoundingClientRect().width + gapPx;
};

const getCardCount = () => {
  if (!track) return 0;
  return track.querySelectorAll(".issue-card").length;
};

/** 보이는 영역 오른쪽에 트랙 ‘바닥’이 드러나지 않도록 하는 최대 이동량(px) */
const getMaxTranslatePx = () => {
  if (!track) return 0;
  const wrap = track.parentElement;
  if (!wrap) return 0;
  return Math.max(0, track.scrollWidth - wrap.clientWidth);
};

const getOffsetForIndex = (idx) => {
  if (!track) return 0;
  recalcStep();
  const maxT = getMaxTranslatePx();
  return Math.min(stepPx * Math.max(0, idx), maxT);
};

/** 카드 단위 이동과 끝에서의 여백 방지를 함께 만족하는 오프셋 */
const getClampedOffsetPx = () => getOffsetForIndex(currentIndex);

const setPosition = (withTransition) => {
  if (!track) return;
  const offset = getClampedOffsetPx();
  track.style.transition = withTransition ? "transform 260ms ease" : "none";
  track.style.transform = `translateX(${-offset}px)`;
};

const updateNavButtons = () => {
  const n = getCardCount();
  if (n < 1) return;
  const maxIndex = n - 1;
  const cur = getOffsetForIndex(currentIndex);
  const canPrev =
    currentIndex > 0 && getOffsetForIndex(currentIndex - 1) < cur - 0.5;
  const canNext =
    currentIndex < maxIndex && getOffsetForIndex(currentIndex + 1) > cur + 0.5;
  if (prevButton) {
    prevButton.disabled = !canPrev;
    prevButton.setAttribute("aria-disabled", String(prevButton.disabled));
  }
  if (nextButton) {
    nextButton.disabled = !canNext;
    nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
  }
};

const clearSlideAnimTimer = () => {
  if (slideAnimTimer != null) {
    window.clearTimeout(slideAnimTimer);
    slideAnimTimer = null;
  }
};

const endSlideAnim = () => {
  clearSlideAnimTimer();
  isAnimating = false;
};

const moveSlide = (direction) => {
  if (!track) return;
  const n = getCardCount();
  if (n < 1) return;
  const maxIndex = n - 1;
  if (isAnimating) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex > maxIndex) return;

  const from = getOffsetForIndex(currentIndex);
  const to = getOffsetForIndex(nextIndex);
  if (Math.abs(to - from) < 0.5) return;

  clearSlideAnimTimer();
  isAnimating = true;
  slideAnimTimer = window.setTimeout(endSlideAnim, SLIDE_ANIM_FALLBACK_MS);

  currentIndex = nextIndex;
  setPosition(true);
  updateNavButtons();
};

const initIssueCarousel = () => {
  if (!track) return;
  const n = getCardCount();
  if (n < 1) return;
  currentIndex = Math.min(Math.max(0, currentIndex), n - 1);
  recalcStep();
  setPosition(false);
  updateNavButtons();
  requestAnimationFrame(() => {
    recalcStep();
    setPosition(false);
    updateNavButtons();
  });
};

if (track) {
  initIssueCarousel();

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    endSlideAnim();
  });

  window.addEventListener("resize", () => {
    const n = getCardCount();
    if (n < 1) return;
    endSlideAnim();
    currentIndex = Math.min(currentIndex, n - 1);
    recalcStep();
    setPosition(false);
    updateNavButtons();
  });
}

if (prevButton) {
  prevButton.addEventListener("click", () => moveSlide(-1));
}

if (nextButton) {
  nextButton.addEventListener("click", () => moveSlide(1));
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    moveSlide(-1);
  } else if (event.key === "ArrowRight") {
    moveSlide(1);
  }
});

if (track) {
  track.addEventListener("mouseenter", () => {
    track.style.transitionDuration = "340ms";
  });

  track.addEventListener("mouseleave", () => {
    track.style.transitionDuration = "260ms";
  });
}

const loginBtn = document.querySelector("#loginBtn");
const profileBtn = document.querySelector("#profileBtn");
const logoutBtn = document.querySelector("#logoutBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "./login.html";
  });
}

const parseEnvText = (text) => {
  const env = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  });
  return env;
};

const finishAuthGate = () => {
  document.documentElement.classList.remove("auth-checking");
  document.documentElement.classList.add("auth-ready");
};

const initAuth = async () => {
  if (!window.supabase || !window.supabase.createClient) {
    finishAuthGate();
    return;
  }

  let envText = "";
  try {
    const envRes = await fetch("./supa.env", { cache: "no-store" });
    if (!envRes.ok) throw new Error("supa.env 로드 실패");
    envText = await envRes.text();
  } catch (error) {
    console.error(error);
    finishAuthGate();
    return;
  }

  const env = parseEnvText(envText);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    finishAuthGate();
    return;
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  const renderAuthState = async () => {
    const { data } = await client.auth.getUser();
    const user = data?.user;
    if (!user) {
      if (loginBtn) loginBtn.hidden = false;
      if (profileBtn) profileBtn.hidden = true;
      if (logoutBtn) logoutBtn.hidden = true;
      return true;
    }

    const nickname = user.user_metadata?.nickname;
    if (!nickname) {
      window.location.href = "./nickname.html";
      return false;
    }

    if (loginBtn) loginBtn.hidden = true;
    if (profileBtn) profileBtn.hidden = false;
    if (logoutBtn) logoutBtn.hidden = false;
    return true;
  };
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      window.location.href = "./profile.html";
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await client.auth.signOut();
      window.location.href = "./index.html";
      await renderAuthState();
    });
  }

  client.auth.onAuthStateChange(() => {
    renderAuthState();
  });

  const stay = await renderAuthState();
  if (stay) finishAuthGate();
};

initAuth();
