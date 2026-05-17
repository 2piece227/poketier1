const googleLoginBtn = document.querySelector("#googleLoginBtn");
let client = null;

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
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  });
  return env;
};

const initLogin = async () => {
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
    if (googleLoginBtn) {
      googleLoginBtn.disabled = true;
      googleLoginBtn.textContent = "환경설정 로딩 실패";
    }
    finishAuthGate();
    return;
  }

  const env = parseEnvText(envText);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (googleLoginBtn) {
      googleLoginBtn.disabled = true;
      googleLoginBtn.textContent = "Supabase 키 확인 필요";
    }
    finishAuthGate();
    return;
  }

  client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  const { data } = await client.auth.getUser();
  if (data?.user) {
    const nickname = data.user.user_metadata?.nickname;
    window.location.href = nickname ? "./index.html" : "./nickname.html";
    return;
  }

  finishAuthGate();
};

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    if (!client) {
      alert("로그인 설정을 불러오지 못했습니다. 로컬 서버에서 실행 중인지 확인해주세요.");
      return;
    }
    const redirectTo = new URL("./index.html", window.location.href).href;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: new URL("./login.html", window.location.href).href,
      },
    });
    if (error) {
      console.error(error);
      alert(`구글 로그인 실패: ${error.message}`);
    }
  });
}

initLogin();
