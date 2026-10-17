/* ===== 应用核心：工具、状态、路由、外壳、搜索 ===== */
const APP = {
  views: {},
  state: {
    route: 'overview',
    kg: {
      mode: 'guide', disc: null, sub: null, q: '', selected: null, transform: null,
      depth: 1, edgeKinds: {}, edgeSelected: null,
      pathMode: false, pathStart: null, path: null,
      tour: { active: false, index: 0 }, fullscreen: false
    },
    qg: { view: 'matrix', level: null, type: null, mechOnly: false, litOnly: false, selected: null, selftest: false, hideMastered: false, revealed: {}, q: '' },
    progress: {},
    records: {},
    menuOpen: false
  },
  els: {},
  stats: {}
};

/* ---------- 基础工具 ---------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
const NODE_MAP = {}; NODES.forEach(n => { NODE_MAP[n.id] = n; });
const Q_MAP = {}; QUESTIONS.forEach(q => { Q_MAP[q.id] = q; });
const REF_KEYS = Object.keys(REFS);
const CASES = NODES.filter(n => n.kind === '病例');
const NODE_Q = {}; // node id -> [question ids]
NODES.forEach(n => { NODE_Q[n.id] = []; });
QUESTIONS.forEach(q => (q.nodes || []).forEach(nid => { if (NODE_Q[nid]) NODE_Q[nid].push(q.id); }));
const NODE_CASES = {}; // node id -> [case node ids] 通过边
NODES.forEach(n => { NODE_CASES[n.id] = []; });
EDGES.forEach(e => {
  if (NODE_MAP[e.f] && NODE_MAP[e.t]) {
    if (NODE_MAP[e.f].kind === '病例' && NODE_MAP[e.t].kind !== '病例') NODE_CASES[e.t].push(e.f);
    if (NODE_MAP[e.t].kind === '病例' && NODE_MAP[e.f].kind !== '病例') NODE_CASES[e.f].push(e.t);
  }
});
const EDGE_INDEX = { out: {}, in: {} };
NODES.forEach(n => { EDGE_INDEX.out[n.id] = []; EDGE_INDEX.in[n.id] = []; });
EDGES.forEach(e => { if (EDGE_INDEX.out[e.f] && EDGE_INDEX.in[e.t]) { EDGE_INDEX.out[e.f].push(e); EDGE_INDEX.in[e.t].push(e); } });
const QEDGE_INDEX = { out: {}, in: {} };
QUESTIONS.forEach(q => { QEDGE_INDEX.out[q.id] = []; QEDGE_INDEX.in[q.id] = []; });
QEDGES.forEach(e => { if (QEDGE_INDEX.out[e.f] && QEDGE_INDEX.in[e.t]) { QEDGE_INDEX.out[e.f].push(e); QEDGE_INDEX.in[e.t].push(e); } });

(function computeStats() {
  const journalRefs = REF_KEYS.filter(k => REFS[k].pmid || REFS[k].doi || REFS[k].url);
  const journalOnly = REF_KEYS.filter(k => REFS[k].pmid || REFS[k].doi);
  const textbook = REF_KEYS.filter(k => k.charAt(0) === 'T');
  const guideline = REF_KEYS.filter(k => k.charAt(0) === 'G');
  const levels = { 1: 0, 2: 0, 3: 0 };
  const types = { 概念: 0, 机制: 0, 病例: 0, 综合: 0 };
  let mech = 0, lit = 0, clinical = 0, traced = 0, anchors = 0;
  QUESTIONS.forEach(q => {
    levels[q.level] = (levels[q.level] || 0) + 1;
    types[q.type] = (types[q.type] || 0) + 1;
    if (q.mech) mech++;
    if (q.lit) lit++;
    if (q.clinical) clinical++;
    if (q.nodes && q.nodes.length) { traced++; anchors += q.nodes.length; }
  });
  APP.stats = {
    nodes: NODES.length,
    edges: EDGES.length,
    questions: QUESTIONS.length,
    cases: CASES.length,
    qedges: QEDGES.length,
    refs: REF_KEYS.length,
    journalRefs: journalRefs.length,
    journalOnly: journalOnly.length,
    textbook: textbook.length,
    guideline: guideline.length,
    keyNodes: NODES.filter(n => n.key).length,
    keyNodesWithLit: NODES.filter(n => n.key && (n.refs || []).some(r => REFS[r] && (REFS[r].pmid || REFS[r].doi || REFS[r].url))).length,
    levels: levels,
    types: types,
    mech: mech, lit: lit, clinical: clinical,
    mechPct: Math.round(mech / QUESTIONS.length * 1000) / 10,
    traced: traced, anchors: anchors,
    avgAnchors: Math.round(anchors / QUESTIONS.length * 10) / 10
  };
})();

/* ---------- 本地存储 ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('wes_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('wes_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
};
APP.state.progress = store.get('progress', {});
APP.state.records = store.get('records', {});

/* ---------- 引用链接 ---------- */
function refLink(r) {
  if (!r) return '';
  if (r.pmid) return 'https://pubmed.ncbi.nlm.nih.gov/' + r.pmid + '/';
  if (r.doi) return 'https://doi.org/' + r.doi;
  return r.url || '';
}
function refLinksHTML(r) {
  const links = [];
  if (r.pmid) links.push('<a href="https://pubmed.ncbi.nlm.nih.gov/' + r.pmid + '/" target="_blank" rel="noopener">PubMed ↗</a>');
  if (r.doi) links.push('<a href="https://doi.org/' + esc(r.doi) + '" target="_blank" rel="noopener">DOI ↗</a>');
  if (r.url) links.push('<a href="' + esc(r.url) + '" target="_blank" rel="noopener">原文/指南 ↗</a>');
  return links.length ? '<div class="ref-links">' + links.join('') + '</div>' : '';
}
function refTypeBadge(t) {
  const map = { 教材: { c: '#2563eb', bg: '#dbeafe' }, 文献: { c: '#7c3aed', bg: '#ede9fe' }, 指南: { c: '#059669', bg: '#d1fae5' }, 共识: { c: '#0891b2', bg: '#cffafe' } };
  const s = map[t] || { c: '#64748b', bg: '#f1f5f9' };
  return '<span class="badge" style="color:' + s.c + ';background:' + s.bg + '">' + esc(t) + '</span>';
}
function discBadge(d) {
  const x = DISCIPLINES[d];
  if (!x) return '';
  return '<span class="badge" style="color:' + x.color + ';background:' + x.bg + '">' + esc(x.name) + '</span>';
}
function levelBadge(l) {
  const map = { 1: ['一级 · 记忆性', '#64748b', '#f1f5f9'], 2: ['二级 · 分析理解', '#1d4ed8', '#dbeafe'], 3: ['三级 · 应用总结', '#be123c', '#ffe4e6'] };
  const m = map[l] || map[1];
  return '<span class="badge" style="color:' + m[1] + ';background:' + m[2] + '">' + m[0] + '</span>';
}
function diffStars(d) { return '★'.repeat(d) + '☆'.repeat(Math.max(0, 3 - d)); }

