/* Telic — site interactions. Vanilla JS, no dependencies. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const SVGNS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const fmt = (n) => Math.round(n).toLocaleString("en-IN");
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- nav, progress, mobile menu ---------------- */
  const nav = $("#nav"), progress = $("#progress");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const burger = $("#burger"), menu = $("#mobileMenu");
  burger.addEventListener("click", () => { const open = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", open); });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); }));

  /* ---------------- phantom keyboard ---------------- */
  (function keys() {
    const host = $("#keys"); if (!host) return;
    const sets = [
      ["Ctrl + C", "Alt + Tab", "Ctrl + V", "Tab", "Tab", "Enter", "Ctrl + S", "F5", "Esc", "↓", "↓", "Enter", "Alt + Tab"],
      ["Shift + Tab", "Ctrl + F", "Home", "Ctrl + C", "Alt + Tab", "F2", "Ctrl + V", "Tab", "Space", "Enter", "Alt + F4", "Ctrl + Z"],
      ["Tab", "Tab", "Ctrl + A", "Del", "Ctrl + V", "Enter", "Alt + Tab", "Ctrl + P", "Esc", "Ctrl + C", "Page Down", "Tab"],
    ];
    const durs = [70, 85, 62];
    sets.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "krow" + (i % 2 ? " rev" : "");
      row.style.setProperty("--dur", durs[i] + "s");
      const html = s.map((k) => `<span class="key${k === "Space" ? " wide" : ""}">${k}</span>`).join("");
      row.innerHTML = html + html;
      host.appendChild(row);
    });
    if (reduced) return;
    const keysEls = $$(".key", host);
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);
    setInterval(() => {
      if (!visible) return;
      for (let n = 0; n < 2; n++) {
        const k = keysEls[(Math.random() * keysEls.length) | 0];
        const ai = Math.random() < 0.12;
        k.classList.add("press"); if (ai) k.classList.add("ai");
        setTimeout(() => k.classList.remove("press", "ai"), 260 + Math.random() * 200);
      }
    }, 140);
  })();

  /* ================================================================
     MOTION LAYER — preloader, curtain, cursor, split lines, reveals,
     manifesto, stacking, horizontal scroll, parallax, logo animation
     ================================================================ */
  const body = document.body;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (!$(".grain")) { const g = document.createElement("div"); g.className = "grain"; body.appendChild(g); }
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  curtain.innerHTML = '<svg aria-hidden="true"><use href="#mark"/></svg>';
  body.appendChild(curtain);

  /* --- split headings into lines --- */
  function splitLines(el) {
    if (!el.__orig) el.__orig = el.innerHTML;
    const tmp = document.createElement("div"); tmp.innerHTML = el.__orig;
    const out = [];
    (function walk(node, open, close) {
      node.childNodes.forEach((ch) => {
        if (ch.nodeType === 3) ch.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; out.push(/^\s+$/.test(w) ? " " : `<span class="w">${open}${w}${close}</span>`); });
        else if (ch.nodeName === "BR") out.push("<br>");
        else { const t = ch.nodeName.toLowerCase(); walk(ch, `${open}<${t}>`, `</${t}>${close}`); }
      });
    })(tmp, "", "");
    el.innerHTML = out.join("");
    const lines = []; let top = null, cur = null;
    $$(".w", el).forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; } cur.push(w.innerHTML); });
    el.innerHTML = lines.map((ln, i) => `<span class="line"><span style="transition-delay:${i * 90}ms">${ln.join(" ")}</span></span>`).join("");
  }

  /* --- reveals --- */
  function runReveals() {
    $$(".split").forEach(splitLines);
    const targets = $$(".reveal, [data-reveal], .split");
    if (reduced) { targets.forEach((t) => t.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      const d = e.target.dataset.delay; if (d) e.target.style.transitionDelay = d + "ms";
      e.target.classList.add("in"); io.unobserve(e.target);
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((t) => io.observe(t));
  }
  let lastW = innerWidth, rT;
  addEventListener("resize", () => {
    clearTimeout(rT); rT = setTimeout(() => {
      if (Math.abs(innerWidth - lastW) < 40) return; lastW = innerWidth;
      $$(".split").forEach((el) => { const was = el.classList.contains("in"); splitLines(el); if (was) el.classList.add("in"); });
    }, 250);
  });

  /* --- preloader (first page per session) & page start --- */
  let started = false;
  const heroStart = [];
  function startPage() {
    if (started) return; started = true;
    body.classList.add("ready");
    const go = () => { runReveals(); heroStart.forEach((f) => f()); };
    if (document.fonts && document.fonts.ready) { let done = false; const once = () => { if (!done) { done = true; go(); } }; document.fonts.ready.then(once); setTimeout(once, 1200); }
    else go();
  }
  (function preloader() {
    const pre = $(".preloader");
    const seen = document.documentElement.classList.contains("seen");
    try { sessionStorage.setItem("telic-seen", "1"); } catch (e) {}
    if (!pre || seen || reduced) { if (pre) pre.remove(); if (!reduced) curtain.classList.add("out"); startPage(); return; }
    const out = $(".pl-outline", pre), nodes = $$(".pl-node", pre), tip = $(".pl-tip", pre), ring = $(".pl-ring", pre);
    const L = out.getTotalLength();
    // each node lights up at the moment the line actually reaches it
    const S = 480, pts = [];
    for (let i = 0; i <= S; i++) pts.push(out.getPointAtLength((L * i) / S));
    const at = nodes.map((n) => {
      const cx = +n.getAttribute("cx"), cy = +n.getAttribute("cy");
      const d = pts.map((p) => Math.hypot(p.x - cx, p.y - cy)), min = Math.min(...d);
      return d.findIndex((v) => v <= min + 3) / S;
    });
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const DRAW = 1900;
    let t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / DRAW), e = ease(p);
      out.style.strokeDashoffset = 1 - e;
      const pt = out.getPointAtLength(L * e);
      tip.setAttribute("cx", pt.x); tip.setAttribute("cy", pt.y);
      tip.style.opacity = p > 0.94 ? 0 : 1;
      nodes.forEach((n, i) => {
        if (e >= at[i] && !n.classList.contains("on")) { n.classList.add("on"); if (n.classList.contains("ai")) ring.classList.add("go"); }
      });
      if (p < 1) requestAnimationFrame(step); else finish();
    }
    function finish() {
      nodes.forEach((n) => n.classList.add("on"));
      setTimeout(() => pre.classList.add("solid"), 120);
      setTimeout(() => { pre.classList.add("leave"); startPage(); }, 1100);
      setTimeout(() => pre.remove(), 2300);
    }
    setTimeout(() => requestAnimationFrame(step), 250);
  })();

  /* --- page transitions --- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a || reduced) return;
    const href = a.getAttribute("href");
    if (!href || href[0] === "#" || a.target === "_blank" || e.metaKey || e.ctrlKey || /^(mailto|tel|javascript):/.test(href) || !/\.html/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    if (href.split("#")[0] === here) return;
    e.preventDefault();
    curtain.classList.remove("out"); void curtain.offsetWidth; curtain.classList.add("in");
    setTimeout(() => { location.href = href; }, 600);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) curtain.classList.remove("in"); });

  /* --- custom cursor --- */
  if (fine && !reduced) {
    body.classList.add("has-cursor");
    const cur = document.createElement("div"), dot = document.createElement("div");
    cur.className = "cursor"; dot.className = "cursor-dot"; body.append(cur, dot);
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => { body.classList.add("cursor-live"); mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    document.addEventListener("mouseleave", () => body.classList.remove("cursor-live"));
    (function loop() { cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", (e) => {
      const h = e.target.closest("a,button,summary,[data-cursor],label,input[type=range]");
      cur.classList.toggle("hover", !!h);
      const lab = h && h.getAttribute("data-cursor");
      cur.classList.toggle("label", !!lab); if (lab) cur.setAttribute("data-label", lab);
    });
  }

  /* --- nav hides on the way down, returns on the way up --- */
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("hide", y > lastY && y > 500 && !menu.classList.contains("open"));
    lastY = y;
  }, { passive: true });

  /* --- manifesto words light up with scroll --- */
  const mani = $(".manifesto"); let maniWords = [];
  if (mani) {
    const tmp = document.createElement("div"); tmp.innerHTML = mani.innerHTML; const o = [];
    (function walk(node, a, b) { node.childNodes.forEach((ch) => { if (ch.nodeType === 3) ch.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; o.push(/^\s+$/.test(w) ? " " : `<span class="w">${a}${w}${b}</span>`); }); else { const t = ch.nodeName.toLowerCase(); walk(ch, `${a}<${t}>`, `</${t}>${b}`); } }); })(tmp, "", "");
    mani.innerHTML = o.join(""); maniWords = $$(".w", mani);
    if (reduced) maniWords.forEach((w) => w.classList.add("on"));
  }

  /* --- horizontal pinned track + parallax --- */
  const hs = $(".hscroll"), hTrack = hs && $(".hscroll-track", hs);
  const pars = $$("[data-speed]");
  function sizeH() {
    if (!hs || reduced) return;
    if (innerWidth <= 960) { hs.style.height = ""; return; }
    hs.style.height = innerHeight + Math.max(0, hTrack.scrollWidth - innerWidth) + "px";
  }
  function onMotion() {
    if (reduced) return;
    const vh = innerHeight;
    if (hs && innerWidth > 960) {
      const r = hs.getBoundingClientRect(), dist = hTrack.scrollWidth - innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      hTrack.style.transform = `translate3d(${(-dist * p).toFixed(1)}px,0,0)`;
    }
    if (maniWords.length) {
      const mr = mani.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (vh * 0.85 - mr.top) / (mr.height + vh * 0.3)));
      const k = Math.floor(prog * maniWords.length);
      maniWords.forEach((w, i) => w.classList.toggle("on", i < k));
    }
    pars.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      const s = parseFloat(el.dataset.speed), c = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-c * s).toFixed(1)}px,0)`;
    });
  }
  addEventListener("scroll", onMotion, { passive: true });
  addEventListener("resize", () => { sizeH(); onMotion(); });
  addEventListener("load", () => { sizeH(); onMotion(); });
  sizeH(); onMotion();

  /* --- the Telic logo, drawing itself as a workflow --- */
  (function heroViz() {
    const box = $("#heroViz"); if (!box) return;
    const outline = $("#vizOutline"), pulse = $("#vizPulse");
    const nodes = $$(".node", box), labels = $$(".viz-label", box), stat = $$(".viz-status span", box);
    const L = outline.getTotalLength();
    outline.style.strokeDasharray = L; outline.style.strokeDashoffset = L;
    const setStat = (i) => stat.forEach((s, k) => s.classList.toggle("on", k === i));
    const light = (i) => { nodes[i].classList.add("on"); labels[i].classList.add("on"); };
    if (reduced) { outline.style.strokeDashoffset = 0; nodes.forEach((_, i) => light(i)); setStat(3); return; }
    async function loop() {
      for (;;) {
        nodes.forEach((n) => n.classList.remove("on")); labels.forEach((l) => l.classList.remove("on")); setStat(-1);
        outline.style.transition = "none"; outline.style.strokeDashoffset = L; outline.getBoundingClientRect();
        outline.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.6,.1,.2,1)"; outline.style.strokeDashoffset = 0;
        await wait(900); setStat(0);
        await wait(700); light(0);
        await wait(700); setStat(1); light(1);
        await wait(700); light(2);
        await wait(900);
        light(3); pulse.classList.remove("go"); pulse.getBoundingClientRect(); pulse.classList.add("go");
        await wait(1300); setStat(2); light(4);
        await wait(900); setStat(3);
        await wait(3200);
        outline.style.transition = "stroke-dashoffset 1s ease-in"; outline.style.strokeDashoffset = -L;
        labels.forEach((l) => l.classList.remove("on")); nodes.forEach((n) => n.classList.remove("on")); setStat(-1);
        await wait(1100);
      }
    }
    heroStart.push(() => setTimeout(loop, 500));
  })();

  /* ---------------- magnetic buttons ---------------- */
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--bx", `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
        b.style.setProperty("--by", `${(e.clientY - r.top - r.height / 2) * 0.28}px`);
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  (function liveDemo() {
  if (!document.getElementById("desk")) return;
  /* =================================================================
     LIVE DEMO
     ================================================================= */
  const STEPS = [
    { id: "read", name: "Read the invoice" },
    { id: "supplier", name: "Find the supplier" },
    { id: "dup", name: "Check for duplicates" },
    { id: "fill", name: "Fill in the invoice" },
    { id: "lines", name: "Add line items" },
    { id: "approval", name: "Approval needed?" },
    { id: "post", name: "Post & verify" },
  ];
  const MODES = {
    learn: { read: "ai", supplier: "ai", dup: "ai", fill: "ai", lines: "ai", approval: "ai", post: "ai" },
    repeat: { read: "ai", supplier: "mem", dup: "mem", fill: "mem", lines: "mem", approval: "ai", post: "mem" },
    popup: { read: "ai", supplier: "mem", dup: "mem", fill: "mem", lines: "mem", approval: "ai", post: "mem" },
    human: { read: "ai", supplier: "mem", dup: "mem", fill: "mem", lines: "mem", approval: "ai", post: "mem" },
  };
  const LINES = [["Corrugated boxes (L)", "1,200", "45.00", "54,000.00"], ["Packing tape 48mm", "600", "36.00", "21,600.00"], ["Stretch film roll", "240", "330.00", "79,200.00"]];

  const D = {
    steps: $("#steps"), state: $("#state"), log: $("#log"), ghost: $("#ghost"), pane: $("#erpPane"),
    mAI: $("#mAI"), mMem: $("#mMem"), mTime: $("#mTime"), grid: $("#grid"), posted: $("#posted"), popup: $("#popup"),
    pick: $("#pickModal"), takeover: $("#takeover"), takeBtn: $("#takeBtn"), handBtn: $("#handBtn"), runBtn: $("#runBtn"),
    erpStatus: $("#erpStatus"), appr: $("#apprChk"), scan: $("#scan"), postBtn: $("#postBtn"),
  };
  let scenario = "learn", runId = 0, running = false, counters = { ai: 0, mem: 0, t: 0 };
  let humanTook = false, humanPick = null, humanHanded = false;

  class Cancel extends Error {}
  const guard = (id) => { if (id !== runId) throw new Cancel(); };
  const sleep = async (ms, id) => { await wait(reduced ? Math.min(ms, 60) : ms); guard(id); };

  function renderSteps() {
    D.steps.innerHTML = STEPS.map((s) => `<li class="step" data-step="${s.id}"><span class="ic"></span><span>${s.name}</span><span class="tag"></span></li>`).join("");
  }
  const stepEl = (id) => $(`[data-step="${id}"]`, D.steps);
  function setTag(id, cls, text) { const t = $(".tag", stepEl(id)); t.className = `tag ${cls} show`; t.textContent = text; }
  function setState(cls, text) { D.state.className = `state ${cls}`; D.state.innerHTML = `<i></i>${text}`; }
  function log(msg, cls = "") {
    const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = msg; D.log.appendChild(d);
    while (D.log.children.length > 5) D.log.firstChild.remove();
  }
  function meters() { D.mAI.textContent = counters.ai; D.mMem.textContent = counters.mem; D.mTime.textContent = counters.t.toFixed(1) + "s"; }
  const field = (f) => $(`[data-f="${f}"]`, D.pane);

  function resetDemo() {
    runId++; running = false;
    renderSteps(); counters = { ai: 0, mem: 0, t: 0 }; meters();
    setState("", "Idle"); D.log.innerHTML = "<div>Ready. Press play.</div>";
    $$("[data-f]", D.pane).forEach((el) => { el.textContent = ""; el.className = "inp"; });
    $$(".grid > div:not(.gh)", D.pane).forEach((r) => r.remove());
    D.posted.classList.remove("on"); D.popup.classList.remove("on"); D.pick.classList.remove("on");
    D.takeover.classList.remove("on"); D.handBtn.disabled = true; D.takeBtn.disabled = false;
    $$("#pickList button").forEach((b) => { b.disabled = true; b.classList.remove("sel"); });
    $(".chk i", D.pane).textContent = ""; D.erpStatus.textContent = "Ready";
    $$("[data-hl]").forEach((h) => h.classList.remove("hl"));
    D.ghost.style.opacity = 0; D.runBtn.textContent = "▶ Play"; D.runBtn.disabled = false;
    humanTook = false; humanPick = null; humanHanded = false;
    $$("#explain [data-scn]").forEach((d) => d.classList.toggle("on", d.dataset.scn === scenario));
  }

  async function moveGhost(target, id, fast) {
    const pr = D.pane.getBoundingClientRect(), tr = target.getBoundingClientRect();
    const x = tr.left - pr.left + Math.min(tr.width * 0.5, 40), y = tr.top - pr.top + tr.height * 0.55;
    D.ghost.style.transitionDuration = fast ? ".2s" : ".55s";
    D.ghost.style.opacity = 1; D.ghost.style.transform = `translate(${x}px, ${y}px)`;
    await sleep(fast ? 220 : 580, id);
  }
  async function click(id) { D.ghost.classList.remove("click"); void D.ghost.offsetWidth; D.ghost.classList.add("click"); await sleep(140, id); }
  async function type(f, text, id, mode) {
    const el = field(f);
    await moveGhost(el, id, mode === "mem"); await click(id);
    el.classList.add("caret", "flash"); el.textContent = "";
    if (mode === "mem") { el.textContent = text; await sleep(120, id); }
    else for (const ch of text) { el.textContent += ch; await sleep(28 + Math.random() * 30, id); }
    el.classList.remove("caret", "flash"); el.classList.add("ok");
  }
  const hl = async (k, id) => { const h = $(`[data-hl="${k}"]`); if (h) { h.classList.add("hl"); await sleep(260, id); } };

  async function think(id, ms = 900) { counters.ai++; counters.t += 3.2 + Math.random(); meters(); await sleep(ms, id); }
  async function recall(id) { counters.mem++; counters.t += 0.3 + Math.random() * 0.3; meters(); await sleep(160, id); }

  async function doStep(s, mode, id) {
    const el = stepEl(s.id);
    el.classList.add("active");
    if (mode === "ai") setTag(s.id, "ai", scenario === "learn" ? "AI · learning" : "AI");
    else setTag(s.id, "mem", "Memory");
    D.erpStatus.textContent = s.name + "…";

    switch (s.id) {
      case "read": {
        setState("run", "Understanding");
        D.scan.classList.remove("go"); void D.scan.offsetWidth; D.scan.classList.add("go");
        await think(id, 700);
        for (const k of ["supplier", "invno", "date", "lines", "total"]) await hl(k, id);
        log("AI read invoice NS/24-25/0812 · 3 lines · ₹1,82,664", "ai");
        setState("run", "Executing");
        break;
      }
      case "supplier": {
        if (scenario === "human") {
          await recall(id);
          await moveGhost(field("sid"), id, true); await click(id);
          D.pick.classList.add("on");
          el.classList.remove("active"); el.classList.add("wait");
          setTag(s.id, "human", "Your call");
          setState("attn", "Needs attention");
          log("2 suppliers match “Northstar Supplies”. Pausing safely.", "hm");
          log("→ Press “Take over” and choose the right one.", "hm");
          D.ghost.style.opacity = 0;
          D.takeover.classList.add("on");
          while (!humanHanded) await sleep(120, id);
          D.pick.classList.remove("on"); D.takeover.classList.remove("on");
          const [sid, name] = humanPick.split("|");
          field("sid").textContent = sid; field("sname").textContent = name;
          field("sid").className = "inp ok"; field("sname").className = "inp ok";
          el.classList.remove("wait"); el.classList.add("active");
          setState("run", "Verifying");
          await sleep(500, id);
          log(`Handed back. Verified ${sid} on screen ✓ Resuming.`, "good");
          setTag(s.id, "human", "Person ✓");
          setState("run", "Executing");
          break;
        }
        if (mode === "ai") { await think(id, 500); log("AI matched supplier V-2048 (GSTIN on invoice)", "ai"); }
        else { await recall(id); log("Memory: supplier lookup replayed", "mem"); }
        await type("sid", "V-2048", id, mode);
        await type("sname", "Northstar Supplies Pvt Ltd", id, "mem");
        break;
      }
      case "dup": {
        if (mode === "ai") await think(id, 500); else await recall(id);
        await type("dup", "No match", id, mode);
        log("No existing record for NS/24-25/0812 ✓", mode === "ai" ? "ai" : "mem");
        break;
      }
      case "fill": {
        if (scenario === "popup") {
          await recall(id);
          await moveGhost(field("invno"), id, true);
          D.popup.classList.add("on");
          el.classList.remove("active"); el.classList.add("fail");
          setTag(s.id, "mem", "Memory ✗");
          setState("err", "Step blocked");
          log("Remembered step failed: unexpected window", "bad");
          D.ghost.style.opacity = 0;
          await sleep(1100, id);
          setState("run", "Recovering");
          el.classList.remove("fail"); el.classList.add("active");
          setTag(s.id, "fix", "AI fixing");
          log("Isolated to this one step. Rest of the run is safe.", "");
          await think(id, 1100);
          log("AI: updater popup, harmless → “Remind me later”", "ai");
          await moveGhost($("#remindBtn"), id); await click(id);
          $("#remindBtn").classList.add("press"); await sleep(150, id); $("#remindBtn").classList.remove("press");
          D.popup.classList.remove("on");
          await type("invno", "NS/24-25/0812", id, "ai");
          await type("date", "21-10-2026", id, "ai");
          await type("total", "1,82,664.00", id, "ai");
          setTag(s.id, "fix", "Fixed · saved");
          log("Fix verified and saved — next run won't need AI here", "good");
          setState("run", "Executing");
          break;
        }
        if (mode === "ai") await think(id, 400); else await recall(id);
        await type("invno", "NS/24-25/0812", id, mode);
        await type("date", "21-10-2026", id, mode);
        await type("total", "1,82,664.00", id, mode);
        if (mode === "mem") log("Memory: invoice header replayed", "mem");
        break;
      }
      case "lines": {
        if (mode === "ai") await think(id, 400); else await recall(id);
        for (const l of LINES) {
          const r = document.createElement("div"); r.className = "new";
          r.innerHTML = l.map((c) => `<span>${c}</span>`).join("");
          D.grid.appendChild(r);
          await sleep(mode === "ai" ? 420 : 140, id);
        }
        log(`3 line items entered${mode === "mem" ? " from memory" : ""}`, mode === "ai" ? "ai" : "mem");
        break;
      }
      case "approval": {
        await think(id, 900);
        log("AI: ₹1,82,664 is above the ₹1,50,000 limit → route for approval", "ai");
        await moveGhost(D.appr, id, false); await click(id);
        $(".chk i", D.pane).textContent = "✓";
        break;
      }
      case "post": {
        if (mode === "ai") await think(id, 400); else await recall(id);
        setState("run", "Verifying");
        await moveGhost(D.postBtn, id, mode === "mem"); await click(id);
        D.postBtn.classList.add("press"); await sleep(150, id); D.postBtn.classList.remove("press");
        D.erpStatus.textContent = "Saving record…"; await sleep(500, id);
        D.posted.classList.add("on"); D.erpStatus.textContent = "Record AP-77341 saved";
        D.ghost.style.opacity = 0;
        await sleep(300, id);
        log("Verified: AP-77341 saved, every field matches ✓", "good");
        break;
      }
    }
    el.classList.remove("active"); el.classList.add("done");
    if (mode === "ai" && scenario === "learn") setTag(s.id, "ai", "Learned ✓");
    await sleep(mode === "ai" ? 220 : 90, id);
  }

  async function runDemo() {
    resetDemo();
    const id = runId; running = true;
    D.runBtn.textContent = "Running…"; D.runBtn.disabled = true;
    D.log.innerHTML = "";
    log(`Run started: ${{ learn: "first run", repeat: "repeat run", popup: "repeat run", human: "repeat run" }[scenario]}`);
    try {
      for (const s of STEPS) await doStep(s, MODES[scenario][s.id], id);
      setState("ok", "Completed");
      const summary = { learn: "Learned 7 steps. Next time, most of this runs from memory.", repeat: "Done. 5 of 7 steps from memory — only 2 needed AI.", popup: "Done. Telic fixed the one broken step and remembered the fix.", human: "Done. A person made the call; Telic did the rest." }[scenario];
      log(summary, "good");
      D.runBtn.textContent = "↻ Play again"; D.runBtn.disabled = false; running = false;
    } catch (e) { if (!(e instanceof Cancel)) throw e; }
  }

  renderSteps(); resetDemo();
  D.runBtn.addEventListener("click", runDemo);
  $$(".scenario").forEach((b) => b.addEventListener("click", () => {
    $$(".scenario").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
    scenario = b.dataset.scn; resetDemo(); runDemo();
  }));
  $$("#explain [data-scn]").forEach((d) => { d.style.cursor = "pointer"; d.addEventListener("click", () => $(`.scenario[data-scn="${d.dataset.scn}"]`).click()); });
  D.takeBtn.addEventListener("click", () => {
    humanTook = true; D.takeBtn.disabled = true;
    $$("#pickList button").forEach((b) => (b.disabled = false));
    setState("attn", "You're in control");
    log("You have control of the screen. Pick a supplier.", "hm");
  });
  $$("#pickList button").forEach((b) => b.addEventListener("click", () => {
    $$("#pickList button").forEach((x) => x.classList.toggle("sel", x === b));
    humanPick = b.dataset.v; D.handBtn.disabled = false;
  }));
  D.handBtn.addEventListener("click", () => { if (humanPick) humanHanded = true; });

  let demoAuto = false;
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !demoAuto) { demoAuto = true; setTimeout(() => { if (!running) runDemo(); }, 500); } }, { threshold: 0.45 }).observe($("#desk"));

  })();

  /* ---------------- learning history (barcode) ---------------- */
  (function history() {
    const svg = $("#barcode"); if (!svg) return;
    const COLS = 120, ROWS = 7, CW = 10, RH = 34, GAP = 2;
    svg.setAttribute("viewBox", `0 0 ${COLS * CW} ${ROWS * RH}`);
    const runOf = (i) => (i < 10 ? i + 1 : 10 + Math.round(Math.pow((i - 10) / (COLS - 11), 1.6) * 990));
    // which steps needed AI on each sampled run
    const EVENTS = {
      58: { rows: [6], note: "<b>TradeDesk updated</b> and moved the Post button. Telic re-learned that one step — the rest kept running from memory." },
      93: { rows: [1], note: "<b>A new supplier</b> appeared that wasn't in the master list. Telic worked it out, then remembered it." },
    };
    const aiRows = (i) => {
      if (i === 0) return [0, 1, 2, 3, 4, 5, 6];
      if (i === 1) return [0, 4, 5];
      const r = [0, 5];
      if (EVENTS[i]) r.push(...EVENTS[i].rows);
      return r;
    };
    const cells = [];
    for (let c = 0; c < COLS; c++) {
      const ai = aiRows(c); const col = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(svgEl("rect", { x: c * CW + GAP / 2, y: r * RH + GAP / 2, width: CW - GAP, height: RH - GAP, rx: 1.5, fill: ai.includes(r) ? "#ea5b25" : "#2c3d63", opacity: 0.25 }, svg));
      }
      cells.push(col);
    }
    const cursor = svgEl("rect", { x: 0, y: 0, width: CW, height: ROWS * RH, fill: "none", stroke: "#f3ecdf", "stroke-width": 1.5 }, svg);
    const range = $("#hRange"), hRun = $("#hRun"), hNote = $("#hNote"), hAI = $("#hAI"), hMem = $("#hMem");
    const note = (i, k) => {
      if (EVENTS[i]) return EVENTS[i].note;
      if (i === 0) return "First run: <b>reasoning through every step</b> and checking each result.";
      if (i === 1) return "Second run: steps that worked are <b>replayed from memory.</b> The new invoice has more line items, so that step gets another look.";
      return `Only the parts that differ every time — <b>reading the invoice</b> and <b>the approval call</b> — use AI. The other ${7 - k} steps replay.`;
    };
    function show(i) {
      cells.forEach((col, c) => col.forEach((r) => r.setAttribute("opacity", c <= i ? 1 : 0.18)));
      cursor.setAttribute("x", i * CW);
      const k = aiRows(i).length;
      hRun.textContent = fmt(runOf(i)); hAI.textContent = k; hMem.textContent = 7 - k; hNote.innerHTML = note(i, k);
    }
    show(0);
    let auto = null;
    range.addEventListener("input", () => { if (auto) cancelAnimationFrame(auto), (auto = null); show(+range.value); });
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      if (reduced) { range.value = COLS - 1; show(COLS - 1); return; }
      const t0 = performance.now(), dur = 5200;
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1), i = Math.round(p * (COLS - 1));
        range.value = i; show(i);
        if (p < 1) auto = requestAnimationFrame(step); else auto = null;
      };
      auto = requestAnimationFrame(step);
    }, { threshold: 0.5 }).observe(svg);
  })();

  /* ---------------- calculator ---------------- */
  (function calc() {
    const cases = $("#cCases"), mins = $("#cMins"); if (!cases) return;
    const oC = $("#oCases"), oM = $("#oMins"), hrs = $("#cHours"), fte = $("#cFte"), ppl = $("#cPeople");
    let shown = 0;
    function update() {
      const c = +cases.value, m = +mins.value, h = (c * m) / 60, f = h / 176;
      oC.textContent = fmt(c); oM.textContent = m;
      fte.textContent = f < 10 ? f.toFixed(1) : fmt(f);
      const from = shown, to = h, t0 = performance.now();
      const tick = (now) => { const p = Math.min((now - t0) / 350, 1); shown = from + (to - from) * p; hrs.textContent = fmt(shown); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const whole = Math.floor(f), MAX = 48;
      let html = "";
      for (let i = 0; i < Math.min(whole, MAX); i++) html += "<i></i>";
      if (whole < MAX && f - whole > 0.05) html += '<i class="part"></i>';
      if (whole > MAX) html += `<em>+${fmt(whole - MAX)} more</em>`;
      ppl.innerHTML = html;
    }
    cases.addEventListener("input", update); mins.addEventListener("input", update); update();
  })();

  /* ---------------- headline font picker (preview only — remove before launch) ---------------- */
  (function fontPicker() {
    const box = $("#fontpick"); if (!box) return;
    const root = document.documentElement;
    const set = (f) => {
      if (f === "a") delete root.dataset.font; else root.dataset.font = f;
      $$("button", box).forEach((b) => b.setAttribute("aria-pressed", b.dataset.font === f));
      try { localStorage.setItem("telic-font", f); } catch (e) {}
      window.dispatchEvent(new Event("resize"));
    };
    set(root.dataset.font || "a");
    $$("button", box).forEach((b) => b.addEventListener("click", () => set(b.dataset.font)));
  })();

  /* ---------------- count-up numbers ---------------- */
  const cio = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), t0 = performance.now(), dur = reduced ? 1 : 1600;
    const tick = (now) => { const p = Math.min((now - t0) / dur, 1); el.textContent = fmt(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }), { threshold: 0.5 });
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ---------------- home: mini learning barcode ---------------- */
  $$("[data-minibar]").forEach((host) => {
    const COLS = 28, cells = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < COLS; c++) {
      const i = document.createElement("i");
      const ai = c === 0 || (c === 1 && r === 4) || r === 0 || r === 5 || (c === 17 && r === 6);
      i.dataset.ai = ai ? 1 : 0; i.dataset.c = c; host.appendChild(i); cells.push(i);
    }
    let col = -1;
    const step = () => {
      col = (col + 1) % (COLS + 8);
      cells.forEach((i) => i.classList.toggle("ai", i.dataset.ai === "1" && +i.dataset.c <= col));
      cells.forEach((i) => (i.style.background = +i.dataset.c <= col ? "" : "#1d2f55"));
    };
    let timer = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(step, reduced ? 9999 : 140);
      if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(host);
    step();
  });

  /* ---------------- product: inside a single step ---------------- */
  (function sim() {
    const box = $("#sim"); if (!box) return;
    const grid = $(".sim__grid", box), dot = $("#simDot"), btns = $$(".sim__pick button", box);
    const LANES = [
      { ai: "0", t: "0.4s", kind: "", say: ["Telic recognises the step from memory.", "It replays exactly what worked last time — no AI involved.", "It checks the screen shows the expected result.", "Done. On to the next step in well under a second."] },
      { ai: "1", t: "4.1s", kind: "ai", say: ["It knows this step, but the screen doesn't match what it remembers.", "Instead of clicking blindly, it stops and uses AI to work out just this step.", "It checks the result on screen before moving on.", "The new way is saved, so next time this step is back to memory."] },
      { ai: "0", t: "Your call", kind: "hm", say: ["Two answers both look right. Guessing would create a mess later.", "Telic pauses safely and asks a person to decide.", "It verifies the person's choice on screen.", "Then it carries on from exactly where it stopped."] },
    ];
    let lane = 0, token = 0, auto = true;
    const cell = (l, s) => $(`.sim__cell[data-l="${l}"][data-s="${s}"]`, grid);
    async function play(l) {
      const my = ++token; lane = l;
      btns.forEach((b, i) => { b.classList.toggle("active", i === l); b.setAttribute("aria-selected", i === l); });
      $$(".sim__cell", grid).forEach((c) => { c.classList.remove("on", "lane", "ai", "hm"); if (+c.dataset.l === l) c.classList.add("lane"); });
      $("#simAI").textContent = "–"; $("#simT").textContent = "–";
      for (let s = 0; s < 4; s++) {
        if (my !== token) return;
        const c = cell(l, s); c.classList.add("on"); if (s === 1 && LANES[l].kind) c.classList.add(LANES[l].kind);
        const gr = grid.getBoundingClientRect(), cr = c.getBoundingClientRect();
        dot.style.opacity = 1; dot.style.left = `${cr.left - gr.left + 12}px`; dot.style.top = `${cr.top - gr.top - 6}px`;
        dot.style.background = s === 1 && l === 1 ? "var(--ai)" : s === 1 && l === 2 ? "var(--human)" : "var(--paper)";
        $("#simSay").textContent = LANES[l].say[s];
        await wait(reduced ? 50 : 1100);
      }
      if (my !== token) return;
      $("#simAI").textContent = LANES[l].ai; $("#simT").textContent = LANES[l].t;
      await wait(2600);
      if (my === token && auto) play((l + 1) % 3);
    }
    btns.forEach((b, i) => b.addEventListener("click", () => { auto = false; play(i); }));
    new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { obs.disconnect(); play(0); } }, { threshold: 0.4 }).observe(box);
  })();

  /* ---------------- use cases: workflow explorer ---------------- */
  (function explorer() {
    const box = $("#explorer"); if (!box) return;
    const M = "mem", A = "ai", H = "hm";
    const WF = [
      { name: "Invoice entry", blurb: "Supplier invoices arrive as PDFs by email and get keyed into a desktop ERP, with approvals above a limit.", sys: ["Email", "PDF", "Desktop ERP"],
        steps: [["Read the invoice", "Supplier, number, dates, line items, totals", A], ["Find the supplier", "Look up the vendor record in the ERP", M], ["Check for duplicates", "Make sure it isn't already posted", M], ["Key in header and lines", "Fill the invoice screen and line grid", M], ["Approval call", "Over the limit? Route it for sign-off", A], ["Post and verify", "Save, then confirm the record matches", M]] },
      { name: "Claims capture", blurb: "Claim forms and attachments come in through a portal and are entered into a legacy policy system.", sys: ["Web portal", "PDFs & scans", "Policy system"],
        steps: [["Open the new claim", "Pick up the next case from the portal queue", M], ["Read the form and attachments", "Pull out policy number, dates, amounts", A], ["Find the policy", "Look it up in the core system", M], ["Enter the claim", "Key the details into the claim screens", M], ["Spot missing documents", "Flag anything the rules say is required", A], ["Route to the right queue", "Hand it to the adjuster team", M]] },
      { name: "Order processing", blurb: "Orders from client portals are re-keyed into an ERP and checked against stock and price lists.", sys: ["Client portals", "Desktop ERP", "Excel"],
        steps: [["Pull new orders", "Collect them from each client's portal", M], ["Match products", "Map client descriptions and pack sizes to your codes", A], ["Create the order", "Key it into the ERP", M], ["Check stock and price", "Compare against the price list", M], ["Price doesn't match", "A person decides whether to accept", H], ["Confirm back", "Send the confirmation to the client", M]] },
      { name: "Document checks", blurb: "Supporting documents are classified, checked against records and filed in the right place.", sys: ["Shared drives", "PDFs & scans", "Case system"],
        steps: [["Collect the documents", "From the inbox, portal or shared folder", M], ["Work out what each one is", "Invoice, ID, contract, statement…", A], ["Pull the key fields", "Names, numbers, dates, amounts", A], ["Cross-check with records", "Do they match what's in the system?", M], ["Rename and file", "Into the right folder and case", M], ["Unclear fields to a reviewer", "Low-confidence reads get a human look", H]] },
      { name: "Reconciliation", blurb: "Statements and ledger entries are matched across systems, with near-misses explained and signed off.", sys: ["Bank files", "Desktop ERP", "Excel"],
        steps: [["Export the statement", "Download from the portal or bank file", M], ["Load the ledger", "Run the report in the ERP", M], ["Match the obvious ones", "Same amount, date and reference", M], ["Explain the near-matches", "Split payments, typos, rounding", A], ["Post the adjustments", "Key the journal entries", M], ["Sign-off", "A person approves the result", H]] },
      { name: "Vendor onboarding", blurb: "New vendor forms are validated and set up across procurement and finance systems.", sys: ["Email", "Govt. portals", "Desktop ERP"],
        steps: [["Read the vendor form", "Company details, tax IDs, bank details", A], ["Validate the details", "Check them on the relevant portal", M], ["Create the vendor", "Set up the record in the ERP", M], ["Attach the documents", "Upload and link supporting files", M], ["Approve the new vendor", "A person signs off", H], ["Let everyone know", "Confirm to the requester", M]] },
    ];
    const btns = $$(".explorer__list button", box), pipe = $("#wfPipe");
    let timer = null, idx = 0;
    function show(n) {
      const w = WF[n];
      btns.forEach((b, i) => { b.classList.toggle("active", i === n); b.setAttribute("aria-selected", i === n); });
      $("#wfName").textContent = w.name; $("#wfBlurb").textContent = w.blurb;
      $("#wfSys").innerHTML = w.sys.map((s) => `<span>${s}</span>`).join("");
      pipe.innerHTML = w.steps.map(([t, d, k], i) => `<li class="${k}" style="animation-delay:${i * 0.07}s"><i>${String(i + 1).padStart(2, "0")}</i><b>${t}<small>${d}</small></b><span class="tag ${k === H ? "human" : k}">${k === A ? "AI" : k === H ? "Person" : "Memory"}</span></li>`).join("");
      const ai = w.steps.filter((s) => s[2] === A).length, hm = w.steps.filter((s) => s[2] === H).length;
      $("#wfFoot").innerHTML = `<span>Steps <b>${w.steps.length}</b></span><span>From memory <b>${w.steps.length - ai - hm}</b></span><span>Need AI <b>${ai}</b></span><span>Need a person <b>${hm}</b></span>`;
      clearInterval(timer); idx = 0;
      const lis = $$("li", pipe);
      timer = setInterval(() => { lis.forEach((l, i) => l.classList.toggle("run", i === idx)); idx = (idx + 1) % (lis.length + 2); }, reduced ? 99999 : 700);
    }
    btns.forEach((b, i) => b.addEventListener("click", () => show(i)));
    show(0);
  })();

  /* ---------------- pricing: bars ---------------- */
  (function bars() {
    const host = $("#bars"); if (!host) return;
    const share = [1, .62, .48, .4, .36, .33, .31, .3, .3, .29, .29, .29];
    host.innerHTML = share.map((s, i) => `<div class="bar"><i class="a" data-h="${s * 100}"></i><i class="m" data-h="${(1 - s) * 100}"></i><span>W${i + 1}</span></div>`).join("");
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      $$(".bar", host).forEach((b, i) => setTimeout(() => $$("i", b).forEach((x) => (x.style.height = x.dataset.h + "%")), i * 90));
    }, { threshold: 0.4 }).observe(host);
  })();

  /* ================================================================
     v5 — sheets, spotlight, tilt, takeover keys, decode labels,
     receding stack, odometer, scroll-speed marquee, rail, footer
     ================================================================ */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* --- cursor spotlight on dark surfaces --- */
  $$(".dark").forEach((sec) => {
    const s = document.createElement("div"); s.className = "spot"; sec.prepend(s);
    sec.addEventListener("pointermove", (e) => {
      const r = sec.getBoundingClientRect();
      sec.style.setProperty("--sx", `${e.clientX - r.left}px`); sec.style.setProperty("--sy", `${e.clientY - r.top}px`);
    });
  });

  /* --- scroll-linked pieces, one rAF per frame --- */
  const sheets = $$("main section.dark");
  sheets.forEach((s) => s.classList.add("sheet"));
  const desk = $("#desk");
  const keyEls = $$("#keys .key");
  const keyOrder = keyEls.map((_, i) => i).sort(() => Math.random() - 0.5);
  const capTail = $(".keys-caption span:last-child");
  const cards = $$(".stack-card");
  cards.forEach((c) => { const sh = document.createElement("i"); sh.className = "sc-shade"; c.appendChild(sh); });
  const mq = $(".marquee__track");
  let lastScroll = scrollY, vel = 0, ticking = false;

  function frame() {
    ticking = false;
    const vh = innerHeight, y = scrollY;
    if (!reduced) {
      sheets.forEach((s) => {
        const r = s.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.75), 0, 1);
        const ins = (1 - p) * 5, rad = (1 - p) * 48;
        s.style.clipPath = p >= 1 ? "none" : `inset(0 ${ins}% 0 ${ins}% round ${rad}px ${rad}px 0 0)`;
      });
      if (desk) {
        const r = desk.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.85), 0, 1), e = 1 - Math.pow(1 - p, 2);
        desk.style.transform = `rotateX(${((1 - e) * 24).toFixed(2)}deg) scale(${(0.86 + 0.14 * e).toFixed(3)}) translateY(${((1 - e) * 40).toFixed(1)}px)`;
        desk.style.opacity = (0.3 + 0.7 * e).toFixed(2);
      }
      cards.forEach((c, i) => {
        const next = cards[i + 1], sh = $(".sc-shade", c); if (!next) return;
        const p = clamp(1 - (next.getBoundingClientRect().top - c.getBoundingClientRect().top) / c.offsetHeight, 0, 1);
        c.style.transform = `scale(${(1 - 0.06 * p).toFixed(3)})`; sh.style.opacity = (p * 0.45).toFixed(2);
      });
    }
    if (keyEls.length) {
      const hero = $("#hero");
      const p = clamp(y / (hero.offsetHeight * 0.75), 0, 1), n = Math.round(p * keyEls.length);
      keyOrder.forEach((k, i) => keyEls[k].classList.toggle("auto", i < n));
      if (capTail) capTail.innerHTML = `Keystrokes now handled by Telic: <b>${Math.round(p * 100)}%</b>`;
    }
    const railEl = $("#rail"), footEl = $("#footer");
    if (railEl && footEl) railEl.classList.toggle("off", footEl.getBoundingClientRect().top < vh * 0.9 || y < vh * 0.6);
    vel = y - lastScroll; lastScroll = y;
    if (mq && !reduced) {
      const a = mq.getAnimations()[0];
      if (a) a.playbackRate = 1 + Math.min(6, Math.abs(vel) / 12) * (vel < 0 ? -1 : 1);
      mq.parentElement.style.transform = `skewX(${clamp(-vel * 0.25, -10, 10).toFixed(2)}deg)`;
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); frame();
  // settle the marquee back to normal speed when scrolling stops
  setInterval(() => { if (Math.abs(scrollY - lastScroll) < 1) { vel = 0; if (mq) { const a = mq.getAnimations()[0]; if (a) a.playbackRate += (1 - a.playbackRate) * 0.3; mq.parentElement.style.transform = "skewX(0deg)"; } } lastScroll = scrollY; }, 120);

  /* --- hero logo tilts toward the cursor --- */
  const viz = $("#heroViz");
  if (viz && fine && !reduced) {
    $("#hero").addEventListener("pointermove", (e) => {
      const r = viz.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      viz.style.transform = `perspective(900px) rotateY(${(dx * 16).toFixed(2)}deg) rotateX(${(-dy * 16).toFixed(2)}deg)`;
    });
    $("#hero").addEventListener("pointerleave", () => (viz.style.transform = ""));
  }

  /* --- labels decode like a machine reading them --- */
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*+<>";
  function decode(el) {
    const final = el.textContent; if (!final.trim()) return;
    let f = 0; const total = 18;
    const t = setInterval(() => {
      f++;
      el.textContent = final.split("").map((ch, i) => (ch === " " || i < (f / total) * final.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      if (f >= total) { clearInterval(t); el.textContent = final; }
    }, 34);
  }
  if (!reduced) {
    const dio = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { dio.unobserve(e.target); decode(e.target); } }), { threshold: 1 });
    $$(".eyebrow, .crumbs span:last-child, .sc-n, .tl__n, .stage__n, .hc-n").forEach((el) => { if (el.children.length === 0) dio.observe(el); });
  }

  /* --- odometer --- */
  $$("[data-odo]").forEach((el) => {
    const digits = String(el.dataset.odo).split("");
    el.innerHTML = digits.map(() => `<span><i>${"0123456789".split("").map((d) => `<b>${d}</b>`).join("")}</i></span>`).join("");
    const cols = $$("i", el);
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      cols.forEach((c, i) => { c.style.transitionDelay = `${i * 140}ms`; c.style.transform = `translateY(-${+digits[i] * 10}%)`; });
    }, { threshold: 0.6 }).observe(el);
  });

  /* --- section rail (home) --- */
  const rail = $("#rail");
  if (rail) {
    const links = $$("a", rail);
    const rio = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const t = $(a.getAttribute("href")); if (t) rio.observe(t); });
  }

  /* --- footer --- */
  (function footer() {
    const foot = $("#footer"); if (!foot) return;
    const fit = () => foot.classList.toggle("flow", foot.offsetHeight > innerHeight - 40 || innerWidth < 760);
    fit(); addEventListener("resize", fit);
    const clock = $("#fClock"), keysOut = $("#fKeys"), t0 = Date.now();
    const tick = () => {
      try { clock.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false }); } catch (e) { clock.textContent = new Date().toLocaleTimeString(); }
      keysOut.textContent = fmt(((Date.now() - t0) / 1000) * 3.2);
    };
    tick(); setInterval(tick, 1000);

    // pixel trail: grid-snapped squares pop where the cursor passes
    if (fine && !reduced) {
      const trail = document.createElement("div"); trail.className = "f-trail"; foot.prepend(trail);
      const G = 28; let lastCell = "";
      foot.addEventListener("pointermove", (e) => {
        const r = foot.getBoundingClientRect();
        const gx = Math.floor((e.clientX - r.left) / G), gy = Math.floor((e.clientY - r.top) / G), key = gx + ":" + gy;
        if (key === lastCell) return; lastCell = key;
        const sq = document.createElement("i");
        const roll = Math.random();
        if (roll > 0.9) sq.className = "alt"; else if (roll > 0.78) sq.className = "ink";
        sq.style.left = gx * G + 3 + "px"; sq.style.top = gy * G + 3 + "px";
        trail.appendChild(sq);
        setTimeout(() => sq.remove(), 950);
      });
    }
    $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

    // giant mark plays the workflow
    const mark = $("#fMark"), nodes = $$(".fg-node", mark), outline = $(".fg-outline", mark), L = outline.getTotalLength();
    outline.style.strokeDasharray = L;
    let busy = false;
    async function play() {
      if (busy || reduced) return; busy = true;
      nodes.forEach((n) => { n.classList.add("dim"); n.classList.remove("ai"); });
      outline.style.transition = "none"; outline.style.strokeDashoffset = L; outline.getBoundingClientRect();
      outline.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.6,.1,.2,1)"; outline.style.strokeDashoffset = 0;
      for (let i = 0; i < nodes.length; i++) { await wait(260); nodes[i].classList.remove("dim"); if (i === 3) nodes[i].classList.add("ai"); }
      await wait(1600); nodes[3].classList.remove("ai"); busy = false;
    }
    mark.addEventListener("click", play); mark.addEventListener("mouseenter", play);

    // giant word rises in, then letters lean away from the cursor
    const word = $("#fWord"), letters = $$("span", word);
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      word.classList.add("go"); letters.forEach((l, i) => (l.style.transitionDelay = `${i * 70}ms`));
      requestAnimationFrame(() => word.classList.remove("pre"));
      setTimeout(() => { letters.forEach((l) => (l.style.transitionDelay = "0ms")); word.classList.remove("go"); }, 1600);
      play();
    }, { threshold: 0.4 }).observe(word);
    if (fine && !reduced) {
      foot.addEventListener("pointermove", (e) => {
        letters.forEach((l) => {
          const r = l.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 320);
          l.style.setProperty("--ty", `${(-f * 26).toFixed(1)}px`); l.style.setProperty("--rz", `${(dx > 0 ? -1 : 1) * f * 6}deg`);
        });
      });
      foot.addEventListener("pointerleave", () => letters.forEach((l) => { l.style.setProperty("--ty", "0px"); l.style.setProperty("--rz", "0deg"); }));
    }
  })();

  /* ================================================================
     v6 — fit check + contact prefill
     ================================================================ */
  (function fitCheck() {
    const list = $("#fitList"); if (!list) return;
    const answers = new Array(5).fill(null);
    const arc = $("#fitArc"), score = $("#fitScore"), title = $("#fitTitle"), text = $("#fitText"), cta = $("#fitCta");
    const Q = ["work in desktop apps / portals / spreadsheets", "high volume", "rules explainable in under an hour", "mostly routine cases", "done by hand today"];
    function render() {
      const done = answers.filter((a) => a !== null).length, s = answers.filter((a) => a === 1).length;
      score.textContent = s; arc.style.strokeDashoffset = 1 - s / 5;
      arc.style.stroke = s >= 4 ? "var(--ai)" : s >= 3 ? "#ff8a5c" : "#7c88a3";
      if (done < 5) { title.textContent = done ? `${5 - done} to go…` : "Answer the questions"; text.textContent = "Your result appears here as you go."; }
      else if (s === 5) { title.textContent = "Textbook first workflow."; text.textContent = "High volume, clear rules, done by hand in software that won't change for you. This is exactly where Telic pays off fastest."; }
      else if (s >= 3) { title.textContent = "Good candidate."; text.textContent = "Worth a conversation. We'll look at the parts that didn't tick and see whether they're a blocker or just a person-in-the-loop step."; }
      else { title.textContent = "Probably not the place to start."; text.textContent = "Low-volume or exception-heavy work rarely pays back. Tell us about it anyway — there may be a better first workflow next to it."; }
      const yes = Q.filter((_, i) => answers[i] === 1), no = Q.filter((_, i) => answers[i] === 0);
      const msg = `Fit check: ${s}/5\nYes: ${yes.join(", ") || "—"}\nNot really: ${no.join(", ") || "—"}\n\nThe workflow: `;
      cta.href = "contact.html?fit=" + encodeURIComponent(msg);
    }
    $$("li", list).forEach((li, i) => $$("button", li).forEach((b) => b.addEventListener("click", () => {
      answers[i] = +b.dataset.v; $$("button", li).forEach((x) => x.classList.toggle("on", x === b)); render();
    })));
    render();
  })();

  (function prefill() {
    const msg = $("#fMsg"); if (!msg) return;
    const q = new URLSearchParams(location.search).get("fit");
    if (q && !msg.value) msg.value = q;
  })();

  /* ---------------- contact form → email ---------------- */
  const formEl = $("#form");
  if (formEl) formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, data = new FormData(f), note = $("#formNote");
    if (!data.get("name") || !/^\S+@\S+\.\S+$/.test(data.get("email") || "")) {
      note.textContent = "Please add your name and a valid work email."; note.style.color = "var(--fail)"; return;
    }
    const subject = `Telic — ${data.get("who")} — ${data.get("company") || data.get("name")}`;
    const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nCompany: ${data.get("company")}\nI'm with: ${data.get("who")}\n\n${data.get("message")}`;
    location.href = `mailto:daksh@telic.sh?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Thanks — your email app should open now."; note.style.color = "var(--fg)";
  });
})();
