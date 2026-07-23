"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = [
  { name: "日常", icon: "☕", color: "#F4A58A" },
  { name: "浪漫", icon: "♡", color: "#E47D7D" },
  { name: "旅行", icon: "⌁", color: "#789D90" },
  { name: "美食", icon: "⌇", color: "#D3A24D" },
  { name: "成长", icon: "↗", color: "#7D91B8" },
  { name: "仪式", icon: "✦", color: "#A681A8" },
  { name: "冒险", icon: "△", color: "#D27D5F" },
  { name: "居家", icon: "⌂", color: "#9A806E" },
  { name: "季节", icon: "❋", color: "#78A3A4" },
  { name: "未来", icon: "∞", color: "#B27785" }
];

const TITLES = {
  日常: ["一起逛一次清晨的菜市场", "为对方准备一份早餐", "交换手机拍下的一天", "沿着陌生街道散步", "一起坐末班公交回家", "关掉手机聊一个晚上", "给对方梳一次头发", "一起完成一周早睡挑战", "分享最近循环的歌", "去常去的小店坐窗边"],
  浪漫: ["在夜色里认真告白一次", "写一封只在未来拆的信", "看一场露天电影", "复刻第一次约会", "在雨里共撑一把伞散步", "为对方画一张肖像", "准备一场无理由惊喜", "一起看城市的日落", "在星空下许同一个愿望", "互相写十个喜欢的瞬间"],
  旅行: ["一起坐一次慢火车", "去没有去过的小城住两晚", "看一次海边日出", "只带一个背包去旅行", "在陌生城市骑行", "拍一组同一地点的合照", "一起爬到山顶看云", "用硬币决定下一站", "住一次有院子的民宿", "做一本旅行手账"],
  美食: ["一起学做一道拿手菜", "去吃对方童年的味道", "挑战一家从没试过的餐厅", "做一次深夜甜点", "互相准备便当", "去公园野餐", "一起包一顿饺子", "找到城市里最好吃的面", "做一顿烛光晚餐", "记录十家共同喜欢的小店"],
  成长: ["一起读完同一本书", "交换一项擅长的技能", "制定一份年度共同计划", "参加一次公益活动", "一起完成一次晨跑", "认真聊聊彼此的边界", "拍下共同成长的年度照片", "学习基础急救知识", "一起存下第一笔旅行基金", "为彼此的梦想做一件小事"],
  仪式: ["一起布置一个纪念日", "拍一张每年同姿势的照片", "制作属于我们的播放列表", "定制一件有暗号的小物", "种下一盆共同照顾的植物", "庆祝认识的第 1000 天", "做一个回忆时间胶囊", "交换一份手作礼物", "给未来的家取一个名字", "设计两个人的专属标志"],
  冒险: ["一起坐一次过山车", "尝试一项水上运动", "在周末临时出发", "去密室逃脱当队友", "一起露营过夜", "挑战一条新徒步路线", "在陌生地方问路而不用地图", "去看一场现场演出", "体验一次双人滑翔伞", "在午夜去吃一顿早餐"],
  居家: ["一起重新布置房间", "窝在沙发看完三部电影", "做一顿冰箱清库存料理", "一起拼完一幅大拼图", "养成一个周末家务仪式", "给家里添一盏暖灯", "搭一座毯子城堡", "一起整理旧照片", "在家办一场双人音乐会", "共建一个小小阅读角"],
  季节: ["春天一起去看花", "夏夜一起追萤火虫", "秋天踩一条落叶小路", "冬天煮一锅热红酒", "下第一场雪时去散步", "梅雨季听一下午雨", "摘一次当季水果", "在风最大的一天放风筝", "做一桌节气料理", "记录同一棵树的四季"],
  未来: ["列一张五年后的愿望单", "一起看一次理想中的房子", "聊聊老去后的生活", "为未来旅行做一份地图", "约定一个十年后的见面地", "写下共同生活的十条原则", "一起学习一项长期技能", "建立两个人的应急计划", "想象一次理想的周日", "把第 100 件事留给未来"]
};