/* ---------- HTML 构造快写 ---------- */
function chip(text, opts) {
  opts = opts || {};
  return '<button type="button" class="chip' + (opts.on ? ' on' : '') + '"' + (opts.attr || '') + (opts.title ? ' title="' + esc(opts.title) + '"' : '') + '>' +
    (opts.dot ? '<span class="chip-dot" style="background:' + opts.dot + '"></span>' : '') + esc(text) + '</button>';
}
function nodeChip(id, extra) {
  const n = NODE_MAP[id];
  if (!n) return '';
  const d = DISCIPLINES[n.disc] || { color: '#64748b' };
  return '<button type="button" class="trace-chip" data-goto-node="' + esc(id) + '" style="border-color:' + d.color + '33;background:' + d.color + '0f;color:' + d.color + '">' + esc(n.title) + (extra || '') + '</button>';
}
function qChip(id) {
  const q = Q_MAP[id];
  if (!q) return '';
  return '<button type="button" class="trace-chip" data-goto-q="' + esc(id) + '" style="border-color:#bfdbfe;background:#eff6ff;color:#1e40af">' + esc(id) + ' · ' + esc(q.title) + '</button>';
}
function wrapTitle(str, maxUnits) {
  const units = s => Array.from(s).reduce((a, ch) => a + (/[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/.test(ch) ? 1 : 0.55), 0);
  if (units(str) <= maxUnits) return [str];
  const lines = []; let cur = '', u = 0;
  Array.from(str).forEach(ch => {
    const cu = units(ch);
    if (u + cu > maxUnits && cur) { lines.push(cur); cur = ''; u = 0; }
    cur += ch; u += cu;
  });
  if (cur) lines.push(cur);
  if (lines.length > 2) { const rest = lines.slice(1).join(''); lines.length = 2; lines[1] = rest.slice(0, Math.max(1, rest.length - 1)) + '…'; }
  return lines;
}

/* ---------- 外壳 ---------- */
const ROUTES = [
  { id: 'overview', label: '总览' },
  { id: 'knowledge', label: '知识图谱' },
  { id: 'problems', label: '问题图谱' },
  { id: 'cases', label: '病例情境' },
  { id: 'tools', label: '学习工具' },
  { id: 'guide', label: '设计说明' }
];
const BRAND_SVG = '<svg class="brand-mark" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="1" y="1" width="38" height="38" rx="11" fill="#1d4ed8"/>' +
  '<path d="M20 8.5c4.6 5.6 8.2 9.6 8.2 13.9 0 4.8-3.7 8.6-8.2 8.6s-8.2-3.8-8.2-8.6C11.8 18.1 15.4 14.1 20 8.5Z" fill="#bfdbfe"/>' +
  '<path d="M16.4 21.2h7.2M20 17.6v7.2" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round"/>' +
  '</svg>';

function navHTML() {
  const route = APP.state.route;
  return ROUTES.map(r => '<button class="nav-link' + (r.id === route ? ' active' : '') + '" data-nav="' + r.id + '">' + r.label + '</button>').join('');
}
function renderShell() {
  document.getElementById('app').innerHTML =
    '<header class="site-header"><div class="header-inner">' +
      '<div class="brand" data-nav="overview">' + BRAND_SVG +
        '<div class="brand-text"><span class="brand-title">水电解质紊乱 · 知识图谱与问题图谱</span><span class="brand-sub">泌尿系统疾病基础 · “师—生—机”协同教改作品</span></div>' +
      '</div>' +
      '<nav class="main-nav' + (APP.state.menuOpen ? ' open' : '') + '" id="main-nav">' + navHTML() + '</nav>' +
      '<div class="header-right">' +
        '<button class="search-btn" id="btn-search"><span class="label">搜索</span><kbd>/</kbd></button>' +
        '<span class="version-pill" title="版本">' + esc(META.version) + ' · 2026 秋</span>' +
        '<button class="menu-btn" id="btn-menu" aria-label="菜单">☰</button>' +
      '</div>' +
    '</div></header>' +
    '<main class="page" id="view"></main>' +
    '<footer class="site-footer"><div class="footer-inner">' +
      '<span>© 2026 泌尿整合课程 · 水电解质紊乱模块 · ' + esc(META.version) + '（' + esc(META.date) + '）</span>' +
      '<div class="footer-links">' + ROUTES.map(r => '<button data-nav="' + r.id + '">' + r.label + '</button>').join('') +
        '<button data-nav="guide" data-anchor="refs">参考文献</button><button data-nav="guide" data-anchor="record">课堂记录</button></div>' +
    '</div></footer>' +
    '<div id="modal-root"></div>';
  attachShellEvents();
}
function attachShellEvents() {
  const menu = $('#btn-menu');
  if (menu) menu.addEventListener('click', function () {
    APP.state.menuOpen = !APP.state.menuOpen;
    const nav = $('#main-nav'); if (nav) nav.classList.toggle('open', APP.state.menuOpen);
  });
  const sb = $('#btn-search');
  if (sb) sb.addEventListener('click', openSearch);
}

/* ---------- 路由 ---------- */
function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const parts = raw.split('?');
  const route = parts[0] || 'overview';
  const params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(kv => {
      const i = kv.indexOf('=');
      if (i < 0) params[decodeURIComponent(kv)] = '';
      else params[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    });
  }
  return { route: ROUTES.some(r => r.id === route) ? route : 'overview', params: params };
}
function navigate(route, params) {
  let hash = '#/' + route;
  if (params) {
    const kv = Object.keys(params).filter(k => params[k] != null && params[k] !== '').map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    if (kv.length) hash += '?' + kv.join('&');
  }
  if (location.hash === hash) { renderCurrentRoute(); return; }
  location.hash = hash;
}
function renderCurrentRoute() {
  const parsed = parseHash();
  const prevRoute = APP.state.route;
  APP.state.route = parsed.route;
  if (parsed.route !== 'knowledge' && APP.state.kg.fullscreen) {
    APP.state.kg.fullscreen = false;
    document.body.classList.remove('kg-noscroll');
  }
  $$('.nav-link').forEach(b => b.classList.toggle('active', b.getAttribute('data-nav') === parsed.route));
  const view = $('#view');
  if (!view) return;
  if (prevRoute !== parsed.route) window.scrollTo(0, 0);
  const fn = APP.views[parsed.route];
  if (fn) fn(parsed.params || {});
  if (APP.pendingAnchor) {
    const anchor = APP.pendingAnchor; APP.pendingAnchor = null;
    setTimeout(function () {
      const target = document.getElementById(anchor);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }
}

/* ---------- 全局跳转（节点 / 问题 / 病例） ---------- */
function gotoNode(id, opts) {
  opts = opts || {};
  APP.state.kg.selected = id;
  APP.state.kg.mode = 'graph';
  navigate('knowledge', { node: id });
}
function gotoQuestion(id) {
  APP.state.qg.selected = id;
  navigate('problems', { q: id });
}
function gotoCase(id) {
  navigate('cases', { case: id });
}

/* ---------- 搜索 ---------- */
function searchAll(q) {
  const s = q.trim().toLowerCase();
  if (!s) return { nodes: [], questions: [], cases: [] };
  const hit = (txt) => (txt || '').toLowerCase().indexOf(s) >= 0;
  return {
    nodes: NODES.filter(n => hit(n.title) || hit(n.en) || hit(n.summary) || (n.tags || []).some(hit) || (n.points || []).join(' ').toLowerCase().indexOf(s) >= 0).slice(0, 12),
    questions: QUESTIONS.filter(x => hit(x.title) || hit(x.prompt) || hit(x.answer) || hit(x.type)).slice(0, 10),
    cases: CASES.filter(c => hit(c.title) || hit(c.summary)).slice(0, 6)
  };
}
function openSearch() {
  const root = $('#modal-root');
  if (!root) return;
  root.innerHTML = '<div class="modal-mask" id="search-mask"><div class="modal">' +
    '<div class="modal-input-row"><span>🔎</span><input id="search-input" placeholder="搜索知识节点、问题或病例（如：低钾、反常性酸性尿、托伐普坦）" autocomplete="off"><kbd>Esc</kbd></div>' +
    '<div class="search-results" id="search-results"></div></div></div>';
  const mask = $('#search-mask');
  const input = $('#search-input');
  const results = $('#search-results');
  function draw() {
    const r = searchAll(input.value);
    if (!input.value.trim()) {
      results.innerHTML = '<div class="sr-group-title">试试这些</div>' + ['低钾血症', '反常性酸性尿', '甘露醇', 'SIADH', '心电图'].map(t => '<div class="sr-item" data-seed="' + esc(t) + '"><div class="sr-main"><div class="sr-title">' + esc(t) + '</div></div></div>').join('');
      $$('[data-seed]', results).forEach(el => el.addEventListener('click', () => { input.value = el.getAttribute('data-seed'); draw(); input.focus(); }));
      return;
    }
    let html = '';
    if (r.nodes.length) {
      html += '<div class="sr-group-title">知识节点 · ' + r.nodes.length + '</div>' + r.nodes.map(n => '<div class="sr-item" data-node="' + esc(n.id) + '"><span class="chip-dot" style="background:' + (DISCIPLINES[n.disc] || {}).color + '"></span><div class="sr-main"><div class="sr-title">' + esc(n.title) + '</div><div class="sr-sub">' + esc(DISCIPLINES[n.disc].name + ' · ' + (n.summary || '')) + '</div></div></div>').join('');
    }
    if (r.questions.length) {
      html += '<div class="sr-group-title">问题 · ' + r.questions.length + '</div>' + r.questions.map(q => '<div class="sr-item" data-q="' + esc(q.id) + '"><span class="badge" style="background:#eff6ff;color:#1e40af">' + esc(q.id) + '</span><div class="sr-main"><div class="sr-title">' + esc(q.title) + '</div><div class="sr-sub">' + levelBadge(q.level).replace(/<[^>]+>/g, '') + ' · ' + esc(q.type) + ' · ' + diffStars(q.diff) + '</div></div></div>').join('');
    }
    if (r.cases.length) {
      html += '<div class="sr-group-title">病例 · ' + r.cases.length + '</div>' + r.cases.map(c => '<div class="sr-item" data-case="' + esc(c.id) + '"><span class="badge" style="background:#fce7f3;color:#db2777">病例</span><div class="sr-main"><div class="sr-title">' + esc(c.title) + '</div><div class="sr-sub">' + esc(c.summary || '') + '</div></div></div>').join('');
    }
    results.innerHTML = html || '<div class="sr-empty">没有找到匹配内容，换个关键词试试。</div>';
    $$('[data-node]', results).forEach(el => el.addEventListener('click', () => { closeSearch(); gotoNode(el.getAttribute('data-node')); }));
    $$('[data-q]', results).forEach(el => el.addEventListener('click', () => { closeSearch(); gotoQuestion(el.getAttribute('data-q')); }));
    $$('[data-case]', results).forEach(el => el.addEventListener('click', () => { closeSearch(); gotoCase(el.getAttribute('data-case')); }));
  }
  function closeSearch() { root.innerHTML = ''; }
  mask.addEventListener('click', e => { if (e.target === mask) closeSearch(); });
  input.addEventListener('input', draw);
  input.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  draw();
  setTimeout(() => input.focus(), 30);
}
document.addEventListener('keydown', function (e) {
  if (e.key === '/' && !/input|textarea|select/i.test((e.target.tagName || ''))) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') { e.preventDefault(); openSearch(); }
  }
  if (e.key === 'Escape') { const r = $('#modal-root'); if (r) r.innerHTML = ''; }
});

/* ---------- 全局导航（事件委托，动态内容也可用） ---------- */
document.addEventListener('click', function (e) {
  const nav = e.target.closest ? e.target.closest('[data-nav]') : null;
  if (!nav) return;
  const id = nav.getAttribute('data-nav');
  const anchor = nav.getAttribute('data-anchor');
  APP.state.menuOpen = false;
  const mnav = $('#main-nav'); if (mnav) mnav.classList.remove('open');
  if (anchor) APP.pendingAnchor = anchor;
  if (id === APP.state.route) renderCurrentRoute();
  else navigate(id);
});

/* ---------- 启动 ---------- */
function boot() {
  renderShell();
  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
}
