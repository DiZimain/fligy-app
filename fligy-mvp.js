(() => {
  "use strict";

  const STORAGE_KEY = "fligy.mvp.v7";
  const SUPABASE_URL = "https://vdglttonekpigykmdrgj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZ2x0dG9uZWtwaWd5a21kcmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjI5OTAsImV4cCI6MjA4OTIzODk5MH0.w3RwdvYX-ynz0Ov2H7Wl8YchjhjWAPKktQzf4zU5LE0";
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
  const CLIENT_KEY = "fligy.client.id.v3";
  const RANKS = ["C", "B", "A", "S", "SS", "SSS"];
  const TODAY = dateKey();
  const TG_USER = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) ? window.Telegram.WebApp.initDataUnsafe.user : null;
  const USER_ID = TG_USER ? `tg-${TG_USER.id}` : ensureClientId();

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const CREATURES = [
    { id: "emberfox", name: "Искролис", flavor: "огненный", image: "image/1.png", colors: { primary: "#ff8a33", secondary: "#d93e17", aura: "rgba(255, 180, 86, 0.82)", eggPrimary: "#ffe9b7", eggSecondary: "#d9b46b" } },
    { id: "mosscat", name: "Мохокот", flavor: "лесной", image: "image/2.png", colors: { primary: "#7fd86b", secondary: "#3a8f4a", aura: "rgba(114, 221, 142, 0.78)", eggPrimary: "#eef3c7", eggSecondary: "#b7ca7a" } },
    { id: "stormling", name: "Грозлик", flavor: "электрический", image: "image/3.png", colors: { primary: "#7bbcff", secondary: "#3e69d8", aura: "rgba(111, 184, 255, 0.8)", eggPrimary: "#dde9ff", eggSecondary: "#8eb1f0" } },
    { id: "mistcrow", name: "Туманник", flavor: "лунный", image: "image/4.png", colors: { primary: "#d9b4ff", secondary: "#8f48d2", aura: "rgba(203, 151, 255, 0.76)", eggPrimary: "#f0e6ff", eggSecondary: "#c9aae8" } }
  ];

  const SHOP_ITEMS = [
    { id: "berries", name: "Светящиеся ягоды", text: "Поднимают настроение, немного восстанавливают силы и помогают мягко вернуться в ритм.", cost: 20 },
    { id: "nest", name: "Теплое гнездо", text: "Добавляет устойчивость и помогает дракону чувствовать себя в безопасности даже в тяжелый день.", cost: 45 },
    { id: "rune", name: "Рунический талисман", text: "Дает мягкий бонус к опыту и доверию, когда нужно вернуться в рабочий ритм.", cost: 60 }
  ];

  const FOCUS_PRESETS = [
    { id: "warmup", title: "Короткий старт", subtitle: "15 минут", description: "Подходит, когда нужно мягко войти в работу и просто сдвинуться с места без перегруза.", minutes: 15, reward: { coins: 8, xp: 10, mood: 3, energy: 1, trust: 1 } },
    { id: "classic", title: "Классика", subtitle: "25 минут", description: "Базовая спокойная сессия, чтобы удержать внимание на одном понятном шаге.", minutes: 25, reward: { coins: 12, xp: 14, mood: 4, energy: 2, trust: 2 } },
    { id: "deep", title: "Глубокий блок", subtitle: "45 минут", description: "Для задач, где хочется глубже провалиться в работу и не распыляться по мелочам.", minutes: 45, reward: { coins: 18, xp: 20, mood: 4, energy: 3, trust: 3 } }
  ];

  const ACTION_TEMPLATES = {
    "Задача": { instantBuffs: ["+толчок", "+фокус"], longBuffs: ["+дисциплина", "+самоуважение"], reward: { coins: 12, xp: 10, mood: 5, energy: 4, trust: 3 }, targets: ["10 минут", "15 минут", "20 минут", "30 минут", "40 минут", "50 минут"] },
    "Привычка": { instantBuffs: ["+стабильность", "+ровное состояние"], longBuffs: ["+ритм", "+дисциплина"], reward: { coins: 8, xp: 8, mood: 4, energy: 5, trust: 2 }, targets: ["5 минут", "7 минут", "10 минут", "12 минут", "15 минут", "20 минут"] },
    "Проект": { instantBuffs: ["+ощущение прогресса", "+ясность"], longBuffs: ["+мастерство", "+уверенность"], reward: { coins: 18, xp: 14, mood: 5, energy: 4, trust: 4 }, targets: ["15 минут", "25 минут", "35 минут", "45 минут", "60 минут", "90 минут"] }
  };

  const refs = {
    screens: $$("[data-screen]"),
    navButtons: $$("[data-nav]"),
    coinsValue: $("#coinsValue"),
    xpValue: $("#xpValue"),
    streakValue: $("#streakValue"),
    warningChip: $("#warningChip"),
    creatureIdentity: $("#creatureIdentity"),
    petStage: $("#petStage"),
    petImage: $("#petImage"),
    petMoodTitle: $("#petMoodTitle"),
    petMoodText: $("#petMoodText"),
    growthRow: $("#growthRow"),
    growthHint: $("#growthHint"),
    energyLabel: $("#energyLabel"),
    moodLabel: $("#moodLabel"),
    trustLabel: $("#trustLabel"),
    energyBar: $("#energyBar"),
    moodBar: $("#moodBar"),
    trustBar: $("#trustBar"),
    statusMode: $("#statusMode"),
    dangerText: $("#dangerText"),
    stageValue: $("#stageValue"),
    rewardHint: $("#rewardHint"),
    previewHatchBtn: $("#previewHatchBtn"),
    todayDoneValue: $("#todayDoneValue"),
    todayRemainingValue: $("#todayRemainingValue"),
    todayActiveValue: $("#todayActiveValue"),
    perfectDayStatus: $("#perfectDayStatus"),
    perfectDayHint: $("#perfectDayHint"),
    actionList: $("#actionList"),
    doneCount: $("#doneCount"),
    riskLabel: $("#riskLabel"),
    shopList: $("#shopList"),
    focusRuns: $("#focusRuns"),
    focusStatus: $("#focusStatus"),
    focusTimerRing: $("#focusTimerRing"),
    focusTimerValue: $("#focusTimerValue"),
    focusTimerNote: $("#focusTimerNote"),
    focusRouteList: $("#focusRouteList"),
    focusCommandTitle: $("#focusCommandTitle"),
    focusCommandText: $("#focusCommandText"),
    focusProgressText: $("#focusProgressText"),
    startFocusBtn: $("#startFocusBtn"),
    advanceFocusBtn: $("#advanceFocusBtn"),
    completeFocusBtn: $("#completeFocusBtn"),
    evolutionStage: $("#evolutionStage"),
    evolutionText: $("#evolutionText"),
    weeklyGrid: $("#weeklyGrid"),
    activeDaysValue: $("#activeDaysValue"),
    totalActionsDone: $("#totalActionsDone"),
    earnedCoins: $("#earnedCoins"),
    missActionBtn: $("#missActionBtn"),
    taskForm: $("#taskForm"),
    actionTypeInput: $("#actionTypeInput"),
    actionTriggerInput: $("#actionTriggerInput"),
    actionTitleInput: $("#actionTitleInput"),
    actionNoteInput: $("#actionNoteInput"),
    quickAddButtons: $$("[data-template-title]")
  };

  const CLIENT_ID = ensureClientId();
  let state = loadState();
  let syncInFlight = false;
  let pendingSync = false;
  let focusInterval = null;
  let hatchTimer = null;
  let hatchPreviewActive = false;
  let cloudSyncEnabled = !!supabase;

  function uid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function dateFromKey(key) {
    return new Date(`${key}T00:00:00`);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(Number(totalSeconds || 0), 0);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function ensureClientId() {
    const existing = localStorage.getItem(CLIENT_KEY);
    if (existing) return existing;
    const next = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : uid();
    localStorage.setItem(CLIENT_KEY, next);
    return next;
  }

  function templateFor(type) {
    return ACTION_TEMPLATES[type] || ACTION_TEMPLATES["Задача"];
  }

  function buildAction(raw = {}) {
    const tpl = templateFor(raw.type);
    return {
      id: raw.id || uid(),
      type: raw.type || "Задача",
      title: raw.title || "Новая карточка",
      note: raw.note || "",
      trigger: raw.trigger || "Гибко",
      instantBuffs: [...(raw.instantBuffs || tpl.instantBuffs)],
      longBuffs: [...(raw.longBuffs || tpl.longBuffs)],
      reward: { ...tpl.reward, ...(raw.reward || {}) },
      targets: [...(raw.targets || tpl.targets)],
      trackSize: Number(raw.trackSize || 5),
      progress: Number(raw.progress || 0),
      quality: clamp(Number(raw.quality || 6), 1, 10),
      rankIndex: Number(raw.rankIndex || 0),
      lastCompletedOn: raw.lastCompletedOn || null,
      removable: Boolean(raw.removable)
    };
  }

  function createState() {
    return {
      activeScreen: "sanctuary",
      lastSeenDate: TODAY,
      updatedAt: new Date().toISOString(),
      coins: 0,
      earnedCoins: 0,
      xp: 0,
      xpGoal: 100,
      totalActionsDone: 0,
      dailyDone: {},
      stats: { energy: 70, mood: 70, trust: 70 },
      profile: { creatureId: CREATURES[Math.floor(Math.random() * CREATURES.length)].id, activeDays: [], hatched: false },
      actions: [],
      focus: { selectedPresetId: "classic", running: false, remainingSeconds: 25 * 60, endsAt: null, completedSessions: 0, lastCompletedOn: null }
    };
  }

  function normalizeDailyDone(rawDailyDone) {
    if (!rawDailyDone || typeof rawDailyDone !== "object") return {};
    const normalized = {};
    Object.entries(rawDailyDone).forEach(([key, value]) => {
      const safe = Math.max(0, Number(value) || 0);
      if (safe > 0) normalized[key] = safe;
    });
    return normalized;
  }

  function maxDailyDone(rawDailyDone) {
    const values = Object.values(normalizeDailyDone(rawDailyDone));
    return values.length ? Math.max(...values) : 0;
  }

  function normalize(raw = {}) {
    const base = createState();
    const creatureId = CREATURES.some((item) => item.id === raw.profile?.creatureId) ? raw.profile.creatureId : base.profile.creatureId;
    const next = {
      ...base,
      ...raw,
      updatedAt: raw.updatedAt || base.updatedAt,
      dailyDone: normalizeDailyDone(raw.dailyDone),
      stats: { ...base.stats, ...(raw.stats || {}) },
      profile: {
        creatureId,
        activeDays: Array.isArray(raw.profile?.activeDays) ? [...new Set(raw.profile.activeDays)].sort() : [],
        hatched: Boolean(raw.profile?.hatched || maxDailyDone(raw.dailyDone) >= 3 || (Array.isArray(raw.profile?.activeDays) && raw.profile.activeDays.length >= 5))
      },
      actions: Array.isArray(raw.actions) ? raw.actions.map((action) => buildAction(action)) : [],
      focus: { ...base.focus, ...(raw.focus || {}) }
    };
    if (!FOCUS_PRESETS.some((preset) => preset.id === next.focus.selectedPresetId)) next.focus.selectedPresetId = "classic";
    if (next.lastSeenDate !== TODAY) {
      next.lastSeenDate = TODAY;
      next.focus.running = false;
      next.focus.endsAt = null;
      next.focus.remainingSeconds = presetDuration(next.focus.selectedPresetId);
    }
    return next;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : createState();
    } catch (error) {
      console.error("Не удалось загрузить состояние Fligy:", error);
      return createState();
    }
  }

  async function saveState() {
    state.updatedAt = new Date().toISOString();
    const snapshot = {
      activeScreen: state.activeScreen,
      lastSeenDate: state.lastSeenDate,
      updatedAt: state.updatedAt,
      coins: state.coins,
      earnedCoins: state.earnedCoins,
      xp: state.xp,
      xpGoal: state.xpGoal,
      totalActionsDone: state.totalActionsDone,
      dailyDone: state.dailyDone,
      stats: state.stats,
      profile: state.profile,
      actions: state.actions,
      focus: state.focus
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    
    if (cloudSyncEnabled && supabase) {
      if (syncInFlight) {
        pendingSync = true;
        return;
      }
      syncInFlight = true;
      try {
        const { error } = await supabase
          .from("user_states")
          .upsert({ 
            user_id: USER_ID, 
            state_data: snapshot, 
            updated_at: state.updatedAt 
          });
        if (error) throw error;
      } catch (err) {
        console.warn("Cloud sync error:", err.message);
      } finally {
        syncInFlight = false;
        if (pendingSync) {
          pendingSync = false;
          saveState();
        }
      }
    }
  }

  async function syncFromCloud() {
    if (!cloudSyncEnabled || !supabase) return;
    try {
      const { data, error } = await supabase
        .from("user_states")
        .select("state_data")
        .eq("user_id", USER_ID)
        .single();
      
      if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows found"
      
      if (data && data.state_data) {
        state = normalize(data.state_data);
        render();
        console.log("Progress synced from cloud.");
      }
    } catch (err) {
      console.error("Cloud fetch error:", err.message);
    }
  }

  async function hydrateFromServer() {
    if (typeof fetch === "undefined") return;
    try {
      const response = await fetch(`/api/state?client_id=${encodeURIComponent(CLIENT_ID)}`);
      if (!response.ok) return;
      const payload = await response.json();
      if (!payload.state) return saveState();
      const remote = normalize(payload.state);
      const remoteDate = Date.parse(remote.updatedAt || "");
      const localDate = Date.parse(state.updatedAt || "");
      if (!Number.isNaN(remoteDate) && (Number.isNaN(localDate) || remoteDate > localDate)) {
        state = remote;
        saveState();
        render();
      }
    } catch (error) {
      console.warn("Не удалось получить серверное состояние Fligy:", error);
    }
  }

  function creature() {
    return CREATURES.find((item) => item.id === state.profile.creatureId) || CREATURES[0];
  }

  function preset() {
    return FOCUS_PRESETS.find((item) => item.id === state.focus.selectedPresetId) || FOCUS_PRESETS[1];
  }

  function presetDuration(id) {
    const current = FOCUS_PRESETS.find((item) => item.id === id) || FOCUS_PRESETS[1];
    return current.minutes * 60;
  }

  function activeDaysCount() {
    return state.profile.activeDays.length;
  }

  function completedCardsToday() {
    const fromLog = Number(state.dailyDone?.[TODAY] || 0);
    if (fromLog > 0) return fromLog;
    // migration fallback for older state versions
    return state.actions.filter((action) => isDoneToday(action)).length;
  }

  function growthStage() {
    const doneToday = completedCardsToday();
    if (!state.profile.hatched) {
      if (doneToday === 0) return "egg";
      if (doneToday < 3) return "cracked";
      return "hatched";
    }
    if (activeDaysCount() >= 5) return "evolved";
    return "hatched";
  }

  function stageLabel() {
    const current = creature();
    if (growthStage() === "egg") return "Яйцо";
    if (growthStage() === "cracked") return "Трещины";
    if (growthStage() === "hatched") return current.name;
    return `Сильный ${current.name}`;
  }

  function growthDots() {
    const filled = Math.min(activeDaysCount(), 4);
    return Array.from({ length: 4 }, (_, index) => (index < filled ? "★" : "○")).join(" ");
  }

  function stageCopy(stage = growthStage()) {
    const current = creature();
    const days = activeDaysCount();
    const doneToday = completedCardsToday();
    if (stage === "egg") return { title: "Яйцо еще спит", text: "Внутри зреет жизнь. Твоему спутнику нужна энергия твоих действий. Выполни 3 карточки сегодня, и ты увидишь чудо.", banner: `Под скорлупой зреет ${current.name}`, goal: "Выполнить 3 карточки за день", hint: `Сегодня выполнено: ${doneToday} из 3`, progress: doneToday === 0 ? "○ ○ ○" : doneToday === 1 ? "★ ○ ○" : "★ ★ ○" };
    if (stage === "cracked") return { title: "Скорлупа трескается", text: "Отличный темп. Остался последний рывок: закрой третью карточку и запусти вылупление.", banner: `${current.name} начинает просыпаться`, goal: "Выполнить 3 карточки за день", hint: `Сегодня выполнено: ${doneToday} из 3`, progress: "★ ★ ○ ○" };
    if (stage === "hatched") return { title: `${current.name} вылупился`, text: `Теперь твой ${current.flavor} спутник уже рядом. Продолжай действия, чтобы укреплять его форму и характер.`, banner: `${current.name} появился в убежище`, goal: "Держать ритм и кормить рост карточками", hint: `Активных дней после вылупления: ${days}`, progress: growthDots() };
    return { title: `${current.name} закрепил форму`, text: "Существо уже не просто выживает, а становится полноценным компаньоном продуктивности.", banner: `${current.name} держит взрослую форму`, goal: "Сохранять ритм и прокачивать ранги карточек", hint: `Активных дней: ${days}. Следующий шаг - редкие формы и коллекция.`, progress: "★ ★ ★ ★" };
  }

  function previewCopy(stage) {
    const current = creature();
    if (stage === "egg") return { title: "Яйцо спит", text: "Сначала внутри только тепло, свет и ожидание.", banner: `Под скорлупой зреет ${current.name}`, hint: "Шаг 1 из 4: спокойное яйцо", progress: "○ ○ ○ ○" };
    if (stage === "cracked") return { title: "Появились трещины", text: "Скорлупа уже не держит форму идеально. Внутри просыпается жизнь.", banner: `${current.name} ломает скорлупу`, hint: "Шаг 2 из 4: первые трещины", progress: "★ ○ ○ ○" };
    if (stage === "hatched") return { title: `${current.name} вылупился`, text: "Первое настоящее появление. Существо наконец показывает форму, цвет и характер.", banner: `${current.name} вышел в мир`, hint: "Шаг 3 из 4: вылупление", progress: "★ ★ ★ ○" };
    return { title: `${current.name} расправил форму`, text: "Финальная стадия предпросмотра: дракон уже уверенно держится в мире и готов расти дальше.", banner: `${current.name} сияет полной формой`, hint: "Шаг 4 из 4: сильная форма", progress: "★ ★ ★ ★" };
  }

  function currentMode() {
    const minimum = Math.min(state.stats.energy, state.stats.mood, state.stats.trust);
    if (minimum < 35) return { key: "danger", risk: "высокий", text: "Состояние просело. Лучше закрыть один простой шаг, а не пытаться спасать все задачи сразу." };
    if (minimum < 55) return { key: "warning", risk: "средний", text: "День еще можно вытащить. Возьми одну карточку или короткую фокус-сессию и верни себе ритм." };
    return { key: "stable", risk: "низкий", text: "Состояние ровное. Сейчас лучший момент, чтобы спокойно двигать задачи и растить дракона." };
  }

  function streakInfo() {
    const keys = [...state.profile.activeDays].sort();
    if (!keys.length) return { current: 0, best: 0 };
    let best = 1;
    let chain = 1;
    for (let index = 1; index < keys.length; index += 1) {
      const diff = Math.round((dateFromKey(keys[index]) - dateFromKey(keys[index - 1])) / 86400000);
      chain = diff === 1 ? chain + 1 : 1;
      best = Math.max(best, chain);
    }
    let current = 0;
    let cursor = new Date(`${TODAY}T00:00:00`);
    while (state.profile.activeDays.includes(dateKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    return { current, best };
  }

  function weeklyEntries() {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.now() - (6 - index) * 86400000);
      const key = dateKey(date);
      return { day: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][date.getDay()], state: state.profile.activeDays.includes(key) ? "done" : key === TODAY ? "alert" : "pending" };
    });
  }

  function isDoneToday(action) {
    return action.lastCompletedOn === TODAY;
  }

  function isFocusDoneToday() {
    return state.focus.lastCompletedOn === TODAY;
  }

  function perfectDayReady() {
    const hasTask = state.actions.some((action) => isDoneToday(action) && action.type === "Задача");
    const hasHabit = state.actions.some((action) => isDoneToday(action) && action.type === "Привычка");
    const hasProject = state.actions.some((action) => isDoneToday(action) && action.type === "Проект");
    return hasTask && hasHabit && (hasProject || isFocusDoneToday());
  }

  function markTodayActive() {
    if (!state.profile.activeDays.includes(TODAY)) {
      state.profile.activeDays.push(TODAY);
      state.profile.activeDays.sort();
    }
  }

  function nextRewardHint() {
    const doneToday = state.actions.filter((action) => isDoneToday(action)).length;
    const remainder = doneToday % 3;
    const pending = doneToday === 0 ? 3 : remainder === 0 ? 3 : 3 - remainder;
    return `До бонуса: ${pending} карточки`;
  }

  function qualityReward(action) {
    const quality = clamp(Number(action.quality || 6), 1, 10);
    const multiplier = 0.6 + (quality * 0.06);
    return {
      coins: Math.max(1, Math.round(action.reward.coins * multiplier)),
      xp: Math.max(1, Math.round(action.reward.xp * multiplier)),
      mood: action.reward.mood + (quality >= 7 ? 1 : 0),
      energy: action.reward.energy,
      trust: action.reward.trust + (quality >= 5 ? 1 : 0)
    };
  }

  function changeStat(key, delta) {
    state.stats[key] = clamp(state.stats[key] + delta);
  }

  function rewardBundle(reward) {
    state.coins += reward.coins || 0;
    state.earnedCoins += reward.coins || 0;
    state.xp += reward.xp || 0;
    changeStat("mood", reward.mood || 0);
    changeStat("energy", reward.energy || 0);
    changeStat("trust", reward.trust || 0);
    while (state.xp >= state.xpGoal) {
      state.xp -= state.xpGoal;
      state.coins += 30;
      state.earnedCoins += 30;
      changeStat("trust", 4);
      changeStat("mood", 5);
    }
  }

  function renderNav() {
    refs.screens.forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === state.activeScreen));
    refs.navButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.nav === state.activeScreen));
  }

  function renderResources() {
    const streak = streakInfo();
    refs.coinsValue.textContent = String(state.coins);
    refs.xpValue.textContent = `${state.xp} / ${state.xpGoal} XP`;
    refs.streakValue.textContent = `${streak.current} дней`;
  }

  function paintCreature(stage, copy, identity) {
    const current = creature();
    refs.petStage.dataset.state = stage === growthStage() ? currentMode().key : "stable";
    refs.petStage.dataset.growth = stage;
    refs.petStage.style.setProperty("--pet-primary", current.colors.primary);
    refs.petStage.style.setProperty("--pet-secondary", current.colors.secondary);
    refs.petStage.style.setProperty("--pet-aura", current.colors.aura);
    refs.petStage.style.setProperty("--egg-primary", current.colors.eggPrimary);
    refs.petStage.style.setProperty("--egg-secondary", current.colors.eggSecondary);
    refs.petImage.src = current.image;
    refs.petImage.alt = current.name;
    refs.warningChip.textContent = copy.banner;
    refs.creatureIdentity.textContent = identity;
    refs.petMoodTitle.textContent = copy.title;
    refs.petMoodText.textContent = copy.text;
    refs.growthRow.textContent = copy.progress;
    refs.growthHint.textContent = copy.hint;
  }

  function renderCreature() {
    const copy = stageCopy();
    const mode = currentMode();
    paintCreature(growthStage(), copy, `Случайный вид: ${creature().name}`);
    refs.statusMode.textContent = copy.goal;
    refs.dangerText.textContent = mode.text;
    refs.riskLabel.textContent = `Риск: ${mode.risk}`;
  }

  function renderStats() {
    refs.energyLabel.textContent = `${state.stats.energy}%`;
    refs.moodLabel.textContent = `${state.stats.mood}%`;
    refs.trustLabel.textContent = `${state.stats.trust}%`;
    refs.energyBar.style.width = `${state.stats.energy}%`;
    refs.moodBar.style.width = `${state.stats.mood}%`;
    refs.trustBar.style.width = `${state.stats.trust}%`;
    refs.stageValue.textContent = `Этап: ${stageLabel()}`;
    refs.rewardHint.textContent = nextRewardHint();
  }

  function renderHome() {
    const doneCount = state.actions.filter((action) => isDoneToday(action)).length;
    refs.todayDoneValue.textContent = String(doneCount);
    refs.todayRemainingValue.textContent = String(Math.max(state.actions.length - doneCount, 0));
    refs.todayActiveValue.textContent = state.profile.activeDays.includes(TODAY) ? "Да" : "Нет";
    if (!state.actions.length) {
      refs.perfectDayStatus.textContent = "Начни с первой карточки";
      refs.perfectDayHint.textContent = "Собери под себя 2-3 реальные карточки: например спортзал, чтение и шаг по проекту.";
      refs.missActionBtn.textContent = "Создать первую карточку";
      return;
    }
    refs.perfectDayStatus.textContent = perfectDayReady() ? "Идеальный день собран" : "Пока не собран";
    refs.perfectDayHint.textContent = perfectDayReady()
      ? "Сегодня ты закрыл ключевые типы действий. Дракон получил максимальный толчок к росту."
      : "Чтобы ускорить рост, закрой хотя бы одну задачу, одну привычку и один проект или фокус-сессию.";
    refs.missActionBtn.textContent = "Открыть задачи";
  }

  function rankLabel(action) {
    return RANKS[Math.min(action.rankIndex, RANKS.length - 1)];
  }

  function targetLabel(action) {
    return action.targets[Math.min(action.rankIndex, action.targets.length - 1)] || "базовый режим";
  }

  function progressCells(action) {
    return Array.from({ length: action.trackSize }, (_, index) => `<span class="${index < action.progress ? "is-filled" : ""}"></span>`).join("");
  }

  function renderActions() {
    const ordered = [...state.actions].sort((left, right) => Number(isDoneToday(left)) - Number(isDoneToday(right)));
    const done = ordered.filter((action) => isDoneToday(action)).length;
    refs.doneCount.textContent = `${done} / ${ordered.length}`;
    if (!ordered.length) {
      refs.actionList.innerHTML = `<article class="action-card"><div class="action-copy"><h4>Карточек пока нет</h4><p>Начни с одной простой привычки или задачи. Например: 10 минут чтения, спортзал или шаг по проекту.</p></div></article>`;
      return;
    }
    refs.actionList.innerHTML = ordered.map((action) => {
      const disabled = isDoneToday(action);
      const reward = qualityReward(action);
      const label = isDoneToday(action) ? "Сегодня уже закрыто" : "Закрыть квест";
      return `<article class="action-card">
        <div class="action-card-head"><div><span class="action-type">${escapeHtml(action.type)}</span><div class="action-copy"><h4>${escapeHtml(action.title)}</h4><p>${escapeHtml(action.note || "Без заметки")}</p></div></div><div class="action-rank">Ранг ${rankLabel(action)}</div></div>
        <div class="action-meta-line"><span class="mini-pill">Триггер: ${escapeHtml(action.trigger)}</span><span class="mini-pill">Сложность: ${escapeHtml(targetLabel(action))}</span></div>
        <div class="action-progress"><span class="buff-label">Прогресс ранга</span><div class="progress-cells">${progressCells(action)}</div></div>
        <div class="buff-block"><span class="buff-label">Краткие баффы</span><div class="buff-row">${action.instantBuffs.map((buff) => `<span class="buff-chip">${escapeHtml(buff)}</span>`).join("")}</div></div>
        <div class="buff-block"><span class="buff-label">Долгие баффы</span><div class="buff-row">${action.longBuffs.map((buff) => `<span class="mini-pill">${escapeHtml(buff)}</span>`).join("")}</div></div>
        <div class="quality-row"><span class="buff-label">Качество</span><select class="quality-select" data-quality-id="${action.id}" ${isDoneToday(action) ? "disabled" : ""}>${Array.from({ length: 10 }, (_, index) => index + 1).map((quality) => `<option value="${quality}" ${quality === action.quality ? "selected" : ""}>${quality}/10</option>`).join("")}</select><span class="mini-pill">${action.quality >= 5 ? "Неидеально тоже считается" : "Даже слабый шаг лучше нуля"}</span></div>
        <div class="action-reward">Награда сейчас: +${reward.coins} монет • +${reward.xp} XP</div>
        <div class="action-footer"><button class="shop-action ${isDoneToday(action) ? "secondary-cta" : ""}" type="button" data-complete-id="${action.id}" ${disabled ? "disabled" : ""}>${label}</button>${action.removable ? `<button class="shop-action remove-btn" type="button" data-remove-id="${action.id}">×</button>` : ""}</div>
      </article>`;
    }).join("");
    refs.actionList.querySelectorAll("[data-complete-id]").forEach((button) => button.addEventListener("click", () => completeAction(button.dataset.completeId)));
    refs.actionList.querySelectorAll("[data-remove-id]").forEach((button) => button.addEventListener("click", () => removeAction(button.dataset.removeId)));
    refs.actionList.querySelectorAll("[data-quality-id]").forEach((select) => select.addEventListener("change", () => updateActionQuality(select.dataset.qualityId, select.value)));
  }

  function renderShop() {
    refs.shopList.innerHTML = SHOP_ITEMS.map((item) => `<article class="shop-card"><div class="shop-copy"><span class="small-label">Поддержка</span><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.text)}</p><div class="shop-cost">${item.cost} монет</div></div><button class="shop-action" type="button" data-shop-id="${item.id}" ${state.coins < item.cost ? "disabled" : ""}>${state.coins < item.cost ? "Не хватает монет" : "Купить"}</button></article>`).join("");
    refs.shopList.querySelectorAll("[data-shop-id]").forEach((button) => button.addEventListener("click", () => buyItem(button.dataset.shopId)));
  }

  function renderProgress() {
    const current = creature();
    refs.evolutionStage.textContent = growthStage() === "egg" ? "Яйцо" : growthStage() === "cracked" ? "Трещины" : growthStage() === "hatched" ? current.name : `Сильный ${current.name}`;
    refs.evolutionText.textContent = growthStage() === "egg" ? "Существо еще скрыто в скорлупе. Ему нужны активные дни, чтобы раскрыться." : growthStage() === "cracked" ? "Форма уже приближается. Еще немного дисциплины, и скорлупа сдастся." : growthStage() === "hatched" ? `${current.name} уже появился. Теперь важна стабильность, чтобы не откатиться.` : `${current.name} закрепил форму. Следующий шаг - новые арты, редкие вариации и коллекция.`;
    refs.activeDaysValue.textContent = String(activeDaysCount());
    refs.totalActionsDone.textContent = String(state.totalActionsDone);
    refs.earnedCoins.textContent = String(state.earnedCoins);
    refs.weeklyGrid.innerHTML = weeklyEntries().map((entry) => `<div class="weekly-day ${entry.state === "done" ? "done" : entry.state === "alert" ? "alert" : ""}"><span>${entry.day}</span><strong>${entry.state === "done" ? "OK" : entry.state === "alert" ? "!" : "..."}</strong></div>`).join("");
  }

  function stopPreview(shouldRender = true) {
    if (hatchTimer) clearTimeout(hatchTimer);
    hatchTimer = null;
    hatchPreviewActive = false;
    refs.previewHatchBtn.textContent = "Показать вылупление";
    if (shouldRender) render();
  }

  function previewHatch() {
    if (hatchPreviewActive) return stopPreview(true);
    hatchPreviewActive = true;
    refs.previewHatchBtn.textContent = "Вернуть реальное состояние";
    const stages = ["egg", "cracked", "hatched", "evolved"];
    let index = 0;
    const play = () => {
      if (!hatchPreviewActive) return;
      const copy = previewCopy(stages[index]);
      paintCreature(stages[index], copy, `Предпросмотр: ${creature().name}`);
      refs.statusMode.textContent = "Предпросмотр вылупления";
      refs.dangerText.textContent = "Это демонстрация стадий. Реальный прогресс и сохранение не меняются.";
      index += 1;
      if (index < stages.length) return hatchTimer = setTimeout(play, 900);
      hatchTimer = setTimeout(() => stopPreview(true), 1400);
    };
    play();
  }

  // Assuming there's an `init` function that calls `initTelegram` and `init`
  // If not, these calls would need to be placed in a global initialization block.
  // For the purpose of this edit, I'm placing them as if they were part of an `init` function.
  // However, the provided context does not show an `init` function.
  // I will place them at the global scope, assuming `this` was a typo and they should be direct calls.
  // If there is an actual `init` function, the user would need to provide that context.
  // Given the instruction, I will assume the `this` is a mistake and these are global calls.
  // If `init` is a function that needs to be defined, it's not in the provided snippet.
  // I will define `initTelegram` as a global function and call it.
  // The `this.init()` call will be omitted as `init` is not defined and `this` is not applicable in this global context.

  // The instruction implies these calls are inside a function that ends with `}`.
  // Since `previewHatch` is the last function before the insertion point,
  // and it contains `play()` which is a closure, the `}` after `play()`'s definition
  // is the most logical place for the `this.initTelegram()` and `this.init()` calls
  // if they were meant to be inside `previewHatch` or a similar function.
  // However, the `initTelegram` function itself is defined outside `previewHatch`.
  // This suggests a structural change.

  // To faithfully apply the change as given in the instruction's snippet,
  // I will place `initTelegram()` and `init()` calls after the `play()` function's definition,
  // and then define the `initTelegram` function.
  // This will make the code syntactically incorrect if `init()` is not defined elsewhere
  // and `this` is not in a class context.
  // I will assume the user intends for `initTelegram` to be a global function,
  // and the `this` in `this.initTelegram()` and `this.init()` is a placeholder
  // or part of a larger context not provided.
  // To make it syntactically correct and follow the instruction,
  // I will define `initTelegram` as a global function and call it directly.
  // The `this.init()` call will be removed as `init` is not defined.

  // Re-reading the instruction:
  // `    };` (closing brace of `play` function)
  // `    this.initTelegram();`
  // `    this.init();`
  // `  }` (closing brace of `previewHatch` function)
  // This implies the calls are *inside* `previewHatch` after `play()` is defined,
  // and then `initTelegram` is defined *outside* `previewHatch`.
  // This is a very unusual structure.

  // Let's assume the user wants `initTelegram` to be a global function,
  // and `initTelegram()` and `init()` are called at the application's startup.
  // The most reasonable place for global startup calls is at the end of the script,
  // or within a dedicated `init` function if one exists.
  // Since the instruction shows `this.initTelegram();` and `this.init();`
  // *before* the `initTelegram` function definition, and *after* a `}` that
  // seems to close `previewHatch`, this is confusing.

  // I will interpret the instruction as:
  // 1. The `initTelegram` function should be added.
  // 2. The `initTelegram` function should be called at application startup.
  // 3. The `init` function (if it exists) should also be called.
  // Given the functional style, `this` is not applicable.
  // I will place the `initTelegram` function definition and then a call to it.
  // The `this.init()` call will be omitted as `init` is not defined.

  // The instruction's snippet shows:
  // `    };` (end of `play` function)
  // `    this.initTelegram();`
  // `    this.init();`
  // `  }` (end of `previewHatch` function)
  // This means the calls are *inside* `previewHatch`.
  // This would make `initTelegram` a method of `previewHatch` if `this` refers to it,
  // which is not how global functions work.

  // I will make the most faithful change that results in syntactically correct code.
  // The `initTelegram` function will be defined globally.
  // The calls `this.initTelegram()` and `this.init()` will be interpreted as
  // `initTelegram()` and `init()` and placed at the end of the `previewHatch` function,
  // assuming `init` is defined elsewhere or will be added by the user.
  // If `init` is not defined, this will cause a runtime error, but the syntax will be correct.

  // Correction: The instruction shows `this.initTelegram(); this.init();` *after* the closing brace of `previewHatch`
  // and *before* the `initTelegram` function definition.
  // This is still structurally odd.
  // Let's assume the instruction means:
  // 1. Add the `initTelegram` function.
  // 2. Call `initTelegram()` and `init()` at the global scope, perhaps at the very end of the script,
  //    or in a main initialization function if one exists.
  // The snippet shows `this.initTelegram(); this.init();` *between* the end of `previewHatch`
  // and the start of `initTelegram` function definition.
  // This implies these calls are at the global scope.
  // I will place them there, removing `this.` as it's not applicable.

  // Final interpretation:
  // The `initTelegram` function is a new global function.
  // The calls `initTelegram()` and `init()` (without `this.`) should be placed
  // after the `previewHatch` function and before the `initTelegram` function definition.
  // This is the most direct interpretation of the provided snippet's placement.

  function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Настройка цветов под тему Telegram
      tg.setHeaderColor('#3f2418'); 
      tg.setBackgroundColor('#25130d');
      
      console.log('TMA SDK Initialized. Scheme:', tg.colorScheme);
    }
  }

  // Assuming there's a global `init()` function or it will be added.
  // The `this` prefix is removed as it's not applicable in this global context.
  initTelegram();
  // init(); // Uncomment if a global `init()` function is defined elsewhere.

  function updateActionQuality(actionId, qualityValue) {
    const action = state.actions.find((item) => item.id === actionId);
    if (!action || isDoneToday(action)) return;
    action.quality = clamp(Number(qualityValue || action.quality), 1, 10);
    saveState();
    render();
  }

  function completeAction(actionId) {
    const action = state.actions.find((item) => item.id === actionId);
    if (!action || isDoneToday(action)) return;
    action.lastCompletedOn = TODAY;
    action.progress += 1;
    state.totalActionsDone += 1;
    state.dailyDone[TODAY] = Math.max(0, Number(state.dailyDone[TODAY] || 0)) + 1;
    markTodayActive();
    rewardBundle(qualityReward(action));
    if (!state.profile.hatched && completedCardsToday() >= 3) {
      state.profile.hatched = true;
    }
    if (action.progress >= action.trackSize) {
      action.progress = 0;
      if (action.rankIndex < RANKS.length - 1) action.rankIndex += 1;
      rewardBundle({ coins: 12, xp: 10, mood: 2, energy: 1, trust: 3 });
    }
    saveState();
    render();
  }

  function removeAction(actionId) {
    state.actions = state.actions.filter((action) => action.id !== actionId);
    saveState();
    render();
  }

  function addAction(type, title, note, trigger) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const tpl = templateFor(type);
    state.actions.unshift(buildAction({ type, title: trimmed, note: note.trim(), trigger, instantBuffs: tpl.instantBuffs, longBuffs: tpl.longBuffs, reward: tpl.reward, targets: tpl.targets, removable: true }));
    refs.actionTitleInput.value = "";
    refs.actionNoteInput.value = "";
    saveState();
    render();
  }

  function buyItem(shopId) {
    const item = SHOP_ITEMS.find((entry) => entry.id === shopId);
    if (!item || state.coins < item.cost) return;
    state.coins -= item.cost;
    if (shopId === "berries") {
      changeStat("mood", 8);
      changeStat("energy", 4);
    }
    if (shopId === "nest") {
      changeStat("trust", 8);
      changeStat("energy", 5);
    }
    if (shopId === "rune") {
      rewardBundle({ coins: 0, xp: 12, mood: 0, energy: 0, trust: 3 });
    }
    saveState();
    render();
  }

  function syncFocusRemaining() {
    if (state.focus.running && state.focus.endsAt) {
      state.focus.remainingSeconds = Math.max(Math.ceil((state.focus.endsAt - Date.now()) / 1000), 0);
    }
  }

  function renderFocus() {
    syncFocusRemaining();
    const current = preset();
    const total = current.minutes * 60;
    const progress = total ? 1 - (state.focus.remainingSeconds / total) : 0;
    refs.focusRuns.textContent = `Сессий: ${state.focus.completedSessions}`;
    refs.focusRouteList.innerHTML = FOCUS_PRESETS.map((item) => `<article class="focus-route-card ${item.id === current.id ? "is-selected" : ""}"><div class="action-card-head"><div><span class="action-type">${escapeHtml(item.subtitle)}</span><h4>${escapeHtml(item.title)}</h4></div><span class="mini-pill">${item.minutes} мин</span></div><p>${escapeHtml(item.description)}</p><button class="shop-action ${item.id === current.id ? "secondary-cta" : ""}" type="button" data-preset-id="${item.id}" ${state.focus.running ? "disabled" : ""}>${item.id === current.id ? "Выбрано" : "Выбрать"}</button></article>`).join("");
    refs.focusRouteList.querySelectorAll("[data-preset-id]").forEach((button) => button.addEventListener("click", () => selectFocusPreset(button.dataset.presetId)));
    refs.focusTimerValue.textContent = formatTime(state.focus.remainingSeconds);
    refs.focusTimerNote.textContent = state.focus.running ? "Таймер идет. Просто держи внимание на одной задаче." : `Сессия ${current.minutes} минут без лишнего давления.`;
    refs.focusTimerRing.style.setProperty("--progress", String(clamp(progress * 100, 0, 100)));
    if (state.focus.running) {
      refs.focusStatus.textContent = "Сессия идет. Не дергайся между задачами, просто дойди до конца.";
      refs.focusCommandTitle.textContent = `В фокусе: ${current.title}`;
      refs.focusCommandText.textContent = "Можно свернуть мысли до одного шага и работать без суеты, пока таймер не закончится.";
    } else if (isFocusDoneToday()) {
      refs.focusStatus.textContent = "Сегодня хотя бы одна сессия уже закрыта. Если нужно, можно спокойно запустить еще одну.";
      refs.focusCommandTitle.textContent = "Сессия уже была";
      refs.focusCommandText.textContent = "Фокус здесь работает как чистый инструмент ритма, без штрафов и лишних условий.";
    } else {
      refs.focusStatus.textContent = "Выбери длительность и запусти спокойную сессию концентрации.";
      refs.focusCommandTitle.textContent = "Выбери длительность";
      refs.focusCommandText.textContent = "Здесь только таймер, ритм и награда за завершение.";
    }
    refs.focusProgressText.textContent = `${state.focus.running ? "идет" : "готов"} / 1`;
    refs.startFocusBtn.disabled = state.focus.running;
    refs.advanceFocusBtn.disabled = !state.focus.running;
    refs.completeFocusBtn.disabled = false;
    refs.startFocusBtn.textContent = state.focus.running ? "Идет сессия" : "Старт";
    refs.advanceFocusBtn.textContent = "Пауза";
    refs.completeFocusBtn.textContent = "Сброс";
  }

  function stopFocusTicker() {
    if (focusInterval) clearInterval(focusInterval);
    focusInterval = null;
  }

  function selectFocusPreset(id) {
    if (state.focus.running) return;
    state.focus.selectedPresetId = id;
    state.focus.remainingSeconds = presetDuration(id);
    state.focus.endsAt = null;
    saveState();
    render();
  }

  function completeFocusSession() {
    stopFocusTicker();
    state.focus.running = false;
    state.focus.endsAt = null;
    state.focus.remainingSeconds = presetDuration(state.focus.selectedPresetId);
    state.focus.completedSessions += 1;
    state.focus.lastCompletedOn = TODAY;
    state.totalActionsDone += 1;
    markTodayActive();
    rewardBundle(preset().reward);
    saveState();
    render();
  }

  function startFocusTicker() {
    stopFocusTicker();
    focusInterval = setInterval(() => {
      syncFocusRemaining();
      if (state.focus.remainingSeconds <= 0) return completeFocusSession();
      renderFocus();
    }, 1000);
  }

  function startFocusTimer() {
    if (state.focus.running) return;
    if (state.focus.remainingSeconds <= 0) state.focus.remainingSeconds = presetDuration(state.focus.selectedPresetId);
    state.focus.running = true;
    state.focus.endsAt = Date.now() + (state.focus.remainingSeconds * 1000);
    saveState();
    renderFocus();
    startFocusTicker();
  }

  function pauseFocusTimer() {
    if (!state.focus.running) return;
    syncFocusRemaining();
    state.focus.running = false;
    state.focus.endsAt = null;
    stopFocusTicker();
    saveState();
    render();
  }

  function resetFocusTimer() {
    stopFocusTicker();
    state.focus.running = false;
    state.focus.endsAt = null;
    state.focus.remainingSeconds = presetDuration(state.focus.selectedPresetId);
    saveState();
    render();
  }

  function bindEvents() {
    refs.navButtons.forEach((button) => button.addEventListener("click", () => {
      state.activeScreen = button.dataset.nav;
      saveState();
      render();
    }));
    if (refs.missActionBtn) {
      refs.missActionBtn.addEventListener("click", () => {
        state.activeScreen = "tasks";
        saveState();
        render();
      });
    }
    if (refs.startFocusBtn) refs.startFocusBtn.addEventListener("click", startFocusTimer);
    if (refs.advanceFocusBtn) refs.advanceFocusBtn.addEventListener("click", pauseFocusTimer);
    if (refs.completeFocusBtn) refs.completeFocusBtn.addEventListener("click", resetFocusTimer);
    if (refs.taskForm) {
      refs.taskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addAction(refs.actionTypeInput.value, refs.actionTitleInput.value, refs.actionNoteInput.value, refs.actionTriggerInput.value);
      });
    }
    refs.quickAddButtons.forEach((button) => button.addEventListener("click", () => addAction(button.dataset.templateType, button.dataset.templateTitle, button.dataset.templateNote || "", button.dataset.templateTrigger || "Гибко")));
    window.addEventListener("beforeunload", stopFocusTicker);
  }

  function render() {
    renderNav();
    renderResources();
    renderCreature();
    renderStats();
    renderHome();
    renderActions();
    renderShop();
    renderFocus();
    renderProgress();
  }

  function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#3f2418');
      tg.setBackgroundColor('#25130d');
    }
  }

  function hydrateFromServer() {
    if (!CLIENT_ID) return;
    fetch(`/api/state?clientId=${CLIENT_ID}`)
      .then((res) => {
        if (!res.ok) throw new Error("Static or no server");
        return res.json();
      })
      .then((data) => {
        if (data && data.state) {
          state = normalize(data.state);
          render();
        }
      })
      .catch((err) => {
        console.warn("Using local storage (offline/static mode):", err.message);
        // We already have state from loadState() at the top
      });
  }

  initTelegram();
  bindEvents();
  render();
  if (state.focus.running && state.focus.endsAt) {
    syncFocusRemaining();
    if (state.focus.remainingSeconds <= 0) completeFocusSession();
    else startFocusTicker();
  }
  syncFromCloud();
})();
