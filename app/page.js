"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = [
  { name: "??", icon: "?", color: "#F4A58A" },
  { name: "??", icon: "?", color: "#E47D7D" },
  { name: "??", icon: "?", color: "#789D90" },
  { name: "??", icon: "?", color: "#D3A24D" },
  { name: "??", icon: "?", color: "#7D91B8" },
  { name: "??", icon: "?", color: "#A681A8" },
  { name: "??", icon: "?", color: "#D27D5F" },
  { name: "??", icon: "?", color: "#9A806E" },
  { name: "??", icon: "?", color: "#78A3A4" },
  { name: "??", icon: "?", color: "#B27785" }
];

const TITLES = {
  ??: ["???????????", "?????????", "?????????", "????????", "?????????", "?????????", "????????", "??????????", "????????", "?????????"],
  ??: ["??????????", "??????????", "???????", "???????", "??????????", "????????", "?????????", "????????", "??????????", "??????????"],
  ??: ["????????", "???????????", "???????", "?????????", "???????", "??????????", "????????", "????????", "?????????", "???????"],
  ??: ["?????????", "?????????", "???????????", "???????", "??????", "?????", "???????", "??????????", "???????", "???????????"],
  ??: ["????????", "?????????", "??????????", "????????", "????????", "?????????", "???????????", "????????", "???????????", "???????????"],
  ??: ["?????????", "???????????", "???????????", "??????????", "???????????", "?????? 1000 ?", "?????????", "????????", "??????????", "??????????"],
  ??: ["????????", "????????", "???????", "????????", "??????", "?????????", "????????????", "????????", "?????????", "?????????"],
  ??: ["????????", "??????????", "??????????", "?????????", "??????????", "????????", "???????", "???????", "??????????", "?????????"],
  ??: ["???????", "????????", "?????????", "????????", "?????????", "????????", "???????", "??????????", "???????", "?????????"],
  ??: ["??????????", "???????????", "????????", "??????????", "???????????", "???????????", "??????????", "??????????", "?????????", "?? 100 ??????"]
};

const TASKS = Object.entries(TITLES).flatMap(([category, titles]) =>
  titles.map((title, index) => ({
    id: Object.keys(TITLES).indexOf(category) * 10 + index + 1,
    title,
    category,
    description: `?????????????????????${title}???????????`,
    budget: ["??", "?", "??"][index % 3],
    duration: ["1 ??", "??", "1 ?"][index % 3]
  }))
);

const DEFAULT_STATE = {
  version: 2,
  profile: { nameA: "??", nameB: "??", startDate: "2024-05-20" },
  completions: {},
  favorites: [12, 23, 41],
  expenses: [],
  budget: 2000,
  theme: "cream"
};

const NAV = [
  ["home", "?", "??"],
  ["tasks", "?", "??"],
  ["memories", "?", "??"],
  ["ledger", "?", "??"],
  ["settings", "?", "??"]
];

