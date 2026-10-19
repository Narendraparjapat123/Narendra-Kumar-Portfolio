/* ===== 1. Typing effect ===== */
const roles = ["Junior Data Analyst", "MIS Executive", "Power BI Developer", "Python & SQL Enthusiast"];
const typedEl = document.getElementById("typed");
let r = 0, i = 0, del = false;
(function type() {
  const word = roles[r];
  typedEl.textContent = word.slice(0, i);
  if (!del && i < word.length) i++;
  else if (del && i > 0) i--;
  else if (!del) { del = true; return setTimeout(type, 1400); }
  else { del = false; r = (r + 1) % roles.length; }
  setTimeout(type, del ? 40 : 85);
})();

/* ===== 2. Scroll reveal + counters + skill bars ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    const num = e.target.querySelector("[data-count]");
    if (num) countUp(num);
    e.target.querySelectorAll(".bar").forEach((b) => {
      b.style.setProperty("--w", b.querySelector("i").dataset.w + "%");
      b.classList.add("go");
    });
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

function countUp(el) {
  const end = parseFloat(el.dataset.count);
  const dec = +el.dataset.dec || 0;
  const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
  const t0 = performance.now(), dur = 1600;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    const v = end * (1 - Math.pow(1 - p, 3));
    el.textContent = pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ===== 3. Particle background ===== */
const cv = document.getElementById("bg"), ctx = cv.getContext("2d");
let W, H, pts = [];
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  pts = Array.from({ length: Math.min(70, Math.floor(W / 20)) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
  }));
}
addEventListener("resize", resize); resize();
const mouse = { x: -999, y: -999 };
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
(function draw() {
  ctx.clearRect(0, 0, W, H);
  const light = document.documentElement.dataset.theme === "light";
  const col = light ? "14,165,233" : "110,231,255";
  pts.forEach((p, a) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.fillStyle = `rgba(${col},.7)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill();
    for (let b = a + 1; b < pts.length; b++) {
      const q = pts[b], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) { ctx.strokeStyle = `rgba(${col},${.16 * (1 - d / 130)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    }
    const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (dm < 160) { ctx.strokeStyle = `rgba(167,139,250,${.3 * (1 - dm / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
  });
  requestAnimationFrame(draw);
})();

/* ===== 4. Cursor glow ===== */
const glow = document.getElementById("glow");
addEventListener("mousemove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

/* ===== 5. 3D tilt + spotlight on cards ===== */
document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const b = el.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
    const rx = ((y / b.height) - .5) * -8, ry = ((x / b.width) - .5) * 8;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  el.addEventListener("mouseleave", () => (el.style.transform = ""));
});

/* ===== 6. Project filter ===== */
document.querySelectorAll(".filters .chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filters .chip").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.f;
    document.querySelectorAll(".card").forEach((c) =>
      c.classList.toggle("hide", f !== "all" && !c.dataset.tags.includes(f)));
  });
});

/* ===== 7. Interactive mini dashboard (sample data) ===== */
const data = {
  2024: [38, 42, 40, 51, 55, 58, 54, 60, 66, 72, 85, 98],
  2025: [44, 47, 49, 56, 61, 64, 60, 68, 75, 82, 96, 110],
  2026: [50, 53, 57, 63, 69, 72, 70, 78, 86, 94, 108, 124]
};
const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const chart = document.getElementById("chart"), cc = chart.getContext("2d");
let curYear = "2024", prog = 0, shown = data[curYear].map(() => 0);

function sizeChart() {
  const dpr = devicePixelRatio || 1, w = chart.clientWidth;
  chart.width = w * dpr; chart.height = 260 * dpr;
  cc.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawChart() {
  const w = chart.clientWidth, h = 260, pad = 26, vals = data[curYear];
  const max = 130, bw = (w - pad * 2) / vals.length;
  const light = document.documentElement.dataset.theme === "light";
  cc.clearRect(0, 0, w, h);
  cc.strokeStyle = light ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.07)";
  for (let g = 0; g <= 4; g++) { const y = pad + ((h - pad * 2) / 4) * g; cc.beginPath(); cc.moveTo(pad, y); cc.lineTo(w - pad, y); cc.stroke(); }
  const best = vals.indexOf(Math.max(...vals));
  vals.forEach((v, k) => {
    shown[k] += (v - shown[k]) * 0.12;
    const bh = (shown[k] / max) * (h - pad * 2), x = pad + k * bw + bw * .18, y = h - pad - bh;
    const gr = cc.createLinearGradient(0, y, 0, h - pad);
    gr.addColorStop(0, k === best ? "#34d399" : "#6ee7ff"); gr.addColorStop(1, "#a78bfa");
    cc.fillStyle = gr;
    cc.beginPath(); cc.roundRect(x, y, bw * .64, bh, 6); cc.fill();
    cc.fillStyle = light ? "#5b667f" : "#8c97b2"; cc.font = "12px Inter"; cc.textAlign = "center";
    cc.fillText(months[k], x + bw * .32, h - 8);
  });
  requestAnimationFrame(drawChart);
}
function updateDash() {
  const v = data[curYear], total = v.reduce((a, b) => a + b, 0);
  document.getElementById("dTotal").textContent = "$" + (total / 100).toFixed(2) + "M";
  document.getElementById("dBest").textContent = "🏆 Best month: " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][v.indexOf(Math.max(...v))];
  const g = ((v[11] - v[0]) / v[0] * 100).toFixed(0);
  document.getElementById("dGrowth").textContent = "📈 Jan → Dec growth: +" + g + "%";
}
document.querySelectorAll("#years .chip").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("#years .chip").forEach((x) => x.classList.remove("active"));
  b.classList.add("active"); curYear = b.dataset.y; updateDash();
}));
addEventListener("resize", sizeChart);
sizeChart(); updateDash(); drawChart();

/* ===== 8. Theme toggle (remembers choice) ===== */
const root = document.documentElement, themeBtn = document.getElementById("themeBtn");
try { const s = localStorage.getItem("theme"); if (s) root.dataset.theme = s; } catch (e) {}
themeBtn.textContent = root.dataset.theme === "dark" ? "🌙" : "☀️";
themeBtn.addEventListener("click", () => {
  const t = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = t; themeBtn.textContent = t === "dark" ? "🌙" : "☀️";
  try { localStorage.setItem("theme", t); } catch (e) {}
});

/* ===== 9. Mobile menu + active link ===== */
const menu = document.getElementById("menu");
document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("open"));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("open")));
const links = [...menu.querySelectorAll("a")];
const spy = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach((s) => spy.observe(s));

/* ===== 10. Copy email + footer year ===== */
document.getElementById("copyMail").addEventListener("click", () => {
  const email = "narendrakumawat82022@gmail.com";
  (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject()).catch(() => {});
  const t = document.getElementById("toast");
  t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2000);
});
document.getElementById("year").textContent = new Date().getFullYear();