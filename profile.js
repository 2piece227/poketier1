const profileNickname = document.querySelector("#profileNickname");
const profileEmail = document.querySelector("#profileEmail");
const profileAvatarImg = document.querySelector("#profileAvatarImg");
const avatarInput = document.querySelector("#avatarInput");
const avatarChangeBtn = document.querySelector("#avatarChangeBtn");
const avatarMsg = document.querySelector("#avatarMsg");
const profileLogoutBtn = document.querySelector("#profileLogoutBtn");
const goMainBtn = document.querySelector("#goMainBtn");
const nicknameInput = document.querySelector("#nicknameInput");
const checkNicknameBtn = document.querySelector("#checkNicknameBtn");
const saveNicknameBtn = document.querySelector("#saveNicknameBtn");
const nicknameMsg = document.querySelector("#nicknameMsg");
const themeLightBtn = document.querySelector("#themeLightBtn");
const themeDarkBtn = document.querySelector("#themeDarkBtn");

const THEME_KEY = "poketier-theme";
const AVATAR_BUCKET = "avatars";
const DEFAULT_AVATAR = "./assets/default-avatar.png";

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

const applyTheme = (mode) => {
  const next = mode === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  themeLightBtn?.classList.toggle("is-active", next === "light");
  themeDarkBtn?.classList.toggle("is-active", next === "dark");
};

/** 마지막으로 표시에 성공한 원격/기본 URL (업로드 실패 시 복구용, blob 제외) */
let lastStableAvatarUrl = DEFAULT_AVATAR;

const setAvatarFromUrl = (url, bustCache = false) => {
  if (!profileAvatarImg) return;
  let next = url && String(url).trim() ? String(url).trim() : DEFAULT_AVATAR;
  if (next !== DEFAULT_AVATAR && bustCache) {
    const sep = next.includes("?") ? "&" : "?";
    next = `${next}${sep}v=${Date.now()}`;
  }
  profileAvatarImg.src = next;
  profileAvatarImg.onerror = () => {
    profileAvatarImg.src = DEFAULT_AVATAR;
    lastStableAvatarUrl = DEFAULT_AVATAR;
  };
  profileAvatarImg.onload = () => {
    if (!profileAvatarImg.src.startsWith("blob:")) {
      lastStableAvatarUrl = profileAvatarImg.src.split("?")[0];
    }
  };
};

const setAvatarMsg = (text, isError) => {
  if (!avatarMsg) return;
  avatarMsg.hidden = !text;
  avatarMsg.textContent = text || "";
  avatarMsg.classList.toggle("is-error", Boolean(isError));
};

const initThemeUi = () => {
  const saved = localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  applyTheme(saved);
  themeLightBtn?.addEventListener("click", () => applyTheme("light"));
  themeDarkBtn?.addEventListener("click", () => applyTheme("dark"));
};

const setNicknameMsg = (text, isError) => {
  if (!nicknameMsg) return;
  nicknameMsg.hidden = !text;
  nicknameMsg.textContent = text || "";
  nicknameMsg.classList.toggle("is-error", Boolean(isError));
};

const isSchemaMissing = (error) => {
  const msg = error?.message || "";
  return msg.includes("schema cache") || msg.includes("does not exist") || error?.code === "PGRST202";
};

const upsertProfileRow = async (client, userId, payload) => {
  const { error } = await client.from("profiles").upsert(
    { id: userId, updated_at: new Date().toISOString(), ...payload },
    { onConflict: "id" }
  );
  return error;
};

const checkNicknameAvailable = async (client, rawNick) => {
  const nick = (rawNick || "").trim();
  if (nick.length < 2) {
    return { ok: false, message: "닉네임은 2자 이상 입력해주세요.", skip: false };
  }
  const { data, error } = await client.rpc("is_nickname_available", {
    p_nickname: nick,
  });
  if (error) {
    if (isSchemaMissing(error)) {
      return {
        ok: false,
        skip: true,
        message: "중복 확인은 supabase-schema.sql 적용 후 사용할 수 있습니다.",
      };
    }
    return { ok: false, message: "중복 확인 중 오류가 났습니다.", skip: false };
  }
  if (data === true) {
    return { ok: true, message: "사용 가능한 닉네임입니다.", skip: false };
  }
  return { ok: false, message: "이미 사용 중인 닉네임입니다.", skip: false };
};

