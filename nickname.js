const nicknameInput = document.querySelector("#nicknameInput");
const saveNicknameBtn = document.querySelector("#saveNicknameBtn");
const nicknameError = document.querySelector("#nicknameError");

const finishAuthGate = () => {
  document.documentElement.classList.remove("auth-checking");
  document.documentElement.classList.add("auth-ready");
};

const parseEnvText = (text) => {
  const env = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  });
  return env;
};

const setError = (message) => {
  if (!nicknameError) return;
  nicknameError.hidden = !message;
  nicknameError.textContent = message || "";
};

const initNickname = async () => {
  if (!window.supabase?.createClient) {
    finishAuthGate();
    setError("Supabase를 불러오지 못했습니다.");
    return;
  }

  let env;
  try {
    const envRes = await fetch("./supa.env", { cache: "no-store" });
    if (!envRes.ok) throw new Error("supa.env");
    env = parseEnvText(await envRes.text());
  } catch {
    finishAuthGate();
    setError("환경 설정을 불러오지 못했습니다.");
    return;
  }

  const client = window.supabase.createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data } = await client.auth.getUser();
  const user = data?.user;
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const currentNickname = user.user_metadata?.nickname;
  if (currentNickname) {
    window.location.href = "./index.html";
    return;
  }

  saveNicknameBtn?.addEventListener("click", async () => {
    const nickname = (nicknameInput?.value || "").trim();
    if (nickname.length < 2 || nickname.length > 16) {
      setError("닉네임은 2자 이상 16자 이하로 입력해주세요.");
      return;
    }
    const { error } = await client.auth.updateUser({
      data: { nickname },
    });
    if (error) {
      setError("닉네임 저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    await client.from("profiles").upsert(
      { id: user.id, nickname, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    window.location.href = "./index.html";
  });

  finishAuthGate();
};

initNickname().catch(() => {
  setError("초기화 중 문제가 발생했습니다.");
  finishAuthGate();
});