const MOODS = ["??", "??", "??", "??", "??"];
const STORAGE_KEY = "heartlist-state-v2";
const DB_NAME = "heartlist-offline-db";
const DB_STORE = "app";

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
  if (!value) return "???";
  const [y, m, d] = value.split("-");
  return `${withYear ? `${y}?` : ""}${Number(m)}?${Number(d)}?`;
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
  const [category, setCategory] = useState("??");
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
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
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
    return search && statusOk && (category === "??" || task.category === category);
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
        date: data.get("date"), location: data.get("location"), mood: data.get("mood") || "??", note: data.get("note"), photo: photo || current.completions[taskId]?.photo || ""
      } } }));
      setSelected(null);
      flash("????????????");
    };
    if (file?.size) finish(await compressPhoto(file));
    else finish("");
  }
  function addExpense(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Math.round(Number(data.get("amount")) * 100);
    if (!amount || amount < 0) return flash("???????");
    update(current => ({ ...current, expenses: [...current.expenses, {
      id: crypto.randomUUID(), amountCents: amount, category: data.get("category"), date: data.get("date"), note: data.get("note"), payer: data.get("payer")
    }] }));
    setExpenseOpen(false);
    flash("???????");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clover-backup-${today()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    flash("???????");
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
        flash("??????");
      } catch { flash("??????????"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  if (!ready) return <div className="loading"><span>?</span></div>;

  return (
    <div className={`app theme-${state.theme}`}>
      <aside className="sidebar">
        <button className="brand" onClick={() => go("home")}><img className="brand-mark" src="/logo.svg" alt=""/><div><b>Clover</b><small>MAKE LOVER CLOSER</small></div></button>
        <nav>{NAV.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><i>{icon}</i><span>{label}</span>{id === "tasks" && <em>{100 - completed.length}</em>}</button>)}</nav>
        <div className="sidebar-card">
          <span className="avatars"><b>{state.profile.nameA[0]}</b><b>{state.profile.nameB[0]}</b></span>
          <p>{state.profile.nameA} & {state.profile.nameB}</p>
          <small>??? {daysTogether} ?</small>
        </div>
        <p className="privacy">? ??????????</p>
      </aside>

      <main>
        <header className="mobile-header"><button className="brand" onClick={() => go("home")}><img className="brand-mark" src="/logo.svg" alt=""/><div><b>Clover</b><small>MAKE LOVER CLOSER</small></div></button><button className="mini-avatar" onClick={() => go("settings")}>{state.profile.nameA[0]}{state.profile.nameB[0]}</button></header>

        {view === "home" && <div className="page home-page">
          <section className="welcome">
            <div><p className="overline">THURSDAY, OUR DAY {daysTogether}</p><h1>????{state.profile.nameA} <span>?</span></h1><p>?????????????????????</p></div>
            <span className="status-pill"><i/> ??????</span>
          </section>

          <section className="hero">
            <div className="hero-copy">
              <span className="hero-kicker">OUR 100 THINGS</span>
              <h2>???????<br/>???????????</h2>
              <p>?????? <b>{completed.length}</b> ?????? {100 - completed.length} ????????</p>
              <button onClick={() => go("tasks")}>??????? <Icon name="arrow"/></button>
            </div>
            <div className="progress-ring" style={{ "--p": `${completed.length * 3.6}deg` }}>
              <div><strong>{completed.length}</strong><span>/ 100</span><small>???</small></div>
            </div>
          </section>

          <section className="stats-row">
            <article><span className="stat-icon coral">?</span><div><small>????</small><b>{daysTogether} <em>?</em></b><p>??????</p></div></article>
            <article><span className="stat-icon sage">?</span><div><small>????</small><b>{thisMonthDone} <em>?</em></b><p>{thisMonthDone ? "????????" : "????????"}</p></div></article>
            <article><span className="stat-icon amber">?</span><div><small>????</small><b>{money(state.expenses.filter(x => x.date.startsWith(currentMonth)).reduce((s, x) => s + x.amountCents, 0))} <em>?</em></b><p>?? ?{state.budget}</p></div></article>
          </section>

          <div className="home-grid">
            <section className="panel idea-panel">
              <div className="panel-head"><div><span className="eyebrow">TODAY&apos;S SPARK</span><h2>????????</h2></div><button className="quiet" onClick={shuffle}><Icon name="shuffle"/> ???</button></div>
              <article className="idea-card">
                <div className="idea-number">{String(randomTask.id).padStart(2, "0")}</div>
                <div className="idea-body"><span>{randomTask.category} ? {randomTask.duration}</span><h3>{randomTask.title}</h3><p>{randomTask.description}</p><button onClick={() => setSelected(randomTask)}>?????? <Icon name="arrow"/></button></div>
                <button className={`heart-button ${state.favorites.includes(randomTask.id) ? "active" : ""}`} onClick={() => toggleFavorite(randomTask.id)}><Icon name="heart"/></button>
              </article>
            </section>
            <section className="panel recent-panel">
              <div className="panel-head"><div><span className="eyebrow">RECENT MOMENTS</span><h2>?????</h2></div><button className="text-link" onClick={() => go("memories")}>???? <Icon name="arrow"/></button></div>
              {completed.length ? <div className="recent-list">{completed.slice(0, 3).map(({ task, record }) => <button key={task.id} onClick={() => setSelected(task)}><span className="memory-thumb">{record.photo ? <img src={record.photo} alt=""/> : task.category === "??" ? "?" : "?"}</span><div><b>{task.title}</b><p>{record.location || record.note || "?????????"}</p></div><time>{dateLabel(record.date)}</time></button>)}</div> : <button className="empty-memory" onClick={() => go("tasks")}><span>?</span><div><b>??????????</b><p>?????????????</p></div></button>}
            </section>
          </div>
        </div>}

        {view === "tasks" && <div className="page tasks-page">
          <section className="page-title"><div><span className="eyebrow">OUR BUCKET LIST</span><h1>100 ???</h1><p>????????????????</p></div><div className="title-progress"><b>{completed.length}</b><span>/ 100 ???</span></div></section>
          <section className="toolbar">
            <label className="search"><Icon name="search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="?????????"/></label>
            <div className="segment">{[["all","??"],["todo","???"],["done","???"],["favorite","???"]].map(([id,label]) => <button key={id} className={status === id ? "active" : ""} onClick={() => setStatus(id)}>{label}</button>)}</div>
          </section>
          <div className="category-row"><button className={category === "??" ? "active" : ""} onClick={() => setCategory("??")}><i>?</i><span>??</span><b>100</b></button>{CATEGORIES.map(item => <button key={item.name} className={category === item.name ? "active" : ""} onClick={() => setCategory(item.name)}><i style={{ color: item.color }}>{item.icon}</i><span>{item.name}</span><b>10</b></button>)}</div>
          <p className="result-count">?? {filtered.length} ???</p>
          <section className="task-grid">{filtered.map(task => {
            const done = Boolean(state.completions[task.id]);
            return <article key={task.id} className={`task-card ${done ? "done" : ""}`} onClick={() => setSelected(task)}>
              <div className="task-top"><span>{String(task.id).padStart(2, "0")}</span><button className={state.favorites.includes(task.id) ? "active" : ""} onClick={e => { e.stopPropagation(); toggleFavorite(task.id); }}><Icon name="heart"/></button></div>
              <div><small>{task.category}</small><h3>{task.title}</h3><p>{task.description}</p></div>
              <footer><span>{task.budget}?? ? {task.duration}</span><b>{done ? "??? ?" : "??? ?"}</b></footer>
            </article>;
          })}</section>
          {!filtered.length && <div className="empty-state"><span>?</span><h3>?????????</h3><p>????????????</p></div>}
        </div>}

        {view === "memories" && <div className="page memories-page">
          <section className="page-title"><div><span className="eyebrow">OUR STORY</span><h1>?????</h1><p>????????????????????</p></div><button className="primary" onClick={() => go("tasks")}><Icon name="plus"/> ?????</button></section>
          {completed.length ? <section className="timeline">{completed.map(({ task, record }, index) => <article key={task.id}>
            <div className="timeline-date"><b>{dateLabel(record.date)}</b><span>{record.date?.slice(0,4)}</span></div>
            <div className="timeline-line"><i>{record.mood || "?"}</i></div>
            <div className="memory-card" onClick={() => setSelected(task)}>
              {record.photo && <img src={record.photo} alt={task.title}/>}
              <div><span>{task.category} ? NO.{String(task.id).padStart(2,"0")}</span><h3>{task.title}</h3>{record.location && <p className="location">? {record.location}</p>}<p>{record.note || "????????????????"}</p></div>
            </div>
          </article>)}</section> : <div className="empty-state large"><span>?</span><h3>??????</h3><p>???????????????????????</p><button className="primary" onClick={() => go("tasks")}>?????</button></div>}
        </div>}

        {view === "ledger" && <div className="page ledger-page">
          <section className="page-title"><div><span className="eyebrow">LOVE LEDGER</span><h1>????</h1><p>??????????????????</p></div><button className="primary" onClick={() => setExpenseOpen(true)}><Icon name="plus"/> ???</button></section>
          <section className="ledger-hero">
            <div className="month-switch"><button onClick={() => setMonthOffset(x => x - 1)}>?</button><span>{targetMonth.replace("-", " ? ")} ?</span><button onClick={() => setMonthOffset(x => x + 1)} disabled={monthOffset >= 0}>?</button></div>
            <span>??????</span><strong>? {money(monthTotal)}</strong>
            <div className="budget-track"><i style={{ width: `${Math.min(100, monthTotal / (state.budget * 100) * 100)}%` }}/></div>
            <p><span>???? {Math.round(monthTotal / (state.budget * 100) * 100) || 0}%</span><span>?? ?{Math.max(0, state.budget - monthTotal / 100).toFixed(0)}</span></p>
          </section>
          <div className="ledger-grid">
            <section className="panel expense-panel"><div className="panel-head"><h2>????</h2><span>{monthExpenses.length} ?</span></div>{monthExpenses.length ? <div className="expense-list">{[...monthExpenses].reverse().map(item => <article key={item.id}><i>{CATEGORIES.find(x => x.name === (item.category === "??" ? "??" : item.category))?.icon || "?"}</i><div><b>{item.note || item.category}</b><span>{dateLabel(item.date)} ? {item.payer}</span></div><strong>- ?{money(item.amountCents)}</strong><button onClick={() => update(s => ({ ...s, expenses: s.expenses.filter(x => x.id !== item.id) }))}>?</button></article>)}</div> : <div className="empty-inline">????????</div>}</section>
            <section className="panel category-panel"><div className="panel-head"><h2>????</h2></div>{["??","??","??","??","??"].map((cat, i) => { const value = monthExpenses.filter(x => x.category === cat).reduce((s,x) => s + x.amountCents,0); return <div className="category-bar" key={cat}><span>{cat}</span><i><b style={{ width: `${monthTotal ? value / monthTotal * 100 : 0}%`, background: ["#E47D7D","#789D90","#D3A24D","#A681A8","#9A806E"][i] }}/></i><strong>?{money(value)}</strong></div>})}</section>
          </div>
        </div>}

        {view === "settings" && <div className="page settings-page">
          <section className="page-title"><div><span className="eyebrow">JUST THE TWO OF US</span><h1>?????</h1><p>?????????????????????</p></div></section>
          <div className="settings-grid">
            <section className="panel settings-panel"><div className="settings-heading"><span>?</span><div><h2>?????</h2><p>????????????</p></div></div>
              <div className="field-row"><label><span>????</span><input value={state.profile.nameA} maxLength={10} onChange={e => update(s => ({...s, profile:{...s.profile,nameA:e.target.value}}))}/></label><label><span>TA ???</span><input value={state.profile.nameB} maxLength={10} onChange={e => update(s => ({...s, profile:{...s.profile,nameB:e.target.value}}))}/></label></div>
              <label><span>??????</span><input type="date" value={state.profile.startDate} onChange={e => update(s => ({...s, profile:{...s.profile,startDate:e.target.value}}))}/></label>
            </section>
            <section className="panel settings-panel"><div className="settings-heading"><span>?</span><div><h2>?????</h2><p>? Clover ????</p></div></div>
              <label><span>????</span><div className="theme-picker">{[["cream","#F7F4EF","??"],["rose","#F9F0F0","??"],["sage","#EFF4F0","???"]].map(([id,color,label]) => <button key={id} className={state.theme === id ? "active" : ""} onClick={() => update(s => ({...s,theme:id}))}><i style={{background:color}}/>{label}</button>)}</div></label>
              <label><span>?????????</span><input type="number" min="0" value={state.budget} onChange={e => update(s => ({...s,budget:Number(e.target.value)}))}/></label>
            </section>
            <section className="panel settings-panel wide"><div className="settings-heading"><span>?</span><div><h2>????</h2><p>?????????????????</p></div></div>
              <div className="data-stats"><div><b>{completed.length}</b><span>???</span></div><div><b>{state.expenses.length}</b><span>???</span></div><div><b>{(new Blob([JSON.stringify(state)]).size / 1024).toFixed(1)} KB</b><span>????</span></div></div>
              <div className="backup-actions"><button onClick={exportData}><Icon name="download"/><span><b>??????</b><small>??? JSON ??</small></span></button><button onClick={() => importRef.current?.click()}><Icon name="upload"/><span><b>?????</b><small>?? Clover ??</small></span></button><input ref={importRef} hidden type="file" accept=".json,application/json" onChange={importData}/></div>
            </section>
          </div>
          <p className="local-note"><span>?</span> ???? ? ??? ? ??? ? ??????</p>
        </div>}
      </main>

      <nav className="bottom-nav">{NAV.map(([id, icon, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><i>{icon}</i><span>{label}</span></button>)}</nav>

      {selected && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
        <div className="sheet">
          <button className="sheet-close" onClick={() => setSelected(null)}><Icon name="close"/></button>
          <div className="sheet-number">NO.{String(selected.id).padStart(2,"0")} ? {selected.category}</div>
          <h2>{selected.title}</h2><p className="sheet-desc">{selected.description}</p>
          <div className="sheet-meta"><div><span>??</span><b>{selected.budget}</b></div><div><span>????</span><b>{selected.duration}</b></div><div><span>??</span><button onClick={() => toggleFavorite(selected.id)}>{state.favorites.includes(selected.id) ? "? ???" : "? ??"}</button></div></div>
          {state.completions[selected.id] ? <div className="done-detail">{state.completions[selected.id].photo && <img src={state.completions[selected.id].photo} alt="??"/>}<span>{state.completions[selected.id].mood} ?? {dateLabel(state.completions[selected.id].date, true)} ??</span><p>{state.completions[selected.id].note || "????????????"}</p><button onClick={() => { update(s => { const next={...s.completions}; delete next[selected.id]; return {...s,completions:next}; }); setSelected(null); flash("???????"); }}>????</button></div> :
          <form className="completion-form" onSubmit={saveCompletion}>
            <h3>??????</h3><div className="field-row"><label><span>????</span><input name="date" type="date" defaultValue={today()} required/></label><label><span>??</span><input name="location" placeholder="?????"/></label></div>
            <fieldset><legend>??????</legend><div className="moods">{MOODS.map((m,i) => <label key={m}><input type="radio" name="mood" value={m} defaultChecked={i===4}/><span>{m}</span></label>)}</div></fieldset>
            <label><span>?????</span><textarea name="note" rows="3" maxLength="180" placeholder="???????????"/></label>
            <label className="photo-upload"><input type="file" name="photo" accept="image/*"/><span>? ??????????</span></label>
            <button className="primary full">??????</button>
          </form>}
        </div>
      </div>}

      {expenseOpen && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setExpenseOpen(false)}><form className="sheet expense-form" onSubmit={addExpense}>
        <button type="button" className="sheet-close" onClick={() => setExpenseOpen(false)}><Icon name="close"/></button><span className="eyebrow">LOVE LEDGER</span><h2>???????</h2>
        <label><span>??</span><div className="money-input"><b>?</b><input name="amount" inputMode="decimal" autoFocus placeholder="0.00" required/></div></label>
        <div className="field-row"><label><span>??</span><select name="category">{["??","??","??","??","??","??"].map(x => <option key={x}>{x}</option>)}</select></label><label><span>???</span><select name="payer"><option>??</option><option>{state.profile.nameA}</option><option>{state.profile.nameB}</option></select></label></div>
        <div className="field-row"><label><span>??</span><input name="date" type="date" defaultValue={today()} required/></label><label><span>??</span><input name="note" placeholder="?????"/></label></div>
        <button className="primary full">??????</button>
      </form></div>}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