const initProfile = async () => {
  initThemeUi();

  if (!window.supabase?.createClient) {
    finishAuthGate();
    return;
  }

  let client;
  try {
    const envRes = await fetch("./supa.env", { cache: "no-store" });
    if (!envRes.ok) throw new Error("supa.env");
    const env = parseEnvText(await envRes.text());
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("keys");
    }
    client = window.supabase.createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } catch (e) {
    console.error(e);
    finishAuthGate();
    return;
  }

  const { data } = await client.auth.getUser();
  const user = data?.user;
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const nickname = user.user_metadata?.nickname || "닉네임 미설정";
  const avatarUrl = user.user_metadata?.avatar_url || "";
  if (profileNickname) profileNickname.textContent = nickname;
  if (profileEmail) profileEmail.textContent = user.email || "";
  if (nicknameInput) nicknameInput.value = user.user_metadata?.nickname || "";

  setAvatarFromUrl(avatarUrl, Boolean(avatarUrl));

  {
    const err = await upsertProfileRow(client, user.id, {
      nickname: user.user_metadata?.nickname || null,
      avatar_url: avatarUrl || null,
    });
    if (err && isSchemaMissing(err)) {
      /* profiles 테이블 없음 — 무시 */
    }
  }

  avatarChangeBtn?.addEventListener("click", () => {
    if (avatarInput) avatarInput.value = "";
    avatarInput?.click();
  });

  avatarInput?.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg("이미지는 2MB 이하로 올려주세요.", true);
      avatarInput.value = "";
      return;
    }

    let previewUrl = null;
    try {
      previewUrl = URL.createObjectURL(file);
      if (profileAvatarImg) profileAvatarImg.src = previewUrl;
    } catch (_) {
      /* 미리보기 실패 시 업로드만 진행 */
    }

    setAvatarMsg("업로드 중...", false);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const finishPreview = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
    };

    const revertAvatar = () => {
      finishPreview();
      setAvatarFromUrl(lastStableAvatarUrl, lastStableAvatarUrl !== DEFAULT_AVATAR);
    };

    const { error: upErr } = await client.storage.from(AVATAR_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

    if (upErr) {
      revertAvatar();
      setAvatarMsg(
        `업로드 실패: ${upErr.message} (Supabase → Storage 에 avatars 버킷·정책: supabase-schema.sql 하단)`,
        true
      );
      console.error(upErr);
      avatarInput.value = "";
      return;
    }

    const { data: pub } = client.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) {
      revertAvatar();
      setAvatarMsg("공개 URL을 가져오지 못했습니다.", true);
      avatarInput.value = "";
      return;
    }

    const { data: updated, error: metaErr } = await client.auth.updateUser({
      data: { avatar_url: publicUrl },
    });
    if (metaErr) {
      revertAvatar();
      setAvatarMsg("프로필에 반영하지 못했습니다.", true);
      avatarInput.value = "";
      return;
    }

    await upsertProfileRow(client, user.id, {
      avatar_url: publicUrl,
      nickname: updated.user?.user_metadata?.nickname || user.user_metadata?.nickname || null,
    });

    finishPreview();
    setAvatarFromUrl(publicUrl, true);
    setAvatarMsg("프로필 사진이 변경되었습니다.", false);
    avatarInput.value = "";
  });

  checkNicknameBtn?.addEventListener("click", async () => {
    setNicknameMsg("", false);
    const result = await checkNicknameAvailable(client, nicknameInput?.value || "");
    setNicknameMsg(result.message, !result.ok);
  });

  saveNicknameBtn?.addEventListener("click", async () => {
    const next = (nicknameInput?.value || "").trim();
    if (next.length < 2 || next.length > 16) {
      setNicknameMsg("닉네임은 2자 이상 16자 이하로 입력해주세요.", true);
      return;
    }

    const availability = await checkNicknameAvailable(client, next);
    if (!availability.skip && !availability.ok) {
      setNicknameMsg(availability.message, true);
      return;
    }

    setNicknameMsg("저장 중...", false);
    const { data: updated, error } = await client.auth.updateUser({
      data: { nickname: next },
    });
    if (error) {
      setNicknameMsg("저장에 실패했습니다. 다시 시도해주세요.", true);
      return;
    }

    const newNick = updated.user?.user_metadata?.nickname || next;
    if (profileNickname) profileNickname.textContent = newNick;
    setAvatarFromUrl(updated.user?.user_metadata?.avatar_url || "", Boolean(updated.user?.user_metadata?.avatar_url));

    const profileErr = await upsertProfileRow(client, user.id, {
      nickname: next,
      avatar_url: updated.user?.user_metadata?.avatar_url || null,
    });
    if (profileErr) {
      if (isSchemaMissing(profileErr)) {
        setNicknameMsg(
          availability.skip
            ? "닉네임은 저장됐습니다. 중복 검사·DB 동기화는 supabase-schema.sql 적용 후 사용하세요."
            : "닉네임은 저장됐습니다. profiles 테이블을 supabase-schema.sql로 만들어주세요.",
          false
        );
      } else {
        setNicknameMsg("닉네임은 저장됐으나 DB 동기화에 실패했습니다.", true);
      }
      return;
    }

    setNicknameMsg("닉네임이 저장되었습니다.", false);
  });

  profileLogoutBtn?.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "./index.html";
  });

  finishAuthGate();
};

goMainBtn?.addEventListener("click", () => {
  window.location.href = "./index.html";
});

initProfile();