const TASKS = Object.entries(TITLES).flatMap(([category, titles]) =>
  titles.map((title, index) => ({
    id: Object.keys(TITLES).indexOf(category) * 10 + index + 1,
    title,
    category,
    description: `不用追求完美，重要的是和喜欢的人一起，把「${title}」变成独一无二的记忆。`,
    budget: ["免费", "低", "适中"][index % 3],
    duration: ["1 小时", "半天", "1 天"][index % 3]
  }))
);

const DEFAULT_STATE = {
  version: 2,
  profile: { nameA: "小满", nameB: "朝朝", startDate: "2024-05-20" },
  completions: {},
  favorites: [12, 23, 41],
  expenses: [],
  budget: 2000,
  theme: "cream"
};

const NAV = [
  ["home", "⌂", "首页"],
  ["tasks", "✓", "清单"],
  ["memories", "◇", "回忆"],
  ["ledger", "¥", "账本"],
  ["settings", "⚙", "我们"]
];

const MOODS = ["🥰", "😌", "🤩", "🥹", "🫶"];
const STORAGE_KEY = "heartlist-state-v2";
const DB_NAME = "heartlist-offline-db";
const DB_STORE = "app";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStoredState() {
  try {
    const db = await openDatabase();
    const value = await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(STORAGE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return value || JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
}

async function writeStoredState(value) {
  try {
    const db = await openDatabase();
    await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE).put(value, STORAGE_KEY);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    db.close();
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
}

async function compressPhoto(file) {
  if (!file?.size) return "";
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", .82);
  } catch {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

function today() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function dateLabel(value, withYear = false) {
  if (!value) return "未记录";
  const [y, m, d] = value.split("-");
  return `${withYear ? `${y}年` : ""}${Number(m)}月${Number(d)}日`;
}

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    shuffle: <><path d="M3 7h3c4 0 5 10 9 10h6"/><path d="m18 14 3 3-3 3M3 17h3c1.8 0 3-2 4-4M15 7h6m-3-3 3 3-3 3"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    heart: <path d="M20.8 5.8c-2.1-2.2-5.5-2.2-7.6 0L12 7l-1.2-1.2a5.3 5.3 0 0 0-7.6 7.4L12 22l8.8-8.8a5.3 5.3 0 0 0 0-7.4Z"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 19h16"/></>,
    upload: <><path d="M12 17V5m0 0 4 4m-4-4L8 9"/><path d="M4 21h16"/></>
  };
  return <svg className="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Heartlist() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState(null);
  const [randomId, setRandomId] = useState(12);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const importRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await readStoredState();
        if (saved && saved.version === 2) setState({ ...DEFAULT_STATE, ...saved, profile: { ...DEFAULT_STATE.profile, ...saved.profile } });
      } catch {}
      setReady(true);
      if ("serviceWorker" in navigator) navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {});
    })();
  }, []);

  useEffect(() => {
    if (ready) writeStoredState(state);
  }, [state, ready]);

  const completed = useMemo(() => Object.entries(state.completions)
    .map(([id, record]) => ({ task: TASKS.find(t => t.id === Number(id)), record }))
    .filter(item => item.task)
    .sort((a, b) => String(b.record.date).localeCompare(String(a.record.date))), [state.completions]);

  const filtered = useMemo(() => TASKS.filter(task => {
    const done = Boolean(state.completions[task.id]);
    const search = `${task.title}${task.description}${task.category}`.toLowerCase().includes(query.toLowerCase());
    const statusOk = status === "all" || (status === "todo" && !done) || (status === "done" && done) || (status === "favorite" && state.favorites.includes(task.id));
    return search && statusOk && (category === "全部" || task.category === category);
  }), [query, status, category, state.completions, state.favorites]);

  const targetMonth = useMemo(() => {
    const value = new Date();
    value.setDate(1);
    value.setMonth(value.getMonth() + monthOffset);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }, [monthOffset]);
  const monthExpenses = state.expenses.filter(item => item.date.startsWith(targetMonth));
  const monthTotal = monthExpenses.reduce((sum, item) => sum + Number(item.amountCents), 0);
  const currentMonth = today().slice(0, 7);
  const thisMonthDone = completed.filter(item => item.record.date?.startsWith(currentMonth)).length;
  const daysTogether = Math.max(1, Math.floor((new Date(`${today()}T00:00:00`) - new Date(`${state.profile.startDate}T00:00:00`)) / 86400000) + 1 || 1);
  const randomTask = TASKS.find(t => t.id === randomId) || TASKS[0];

  function update(next) {
    setState(current => typeof next === "function" ? next(current) : next);
  }
  function flash(message) {
    setToast(message);
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => setToast(""), 2300);
  }
  function go(next) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function shuffle() {
    const pool = TASKS.filter(t => !state.completions[t.id] && t.id !== randomId);
    setRandomId((pool[Math.floor(Math.random() * pool.length)] || TASKS[0]).id);
  }
  function toggleFavorite(id) {
    update(current => ({ ...current, favorites: current.favorites.includes(id) ? current.favorites.filter(x => x !== id) : [...current.favorites, id] }));
  }
  async function saveCompletion(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const taskId = selected.id;
    const file = data.get("photo");
    const finish = photo => {
      update(current => ({ ...current, completions: { ...current.completions, [taskId]: {
        date: data.get("date"), location: data.get("location"), mood: data.get("mood") || "🫶", note: data.get("note"), photo: photo || current.completions[taskId]?.photo || ""
      } } }));
      setSelected(null);
      flash("这件小事，已经变成回忆了");
    };
    if (file?.size) finish(await compressPhoto(file));
    else finish("");
  }
  function addExpense(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Math.round(Number(data.get("amount")) * 100);
    if (!amount || amount < 0) return flash("请输入有效金额");
    update(current => ({ ...current, expenses: [...current.expenses, {
      id: crypto.randomUUID(), amountCents: amount, category: data.get("category"), date: data.get("date"), note: data.get("note"), payer: data.get("payer")
    }] }));
    setExpenseOpen(false);
    flash("已记入约会账本");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clover-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    flash("完整备份已导出");
  }
  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const value = JSON.parse(reader.result);
        if (value.version !== 2 || typeof value.profile !== "object" || typeof value.completions !== "object" || !Array.isArray(value.expenses)) throw new Error();
        update({ ...DEFAULT_STATE, ...value, profile: { ...DEFAULT_STATE.profile, ...value.profile } });
        flash("备份恢复成功");
      } catch { flash("无法识别这个备份文件"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  if (!ready) return <div className="loading"><span>♡</span></div>;

  return (
    <div className={`app theme-${state.theme}`}>
      <aside className="sidebar">
        <button className="brand" onClick={() => go("home")}><img className="brand-mark" src={`${BASE_PATH}/logo.svg`} alt=""/><div><b>Clover</b><small>MAKE LOVER CLOSER</small></div></button>
        <nav>{NAV.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><i>{icon}</i><span>{label}</span>{id === "tasks" && <em>{100 - completed.length}</em>}</button>)}</nav>
        <div className="sidebar-card">
          <span className="avatars"><b>{state.profile.nameA[0]}</b><b>{state.profile.nameB[0]}</b></span>
          <p>{state.profile.nameA} & {state.profile.nameB}</p>
          <small>相恋第 {daysTogether} 天</small>
        </div>
        <p className="privacy">● 数据仅保存在你的设备</p>
      </aside>

      <main>
        <header className="mobile-header"><button className="brand" onClick={() => go("home")}><img className="brand-mark" src={`${BASE_PATH}/logo.svg`} alt=""/><div><b>Clover</b><small>MAKE LOVER CLOSER</small></div></button><button className="mini-avatar" onClick={() => go("settings")}>{state.profile.nameA[0]}{state.profile.nameB[0]}</button></header>

        {view === "home" && <div className="page home-page">
          <section className="welcome">
            <div><p className="overline">THURSDAY, OUR DAY {daysTogether}</p><h1>晚上好，{state.profile.nameA} <span>♡</span></h1><p>爱不是宏大的叙事，是一起完成的每一件小事。</p></div>
            <span className="status-pill"><i/> 本地安全保存</span>
          </section>

          <section className="hero">
            <div className="hero-copy">
              <span className="hero-kicker">OUR 100 THINGS</span>
              <h2>把平凡的日子，<br/>过成以后会怀念的故事。</h2>
              <p>已经共同点亮 <b>{completed.length}</b> 件小事，还有 {100 - completed.length} 次心动正在路上。</p>
              <button onClick={() => go("tasks")}>继续我们的清单 <Icon name="arrow"/></button>
            </div>
            <div className="progress-ring" style={{ "--p": `${completed.length * 3.6}deg` }}>
              <div><strong>{completed.length}</strong><span>/ 100</span><small>已完成</small></div>
            </div>
          </section>

          <section className="stats-row">
            <article><span className="stat-icon coral">♡</span><div><small>相恋时光</small><b>{daysTogether} <em>天</em></b><p>每一天都算数</p></div></article>
            <article><span className="stat-icon sage">✓</span><div><small>本月完成</small><b>{thisMonthDone} <em>件</em></b><p>{thisMonthDone ? "继续保持这份心动" : "选一件小事开始吧"}</p></div></article>
            <article><span className="stat-icon amber">¥</span><div><small>本月花费</small><b>{money(state.expenses.filter(x => x.date.startsWith(currentMonth)).reduce((s, x) => s + x.amountCents, 0))} <em>元</em></b><p>预算 ¥{state.budget}</p></div></article>
          </section>

          <div className="home-grid">
            <section className="panel idea-panel">
              <div className="panel-head"><div><span className="eyebrow">TODAY&apos;S SPARK</span><h2>今天，做点什么？</h2></div><button className="quiet" onClick={shuffle}><Icon name="shuffle"/> 换一个</button></div>
              <article className="idea-card">
                <div className="idea-number">{String(randomTask.id).padStart(2, "0")}</div>
                <div className="idea-body"><span>{randomTask.category} · {randomTask.duration}</span><h3>{randomTask.title}</h3><p>{randomTask.description}</p><button onClick={() => setSelected(randomTask)}>查看这件小事 <Icon name="arrow"/></button></div>
                <button className={`heart-button ${state.favorites.includes(randomTask.id) ? "active" : ""}`} onClick={() => toggleFavorite(randomTask.id)}><Icon name="heart"/></button>
              </article>
            </section>
            <section className="panel recent-panel">
              <div className="panel-head"><div><span className="eyebrow">RECENT MOMENTS</span><h2>最近的我们</h2></div><button className="text-link" onClick={() => go("memories")}>全部回忆 <Icon name="arrow"/></button></div>
              {completed.length ? <div className="recent-list">{completed.slice(0, 3).map(({ task, record }) => <button key={task.id} onClick={() => setSelected(task)}><span className="memory-thumb">{record.photo ? <img src={record.photo} alt=""/> : task.category === "旅行" ? "⌁" : "♡"}</span><div><b>{task.title}</b><p>{record.location || record.note || "一次珍贵的共同经历"}</p></div><time>{dateLabel(record.date)}</time></button>)}</div> : <button className="empty-memory" onClick={() => go("tasks")}><span>♡</span><div><b>第一段回忆还在等你们</b><p>从清单里挑一件喜欢的小事吧</p></div></button>}
            </section>
          </div>
        </div>}

        {view === "tasks" && <div className="page tasks-page">
          <section className="page-title"><div><span className="eyebrow">OUR BUCKET LIST</span><h1>100 件小事</h1><p>慢慢来，爱就在一起完成的过程里。</p></div><div className="title-progress"><b>{completed.length}</b><span>/ 100 已完成</span></div></section>
          <section className="toolbar">
            <label className="search"><Icon name="search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索想一起做的事…"/></label>
            <div className="segment">{[["all","全部"],["todo","待完成"],["done","已完成"],["favorite","已收藏"]].map(([id,label]) => <button key={id} className={status === id ? "active" : ""} onClick={() => setStatus(id)}>{label}</button>)}</div>
          </section>
          <div className="category-row"><button className={category === "全部" ? "active" : ""} onClick={() => setCategory("全部")}><i>∞</i><span>全部</span><b>100</b></button>{CATEGORIES.map(item => <button key={item.name} className={category === item.name ? "active" : ""} onClick={() => setCategory(item.name)}><i style={{ color: item.color }}>{item.icon}</i><span>{item.name}</span><b>10</b></button>)}</div>
          <p className="result-count">显示 {filtered.length} 件小事</p>
          <section className="task-grid">{filtered.map(task => {
            const done = Boolean(state.completions[task.id]);
            return <article key={task.id} className={`task-card ${done ? "done" : ""}`} onClick={() => setSelected(task)}>
              <div className="task-top"><span>{String(task.id).padStart(2, "0")}</span><button className={state.favorites.includes(task.id) ? "active" : ""} onClick={e => { e.stopPropagation(); toggleFavorite(task.id); }}><Icon name="heart"/></button></div>
              <div><small>{task.category}</small><h3>{task.title}</h3><p>{task.description}</p></div>
              <footer><span>{task.budget}预算 · {task.duration}</span><b>{done ? "已完成 ✓" : "去完成 →"}</b></footer>
            </article>;
          })}</section>
          {!filtered.length && <div className="empty-state"><span>⌕</span><h3>没有找到匹配的小事</h3><p>换个关键词或筛选条件试试</p></div>}
        </div>}

        {view === "memories" && <div className="page memories-page">
          <section className="page-title"><div><span className="eyebrow">OUR STORY</span><h1>回忆时间线</h1><p>每一件完成的小事，都是只属于你们的章节。</p></div><button className="primary" onClick={() => go("tasks")}><Icon name="plus"/> 点亮新回忆</button></section>
          {completed.length ? <section className="timeline">{completed.map(({ task, record }, index) => <article key={task.id}>
            <div className="timeline-date"><b>{dateLabel(record.date)}</b><span>{record.date?.slice(0,4)}</span></div>
            <div className="timeline-line"><i>{record.mood || "♡"}</i></div>
            <div className="memory-card" onClick={() => setSelected(task)}>
              {record.photo && <img src={record.photo} alt={task.title}/>}
              <div><span>{task.category} · NO.{String(task.id).padStart(2,"0")}</span><h3>{task.title}</h3>{record.location && <p className="location">⌖ {record.location}</p>}<p>{record.note || "这一天，我们又多了一个共同故事。"}</p></div>
            </div>
          </article>)}</section> : <div className="empty-state large"><span>♡</span><h3>故事正要开始</h3><p>完成第一件小事，这里就会出现属于你们的时间线。</p><button className="primary" onClick={() => go("tasks")}>挑一件小事</button></div>}
        </div>}

        {view === "ledger" && <div className="page ledger-page">
          <section className="page-title"><div><span className="eyebrow">LOVE LEDGER</span><h1>约会账本</h1><p>认真生活，也认真记录一起花掉的快乐。</p></div><button className="primary" onClick={() => setExpenseOpen(true)}><Icon name="plus"/> 记一笔</button></section>
          <section className="ledger-hero">
            <div className="month-switch"><button onClick={() => setMonthOffset(x => x - 1)}>‹</button><span>{targetMonth.replace("-", " 年 ")} 月</span><button onClick={() => setMonthOffset(x => x + 1)} disabled={monthOffset >= 0}>›</button></div>
            <span>本月共同支出</span><strong>¥ {money(monthTotal)}</strong>
            <div className="budget-track"><i style={{ width: `${Math.min(100, monthTotal / (state.budget * 100) * 100)}%` }}/></div>
            <p><span>预算使用 {Math.round(monthTotal / (state.budget * 100) * 100) || 0}%</span><span>剩余 ¥{Math.max(0, state.budget - monthTotal / 100).toFixed(0)}</span></p>
          </section>
          <div className="ledger-grid">
            <section className="panel expense-panel"><div className="panel-head"><h2>支出记录</h2><span>{monthExpenses.length} 笔</span></div>{monthExpenses.length ? <div className="expense-list">{[...monthExpenses].reverse().map(item => <article key={item.id}><i>{CATEGORIES.find(x => x.name === (item.category === "餐饮" ? "美食" : item.category))?.icon || "·"}</i><div><b>{item.note || item.category}</b><span>{dateLabel(item.date)} · {item.payer}</span></div><strong>- ¥{money(item.amountCents)}</strong><button onClick={() => update(s => ({ ...s, expenses: s.expenses.filter(x => x.id !== item.id) }))}>×</button></article>)}</div> : <div className="empty-inline">这个月还没有账目</div>}</section>
            <section className="panel category-panel"><div className="panel-head"><h2>分类占比</h2></div>{["餐饮","交通","娱乐","礼物","其他"].map((cat, i) => { const value = monthExpenses.filter(x => x.category === cat).reduce((s,x) => s + x.amountCents,0); return <div className="category-bar" key={cat}><span>{cat}</span><i><b style={{ width: `${monthTotal ? value / monthTotal * 100 : 0}%`, background: ["#E47D7D","#789D90","#D3A24D","#A681A8","#9A806E"][i] }}/></i><strong>¥{money(value)}</strong></div>})}</section>
          </div>
        </div>}

        {view === "settings" && <div className="page settings-page">
          <section className="page-title"><div><span className="eyebrow">JUST THE TWO OF US</span><h1>我们的设置</h1><p>没有账号，没有云端，你们的数据只属于你们。</p></div></section>
          <div className="settings-grid">
            <section className="panel settings-panel"><div className="settings-heading"><span>♡</span><div><h2>我们的信息</h2><p>用于首页称呼和纪念日计算</p></div></div>
              <div className="field-row"><label><span>你的昵称</span><input value={state.profile.nameA} maxLength={10} onChange={e => update(s => ({...s, profile:{...s.profile,nameA:e.target.value}}))}/></label><label><span>TA 的昵称</span><input value={state.profile.nameB} maxLength={10} onChange={e => update(s => ({...s, profile:{...s.profile,nameB:e.target.value}}))}/></label></div>
              <label><span>在一起的日期</span><input type="date" value={state.profile.startDate} onChange={e => update(s => ({...s, profile:{...s.profile,startDate:e.target.value}}))}/></label>
            </section>
            <section className="panel settings-panel"><div className="settings-heading"><span>◐</span><div><h2>外观与预算</h2><p>让 Clover 更像你们</p></div></div>
              <label><span>页面主题</span><div className="theme-picker">{[["cream","#F7F4EF","奶油"],["rose","#F9F0F0","玫瑰"],["sage","#EFF4F0","鼠尾草"]].map(([id,color,label]) => <button key={id} className={state.theme === id ? "active" : ""} onClick={() => update(s => ({...s,theme:id}))}><i style={{background:color}}/>{label}</button>)}</div></label>
              <label><span>每月约会预算（元）</span><input type="number" min="0" value={state.budget} onChange={e => update(s => ({...s,budget:Number(e.target.value)}))}/></label>
            </section>
            <section className="panel settings-panel wide"><div className="settings-heading"><span>⇩</span><div><h2>数据备份</h2><p>建议每月导出一次，照片也会完整保留</p></div></div>
              <div className="data-stats"><div><b>{completed.length}</b><span>条回忆</span></div><div><b>{state.expenses.length}</b><span>笔账目</span></div><div><b>{(new Blob([JSON.stringify(state)]).size / 1024).toFixed(1)} KB</b><span>本地占用</span></div></div>
              <div className="backup-actions"><button onClick={exportData}><Icon name="download"/><span><b>导出全部数据</b><small>保存为 JSON 文件</small></span></button><button onClick={() => importRef.current?.click()}><Icon name="upload"/><span><b>从备份恢复</b><small>导入 Clover 备份</small></span></button><input ref={importRef} hidden type="file" accept=".json,application/json" onChange={importData}/></div>
            </section>
          </div>
          <p className="local-note"><span>●</span> 离线优先 · 无账号 · 无广告 · 数据仅存本机</p>
        </div>}
      </main>

      <nav className="bottom-nav">{NAV.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>

      {selected && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
        <div className="sheet">
          <button className="sheet-close" onClick={() => setSelected(null)}><Icon name="close"/></button>
          <div className="sheet-number">NO.{String(selected.id).padStart(2,"0")} · {selected.category}</div>
          <h2>{selected.title}</h2><p className="sheet-desc">{selected.description}</p>
          <div className="sheet-meta"><div><span>预算</span><b>{selected.budget}</b></div><div><span>预计用时</span><b>{selected.duration}</b></div><div><span>收藏</span><button onClick={() => toggleFavorite(selected.id)}>{state.favorites.includes(selected.id) ? "♥ 已收藏" : "♡ 收藏"}</button></div></div>
          {state.completions[selected.id] ? <div className="done-detail">{state.completions[selected.id].photo && <img src={state.completions[selected.id].photo} alt="回忆"/>}<span>{state.completions[selected.id].mood} 已于 {dateLabel(state.completions[selected.id].date, true)} 完成</span><p>{state.completions[selected.id].note || "这是一段珍贵的共同回忆。"}</p><button onClick={() => { update(s => { const next={...s.completions}; delete next[selected.id]; return {...s,completions:next}; }); setSelected(null); flash("已恢复为待完成"); }}>撤销完成</button></div> :
          <form className="completion-form" onSubmit={saveCompletion}>
            <h3>把它变成回忆</h3><div className="field-row"><label><span>完成日期</span><input name="date" type="date" defaultValue={today()} required/></label><label><span>地点</span><input name="location" placeholder="我们在哪里"/></label></div>
            <fieldset><legend>这一天的心情</legend><div className="moods">{MOODS.map((m,i) => <label key={m}><input type="radio" name="mood" value={m} defaultChecked={i===4}/><span>{m}</span></label>)}</div></fieldset>
            <label><span>写下一句话</span><textarea name="note" rows="3" maxLength="180" placeholder="今天最想记住的是什么？"/></label>
            <label className="photo-upload"><input type="file" name="photo" accept="image/*"/><span>＋ 添加一张照片（可选）</span></label>
            <button className="primary full">点亮这件小事</button>
          </form>}
        </div>
      </div>}

      {expenseOpen && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setExpenseOpen(false)}><form className="sheet expense-form" onSubmit={addExpense}>
        <button type="button" className="sheet-close" onClick={() => setExpenseOpen(false)}><Icon name="close"/></button><span className="eyebrow">LOVE LEDGER</span><h2>记一笔约会花费</h2>
        <label><span>金额</span><div className="money-input"><b>¥</b><input name="amount" inputMode="decimal" autoFocus placeholder="0.00" required/></div></label>
        <div className="field-row"><label><span>分类</span><select name="category">{["餐饮","交通","娱乐","礼物","住宿","其他"].map(x => <option key={x}>{x}</option>)}</select></label><label><span>付款人</span><select name="payer"><option>共同</option><option>{state.profile.nameA}</option><option>{state.profile.nameB}</option></select></label></div>
        <div className="field-row"><label><span>日期</span><input name="date" type="date" defaultValue={today()} required/></label><label><span>备注</span><input name="note" placeholder="例如：晚餐"/></label></div>
        <button className="primary full">保存这笔记录</button>
      </form></div>}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
