/* ===== 知识图谱页面（增强交互版） =====
   交互：导览/完整图谱/大纲、筛选、搜索、缩放平移、节点详情、边详情、
   关联深度、关系类型筛选、学习路径漫游、两点最短路径、全屏、键盘导航、小地图 */
const KG = { NW: 178, NH: 66, GX: 66, GY: 80, PADX: 28, HEAD_Y: 14, HEAD_H: 64, NODE_Y: 100, BOTTOM: 26 };
const KG_MARKER_ID = { 包含: 'incl', 机制: 'mech', 调控: 'reg', 药物: 'drug', 病理: 'path', 治疗: 'treat', 关联: 'assoc' };
const KG_EDGE_KINDS = ['包含', '机制', '调控', '药物', '病理', '治疗', '关联'];

/* ---------- 状态辅助 ---------- */
function kgEdgeVisible(kind) {
  const ek = APP.state.kg.edgeKinds || {};
  return ek[kind] !== false;
}
function kgAdjacency() {
  const adj = {};
  NODES.forEach(n => { adj[n.id] = []; });
  EDGES.forEach((e, i) => {
    if (!kgEdgeVisible(e.k)) return;
    if (adj[e.f] && adj[e.t]) { adj[e.f].push({ to: e.t, i: i }); adj[e.t].push({ to: e.f, i: i }); }
  });
  return adj;
}
/* 以某节点为中心、按关联深度取子图（无向） */
function kgNeighborhood(id, depth) {
  const adj = kgAdjacency();
  const levels = {}; levels[id] = 0;
  let frontier = [id];
  for (let d = 1; d <= depth; d++) {
    const next = [];
    frontier.forEach(u => {
      (adj[u] || []).forEach(x => {
        if (levels[x.to] === undefined) { levels[x.to] = d; next.push(x.to); }
      });
    });
    frontier = next;
  }
  const nodes = {}; Object.keys(levels).forEach(k => { nodes[k] = 1; });
  const edges = {};
  EDGES.forEach((e, i) => {
    if (!kgEdgeVisible(e.k)) return;
    if (levels[e.f] !== undefined && levels[e.t] !== undefined && (levels[e.f] < depth || levels[e.t] < depth)) edges[i] = 1;
  });
  return { levels: levels, nodes: nodes, edges: edges };
}
/* 两点最短路径（无向，按当前可见关系类型） */
function kgShortestPath(a, b) {
  if (!NODE_MAP[a] || !NODE_MAP[b] || a === b) return null;
  const adj = kgAdjacency();
  const prev = {}; prev[a] = null;
  const queue = [a]; let found = false;
  while (queue.length) {
    const u = queue.shift();
    if (u === b) { found = true; break; }
    (adj[u] || []).forEach(x => {
      if (prev[x.to] === undefined) { prev[x.to] = { from: u, edge: x.i }; queue.push(x.to); }
    });
  }
  if (!found) return null;
  const nodes = [b], edges = []; let cur = b;
  while (prev[cur]) { edges.unshift(prev[cur].edge); nodes.unshift(prev[cur].from); cur = prev[cur].from; }
  return { nodes: nodes, edges: edges, start: a, end: b };
}
function kgTourStepNodes() {
  const t = APP.state.kg.tour;
  const step = LEARNING_PATH[t.index];
  return step ? step.nodes.filter(id => NODE_MAP[id]) : [];
}

/* ---------- 页面 ---------- */
APP.views.knowledge = function (params) {
  const st = APP.state.kg;
  if (params.node && NODE_MAP[params.node]) { st.mode = 'graph'; st.selected = params.node; }
  if (params.mode === 'guide' || params.mode === 'graph' || params.mode === 'outline') {
    st.mode = params.mode;
    if (params.mode === 'graph') st.transform = null;
  }
  if (params.tour === '1') { st.mode = 'graph'; st.tour = { active: true, index: 0 }; st.transform = null; }
  if (params.path) {
    const pair = String(params.path).split(',');
    if (pair.length === 2 && NODE_MAP[pair[0]] && NODE_MAP[pair[1]]) {
      st.mode = 'graph'; st.tour.active = false; st.pathMode = false;
      st.path = kgShortestPath(pair[0], pair[1]);
      st.selected = pair[1]; st.transform = null;
    }
  }
  const discChips = [chip('全部学科', { on: !st.disc, attr: 'data-kg-disc=""' })].concat(
    Object.keys(DISCIPLINES).map(k => chip(DISCIPLINES[k].name, { on: st.disc === k, attr: 'data-kg-disc="' + k + '"', dot: DISCIPLINES[k].color }))
  ).join('');
  const subChips = [chip('全部', { on: !st.sub, attr: 'data-kg-sub=""' })].concat(
    ['水', '钠', '钾', '综合'].map(s => chip(s, { on: st.sub === s, attr: 'data-kg-sub="' + s + '"' }))
  ).join('');
  const modeBtns = [['guide', '导览视图'], ['graph', '完整图谱'], ['outline', '大纲视图']].map(m =>
    '<button type="button" class="btn btn-sm ' + (st.mode === m[0] ? 'btn-primary' : 'btn-ghost') + '" data-kg-mode="' + m[0] + '">' + m[1] + '</button>'
  ).join('');

  $('#view').innerHTML =
    '<div class="section-head" style="margin-top:0">' +
      '<div><div class="section-title"><span class="num">01</span>知识图谱</div>' +
      '<div class="section-sub">65 个知识节点 · 152 条关系 · 5 个学科（生理 / 病生 / 病理 / 药理 / 临床）· 7 个学科阶段 · 40 个关键机制节点附文献链接</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + modeBtns +
        '<button type="button" class="btn btn-sm btn-soft" data-kg-tour-start>▶ 学习路径漫游</button>' +
      '</div>' +
    '</div>' +
    '<div class="card" style="overflow:hidden">' +
      '<div class="toolbar">' +
        '<span class="tiny muted" style="font-weight:700">学科</span>' + discChips +
        '<span style="width:10px"></span><span class="tiny muted" style="font-weight:700">水/钠/钾</span>' + subChips +
        '<span class="grow"></span>' +
        '<input class="input" id="kg-search" placeholder="筛选节点关键词…" style="width:190px" value="' + esc(st.q) + '">' +
        '<span class="tiny muted" id="kg-count"></span>' +
      '</div>' +
      '<div id="kg-view"></div>' +
    '</div>' +
    '<div class="note-box" style="margin-top:14px">' +
      '<b>交互提示：</b>「导览视图」按 ①～⑦ 学科阶段总览全部节点；「完整图谱」支持缩放/拖动、点击节点或连线、切换关联深度、按关系类型筛选、<b>学习路径漫游</b>、<b>两点找路径</b>、全屏与键盘导航（←/→ 沿关系跳转、Esc 退出、+/- 缩放）。所有节点均附教材/文献依据，关键机制节点可点击核对文献。' +
      '<div style="margin-top:8px;display:flex;gap:14px;flex-wrap:wrap">' +
        '<a href="#/knowledge?tour=1" style="font-weight:700">▶ 一键开始「学习路径漫游」</a>' +
        '<a href="#/knowledge?path=loop_diuretic,hyperkalemia" style="font-weight:700">🔗 示例：从"袢利尿药"到"高钾血症"的路径</a>' +
        '<a href="#/knowledge?mode=graph" style="font-weight:700">🧭 打开完整图谱</a>' +
      '</div></div>';

  $$('[data-kg-mode]').forEach(b => b.addEventListener('click', function () {
    st.mode = b.getAttribute('data-kg-mode');
    if (st.mode === 'graph') st.transform = null;
    if (st.mode !== 'graph') st.tour.active = false;
    renderKnowledgeShellRefresh();
  }));
  $$('[data-kg-tour-start]').forEach(b => b.addEventListener('click', kgStartTour));
  $$('[data-kg-disc]').forEach(b => b.addEventListener('click', function () {
    const v = b.getAttribute('data-kg-disc') || null;
    st.disc = st.disc === v ? null : v;
    $$('[data-kg-disc]').forEach(x => x.classList.toggle('on', (x.getAttribute('data-kg-disc') || null) === st.disc));
    kgUpdateView();
  }));
  $$('[data-kg-sub]').forEach(b => b.addEventListener('click', function () {
    const v = b.getAttribute('data-kg-sub') || null;
    st.sub = st.sub === v ? null : v;
    $$('[data-kg-sub]').forEach(x => x.classList.toggle('on', (x.getAttribute('data-kg-sub') || null) === st.sub));
    kgUpdateView();
  }));
  const search = $('#kg-search');
  let timer = null;
  if (search) search.addEventListener('input', function () {
    st.q = search.value;
    clearTimeout(timer);
    timer = setTimeout(kgUpdateView, 180);
  });
  renderKnowledgeShellRefresh();
};

function renderKnowledgeShellRefresh() {
  $$('[data-kg-mode]').forEach(b => {
    const on = b.getAttribute('data-kg-mode') === APP.state.kg.mode;
    b.className = 'btn btn-sm ' + (on ? 'btn-primary' : 'btn-ghost');
  });
  kgUpdateView();
}

function kgVisibleNodes() {
  const st = APP.state.kg;
  const q = (st.q || '').trim().toLowerCase();
  return NODES.filter(n => {
    if (st.disc && n.disc !== st.disc) return false;
    if (st.sub && n.sub !== st.sub) return false;
    if (q) {
      const hay = [n.title, n.en, n.summary, (n.points || []).join(' '), (n.tags || []).join(' ')].join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

function kgUpdateView() {
  const st = APP.state.kg;
  const host = $('#kg-view');
  if (!host) return;
  const visible = kgVisibleNodes();
  const cnt = $('#kg-count');
  if (cnt) {
    if (st.mode === 'guide') cnt.textContent = '导览含全部节点';
    else {
      const visEdge = EDGES.filter(e => kgEdgeVisible(e.k) && visible.some(n => n.id === e.f) && visible.some(n => n.id === e.t)).length;
      cnt.textContent = '显示 ' + visible.length + ' / ' + NODES.length + ' 节点 · ' + visEdge + ' / ' + EDGES.length + ' 条关系';
    }
  }
  if (st.mode === 'guide') { host.innerHTML = kgGuideHTML(); attachKgNodeButtons(host); return; }
  if (st.mode === 'outline') { host.innerHTML = kgOutlineHTML(visible); attachKgNodeButtons(host); return; }
  host.innerHTML = kgGraphHTML(visible);
  setupKgGraph(host, visible);
  kgRenderDetail();
}

/* ---------- 导览视图 ---------- */
function kgGuideHTML() {
  const stages = STAGES.map(s => {
    const d = DISCIPLINES[s.disc];
    return '<div class="guide-stage">' +
      '<div class="gs-head" style="border-top:4px solid ' + d.color + '">' +
        '<div class="gs-title">' + esc(s.title) + '</div><div class="gs-sub">' + esc(s.sub) + '</div>' +
      '</div><div class="gs-body">' +
        s.nodes.map(id => {
          const n = NODE_MAP[id]; if (!n) return '';
          const qn = (NODE_Q[id] || []).length;
          return '<button type="button" class="gs-node" data-kg-node="' + esc(id) + '" title="' + esc(n.summary) + '">' +
            '<span class="chip-dot" style="background:' + d.color + '"></span>' + esc(n.title) +
            (qn ? '<span class="gs-q">' + qn + ' 题</span>' : '') + '</button>';
        }).join('') +
      '</div></div>';
  }).join('');
  return '<div style="padding:16px 16px 6px">' +
    '<div class="tiny muted" style="margin-bottom:2px">知识图谱导览：7 个学科阶段、65 个节点。点击任一节点进入完整图谱并查看详情；节点右侧数字表示该节点关联的问题数量。想被"带着走"可以点右上角「▶ 学习路径漫游」。</div>' +
    '<div class="guide-stages">' + stages + '</div>' +
    '<div class="guide-arrow-note">← 从正常生理出发 · 沿"紊乱 → 机制 → 病理 → 药理 → 临床"逐层递进 →</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
      Object.keys(DISCIPLINES).map(k => '<span class="badge" style="color:' + DISCIPLINES[k].color + ';background:' + DISCIPLINES[k].bg + '">' + DISCIPLINES[k].name + '：' + NODES.filter(n => n.disc === k).length + ' 节点</span>').join('') +
    '</div></div>';
}

/* ---------- 大纲视图 ---------- */
function kgOutlineHTML(visible) {
  const vis = {}; visible.forEach(n => { vis[n.id] = 1; });
  const cols = COLUMNS.map(c => {
    const ns = NODES.filter(n => n.col === c.id && vis[n.id]);
    if (!ns.length) return '';
    const d = DISCIPLINES[c.disc];
    return '<div class="outline-col">' +
      '<h4><span class="chip-dot" style="background:' + d.color + '"></span>' + esc(c.title) + ' <span class="tiny muted" style="font-weight:400">' + ns.length + ' 个节点</span></h4>' +
      ns.map(n => '<div class="outline-item" data-kg-node="' + esc(n.id) + '">' +
        '<div class="oi-title">' + esc(n.title) + (n.key ? ' <span class="tiny" style="color:#d97706">◆文献</span>' : '') + '</div>' +
        '<div class="oi-sum">' + esc(n.summary) + '</div></div>').join('') +
      '</div>';
  }).join('');
  return '<div style="padding:16px">' + (cols || '<div class="qg-empty">没有符合筛选条件的节点</div>') + '</div>';
}

function attachKgNodeButtons(host) {
  $$('[data-kg-node]', host).forEach(b => b.addEventListener('click', function (e) {
    e.stopPropagation();
    const id = b.getAttribute('data-kg-node');
    APP.state.kg.selected = id;
    APP.state.kg.mode = 'graph';
    APP.state.kg.transform = null;
    APP.state.kg.tour.active = false;
    APP.views.knowledge({});
  }));
}

/* ---------- 完整图谱 ---------- */
function kgGraphHTML(visible) {
  if (!visible.length) return '<div class="qg-empty">没有符合筛选条件的节点，请调整筛选条件。</div>';
  return '<div class="kg-layout" style="margin-top:0">' +
    '<div class="kg-main card" id="kg-main" style="overflow:hidden;box-shadow:none;border:0;border-radius:0">' +
      '<div class="kg-actionbar" id="kg-actionbar">' + kgActionBarHTML() + '</div>' +
      '<div class="kg-canvas" id="kg-canvas">' +
        '<div id="kg-stage" style="position:absolute;inset:0"></div>' +
        '<div id="kg-overlay" class="kg-overlay"></div>' +
        '<div class="kg-toolbar">' +
          '<button class="icon-btn" data-kg-zoom="in" title="放大（+）">＋</button>' +
          '<button class="icon-btn" data-kg-zoom="out" title="缩小（-）">－</button>' +
          '<button class="icon-btn" data-kg-zoom="fit" title="适应窗口">⤢</button>' +
          '<button class="icon-btn" data-kg-fullscreen title="全屏（F）">⛶</button>' +
        '</div>' +
        '<div class="kg-hint">滚轮缩放 · 拖动平移 · 点击节点/连线查看详情 · ←/→ 沿关系跳转 · Esc 退出</div>' +
        '<div class="kg-minimap" id="kg-minimap" title="小地图：点击或拖动定位"></div>' +
      '</div>' +
    '</div>' +
    '<aside class="kg-detail" id="kg-detail"></aside>' +
  '</div>';
}

function kgActionBarHTML() {
  const st = APP.state.kg;
  const depthBtns = [1, 2, 3].map(d => '<button type="button" class="seg-btn' + (st.depth === d ? ' on' : '') + '" data-kg-depth="' + d + '">' + d + ' 跳</button>').join('');
  const legend = KG_EDGE_KINDS.map(k => {
    const t = EDGE_TYPES[k];
    const on = kgEdgeVisible(k);
    return '<button type="button" class="legend-toggle' + (on ? ' on' : '') + '" data-kg-edgekind="' + k + '" title="' + esc(t.desc) + '">' +
      '<span class="legend-swatch" style="border-top-color:' + t.color + (t.dash ? ';border-top-style:dashed' : '') + '"></span>' + k + '</button>';
  }).join('');
  return '<div class="kg-actions">' +
    '<button class="btn btn-sm ' + (st.tour.active ? 'btn-primary' : 'btn-ghost') + '" data-kg-tour>' + (st.tour.active ? '■ 结束漫游' : '▶ 学习路径漫游') + '</button>' +
    '<button class="btn btn-sm ' + (st.pathMode ? 'btn-primary' : 'btn-ghost') + '" data-kg-path>🔗 找路径</button>' +
    '</div>' +
    '<div class="kg-actions">' +
      '<span class="tiny muted" style="font-weight:700">关联深度</span><span class="seg">' + depthBtns + '</span>' +
    '</div>' +
    '<div class="kg-actions kg-legend-inline"><span class="tiny muted" style="font-weight:700">显示关系</span>' + legend +
      '<button class="legend-toggle" data-kg-edgekind="__all" title="恢复显示全部关系">全部</button></div>' +
    '<div class="kg-actions" style="margin-left:auto">' +
      '<button class="btn btn-sm btn-ghost" data-kg-reset title="重置视图">⟲ 重置</button>' +
    '</div>';
}

function kgLayout(visible) {
  const cols = COLUMNS.filter(c => visible.some(n => n.col === c.id));
  const byCol = {}; cols.forEach(c => { byCol[c.id] = visible.filter(n => n.col === c.id).sort((a, b) => a.row - b.row); });
  const maxRows = Math.max.apply(null, cols.map(c => byCol[c.id].length).concat([1]));
  const W = KG.PADX * 2 + cols.length * KG.NW + Math.max(0, cols.length - 1) * KG.GX;
  const H = KG.NODE_Y + (maxRows - 1) * KG.GY + KG.NH + KG.BOTTOM;
  const pos = {};
  cols.forEach((c, i) => {
    byCol[c.id].forEach((n, j) => { pos[n.id] = { x: KG.PADX + i * (KG.NW + KG.GX), y: KG.NODE_Y + j * KG.GY }; });
  });
  return { cols: cols, byCol: byCol, pos: pos, W: W, H: H, maxRows: maxRows };
}

function kgEdgePath(a, b) {
  const cy1 = a.y + KG.NH / 2, cy2 = b.y + KG.NH / 2;
  if (Math.abs(b.x - a.x) < KG.NW * 0.75) {
    const x1 = a.x + KG.NW, x2 = b.x + KG.NW, c = 52;
    return 'M' + x1 + ',' + cy1 + ' C' + (x1 + c) + ',' + cy1 + ' ' + (x2 + c) + ',' + cy2 + ' ' + x2 + ',' + cy2;
  }
  const forward = b.x > a.x;
  const x1 = forward ? a.x + KG.NW : a.x;
  const x2 = forward ? b.x : b.x + KG.NW;
  const dx = Math.max(44, Math.abs(x2 - x1) * 0.42);
  const c1 = forward ? x1 + dx : x1 - dx;
  const c2 = forward ? x2 - dx : x2 + dx;
  return 'M' + x1 + ',' + cy1 + ' C' + c1 + ',' + cy1 + ' ' + c2 + ',' + cy2 + ' ' + x2 + ',' + cy2;
}

function kgNodeSVG(n, p) {
  const d = DISCIPLINES[n.disc] || { color: '#64748b' };
  const lines = wrapTitle(n.title, 11.2);
  const qn = (NODE_Q[n.id] || []).length;
  const hasLit = (n.refs || []).some(r => REFS[r] && (REFS[r].pmid || REFS[r].doi));
  let s = '<g class="kg-node" data-kg-node="' + esc(n.id) + '" transform="translate(' + p.x + ',' + p.y + ')" role="button" tabindex="0">';
  s += '<title>' + esc(n.title + '｜' + n.summary) + '</title>';
  s += '<rect class="node-box" x="0" y="0" width="' + KG.NW + '" height="' + KG.NH + '" rx="10"></rect>';
  s += '<rect x="0" y="10" width="4" height="' + (KG.NH - 20) + '" rx="2" fill="' + d.color + '"></rect>';
  const maxY = lines.length > 1 ? 25 : 31;
  lines.forEach((line, i) => { s += '<text class="title" x="14" y="' + (maxY + i * 15) + '">' + esc(line) + '</text>'; });
  s += '<text class="kind-tag" x="14" y="' + (KG.NH - 9) + '" fill="' + d.color + '">' + esc(n.kind) + ' · ' + esc(d.name) + '</text>';
  if (n.key) s += '<circle class="lit-dot" cx="' + (KG.NW - (qn ? 32 : 14)) + '" cy="14" r="3"><title>关键机制节点：附文献链接</title></circle>';
  if (qn) {
    s += '<circle class="q-badge" cx="' + (KG.NW - 14) + '" cy="14" r="9"><title>关联 ' + qn + ' 个问题</title></circle>';
    s += '<text class="q-badge-text" x="' + (KG.NW - 14) + '" y="17" text-anchor="middle">' + qn + '</text>';
  }
  s += '</g>';
  return s;
}

function kgGraphSVG(layout) {
  const defs = Object.keys(EDGE_TYPES).map(k => {
    const t = EDGE_TYPES[k];
    return '<marker id="arr-' + KG_MARKER_ID[k] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="' + t.color + '"></path></marker>';
  }).join('');
  let edges = '';
  EDGES.forEach((e, i) => {
    const a = layout.pos[e.f], b = layout.pos[e.t];
    if (!a || !b) return;
    const t = EDGE_TYPES[e.k] || EDGE_TYPES['关联'];
    const marker = t.marker === 'none' ? '' : ' marker-end="url(#arr-' + KG_MARKER_ID[e.k] + ')"';
    const title = (NODE_MAP[e.f] ? NODE_MAP[e.f].title : e.f) + ' → ' + (NODE_MAP[e.t] ? NODE_MAP[e.t].title : e.t) + '（' + e.k + (e.label ? '：' + e.label : '') + '）';
    edges += '<path class="kg-edge" data-kg-edge="' + i + '" d="' + kgEdgePath(a, b) + '" stroke="' + t.color + '" stroke-width="' + t.width + '"' +
      (t.dash ? ' stroke-dasharray="' + t.dash + '"' : '') + marker + '><title>' + esc(title) + '</title></path>';
  });
  let heads = '';
  layout.cols.forEach((c, i) => {
    const d = DISCIPLINES[c.disc];
    const x = KG.PADX + i * (KG.NW + KG.GX) - 8;
    heads += '<g class="kg-col-head">' +
      '<rect class="head-box" x="' + x + '" y="' + KG.HEAD_Y + '" width="' + (KG.NW + 16) + '" height="' + KG.HEAD_H + '" rx="9"></rect>' +
      '<rect x="' + x + '" y="' + KG.HEAD_Y + '" width="' + (KG.NW + 16) + '" height="4" rx="2" fill="' + d.color + '"></rect>' +
      '<text class="head-title" x="' + (x + 12) + '" y="' + (KG.HEAD_Y + 26) + '">' + esc(c.title) + '</text>' +
      '<text class="head-sub" x="' + (x + 12) + '" y="' + (KG.HEAD_Y + 42) + '">' + esc(c.sub) + '</text>' +
      '<text class="head-sub" x="' + (x + 12) + '" y="' + (KG.HEAD_Y + 55) + '">' + esc(layout.byCol[c.id].length + ' 个节点 · ' + d.name) + '</text>' +
      '</g>';
  });
  let nodes = '';
  layout.cols.forEach(c => layout.byCol[c.id].forEach(n => { nodes += kgNodeSVG(n, layout.pos[n.id]); }));
  return '<svg id="kg-svg" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' + defs + '</defs><g id="kg-root">' + heads + '<g class="kg-edges">' + edges + '</g><g class="kg-nodes">' + nodes + '</g></g></svg>';
}

function kgMinimapHTML(layout) {
  let rects = '';
  NODES.forEach(n => {
    const p = layout.pos[n.id]; if (!p) return;
    const d = DISCIPLINES[n.disc] || { color: '#64748b' };
    rects += '<rect x="' + p.x + '" y="' + p.y + '" width="' + KG.NW + '" height="' + KG.NH + '" rx="6" fill="' + d.color + '" opacity=".55"/>';
  });
  return '<svg viewBox="0 0 ' + layout.W + ' ' + layout.H + '" preserveAspectRatio="xMidYMid meet">' +
    '<rect x="0" y="0" width="' + layout.W + '" height="' + layout.H + '" fill="#f8fafc"/>' + rects +
    '<rect id="kg-vp" fill="rgba(37,99,235,.10)" stroke="#2563eb" stroke-width="10" vector-effect="non-scaling-stroke" x="0" y="0" width="10" height="10" rx="6"/></svg>';
}

/* ---------- 完整图谱：交互 ---------- */
function setupKgGraph(host, visible) {
  const st = APP.state.kg;
  const layout = kgLayout(visible);
  const canvas = $('#kg-canvas', host);
  if (!canvas) return;
  const stage = $('#kg-stage', canvas);
  if (!stage) return;
  stage.innerHTML = kgGraphSVG(layout);
  const svg = $('#kg-svg', canvas);
  const root = $('#kg-root', svg);
  const minimap = $('#kg-minimap', canvas);
  if (minimap) minimap.innerHTML = kgMinimapHTML(layout);
  const size = () => ({ w: canvas.clientWidth || 1200, h: canvas.clientHeight || 680 });
  const clampT = (x, a, b) => Math.max(a, Math.min(b, x));
  let trans = st.transform;
  function apply() {
    root.setAttribute('transform', 'translate(' + trans.x + ',' + trans.y + ') scale(' + trans.k + ')');
    st.transform = trans;
    const vp = $('#kg-vp');
    if (vp) {
      const s = size();
      const x = -trans.x / trans.k, y = -trans.y / trans.k;
      const w = s.w / trans.k, h = s.h / trans.k;
      vp.setAttribute('x', clampT(x, 0, layout.W));
      vp.setAttribute('y', clampT(y, 0, layout.H));
      vp.setAttribute('width', Math.min(w, layout.W));
      vp.setAttribute('height', Math.min(h, layout.H));
    }
  }
  function fit() {
    const s = size();
    const k = Math.min((s.w - 28) / layout.W, (s.h - 28) / layout.H, 1.05);
    trans = { k: k, x: (s.w - layout.W * k) / 2, y: (s.h - layout.H * k) / 2 };
    apply();
    st.transform = trans;
  }
  function fitNodes(ids, pad) {
    pad = pad || 90;
    const s = size();
    const pts = ids.map(id => layout.pos[id]).filter(Boolean);
    if (!pts.length) { fit(); return; }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(p => {
      x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + KG.NW); y1 = Math.max(y1, p.y + KG.NH);
    });
    const w = x1 - x0, h = y1 - y0;
    const k = clamp(Math.min((s.w - pad) / Math.max(w, 1), (s.h - pad) / Math.max(h, 1), 1.25), 0.45, 1.25);
    trans = { k: k, x: s.w / 2 - (x0 + w / 2) * k, y: s.h / 2 - (y0 + h / 2) * k };
    apply();
    st.transform = trans;
  }
  if (!trans) {
    const s = size();
    const kFit = Math.min((s.w - 28) / layout.W, (s.h - 28) / layout.H, 1.05);
    if (st.tour.active) {
      trans = { k: 1, x: 0, y: 0 };
    } else if (st.selected && layout.pos[st.selected]) {
      const k = clamp(Math.max(kFit, 0.9), 0.55, 1.15);
      trans = { k: k, x: s.w / 2 - (layout.pos[st.selected].x + KG.NW / 2) * k, y: s.h / 2 - (layout.pos[st.selected].y + KG.NH / 2) * k };
    } else if (kFit >= 0.82) {
      trans = { k: kFit, x: (s.w - layout.W * kFit) / 2, y: (s.h - layout.H * kFit) / 2 };
    } else {
      const k = 0.85;
      trans = { k: k, x: 18, y: Math.max(16, (s.h - layout.H * k) / 2) };
    }
  }
  apply();
  if (st.tour.active) {
    const tourNodes = kgTourStepNodes();
    if (tourNodes.length) fitNodes(tourNodes, 150);
  }

  function zoomAt(factor, mx, my) {
    const k2 = clamp(trans.k * factor, 0.3, 2.6);
    trans.x = mx - (mx - trans.x) * (k2 / trans.k);
    trans.y = my - (my - trans.y) * (k2 / trans.k);
    trans.k = k2;
    apply();
  }
  svg.addEventListener('wheel', function (e) {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.1 : 0.91, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
  function endDrag() { dragging = false; svg.classList.remove('dragging'); }
  svg.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; ox = trans.x; oy = trans.y;
    svg.classList.add('dragging');
    try { if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  svg.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    trans.x = ox + dx; trans.y = oy + dy; apply();
  });
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('click', function (e) {
    if (moved) return;
    const nodeEl = e.target.closest ? e.target.closest('[data-kg-node]') : null;
    if (nodeEl) { kgOnNodeClick(nodeEl.getAttribute('data-kg-node'), layout, trans, size, fitNodes); return; }
    const edgeEl = e.target.closest ? e.target.closest('[data-kg-edge]') : null;
    if (edgeEl) { kgOnEdgeClick(Number(edgeEl.getAttribute('data-kg-edge'))); return; }
    kgOnBlankClick();
  });
  svg.addEventListener('dblclick', function (e) {
    const nodeEl = e.target.closest ? e.target.closest('[data-kg-node]') : null;
    if (!nodeEl) return;
    const p = layout.pos[nodeEl.getAttribute('data-kg-node')];
    if (!p) return;
    const s = size();
    trans.x = s.w / 2 - (p.x + KG.NW / 2) * trans.k;
    trans.y = s.h / 2 - (p.y + KG.NH / 2) * trans.k;
    apply();
  });
  svg.addEventListener('mouseover', function (e) {
    const nodeEl = e.target.closest ? e.target.closest('[data-kg-node]') : null;
    if (nodeEl && !st.tour.active && !st.path && !st.pathMode && st.edgeSelected === null) {
      kgApplyHighlight(nodeEl.getAttribute('data-kg-node'));
    }
  });
  svg.addEventListener('mouseout', function (e) {
    const nodeEl = e.target.closest ? e.target.closest('[data-kg-node]') : null;
    if (nodeEl) kgApplyHighlight();
  });
  $$('[data-kg-zoom]', canvas).forEach(b => b.addEventListener('click', function () {
    const z = b.getAttribute('data-kg-zoom');
    const s = size();
    if (z === 'fit') fit();
    else zoomAt(z === 'in' ? 1.18 : 0.85, s.w / 2, s.h / 2);
  }));
  // 小地图
  function miniJump(e) {
    if (!minimap) return;
    const svgMini = minimap.querySelector('svg');
    const r = svgMini.getBoundingClientRect();
    const wx = (e.clientX - r.left) / r.width * layout.W;
    const wy = (e.clientY - r.top) / r.height * layout.H;
    const s = size();
    trans.x = s.w / 2 - wx * trans.k;
    trans.y = s.h / 2 - wy * trans.k;
    apply();
  }
  if (minimap) {
    let miniDown = false;
    minimap.addEventListener('pointerdown', function (e) { miniDown = true; miniJump(e); try { minimap.setPointerCapture(e.pointerId); } catch (err) { } });
    minimap.addEventListener('pointermove', function (e) { if (miniDown && e.buttons) miniJump(e); });
    minimap.addEventListener('pointerup', function () { miniDown = false; });
    minimap.addEventListener('pointercancel', function () { miniDown = false; });
  }
  // 操作栏
  $$('[data-kg-tour]', host).forEach(b => b.addEventListener('click', function () {
    if (st.tour.active) kgExitTour(); else kgStartTour();
  }));
  $$('[data-kg-path]', host).forEach(b => b.addEventListener('click', kgTogglePathMode));
  $$('[data-kg-depth]', host).forEach(b => b.addEventListener('click', function () {
    st.depth = Number(b.getAttribute('data-kg-depth'));
    $$('[data-kg-depth]', host).forEach(x => x.classList.toggle('on', Number(x.getAttribute('data-kg-depth')) === st.depth));
    kgApplyHighlight();
    kgRenderDetail();
  }));
  $$('[data-kg-edgekind]', host).forEach(b => b.addEventListener('click', function () {
    const k = b.getAttribute('data-kg-edgekind');
    if (k === '__all') { st.edgeKinds = {}; }
    else {
      const cur = st.edgeKinds || {};
      if (Object.keys(cur).length === 0) { // 全部可见 → 只隐藏当前
        KG_EDGE_KINDS.forEach(x => { cur[x] = true; });
      }
      cur[k] = !(cur[k] !== false);
      st.edgeKinds = cur;
    }
    // 更新按钮状态
    $$('[data-kg-edgekind]', host).forEach(x => {
      const kind = x.getAttribute('data-kg-edgekind');
      if (kind === '__all') return;
      x.classList.toggle('on', kgEdgeVisible(kind));
    });
    kgApplyHighlight();
    kgRenderDetail();
    // 更新计数
    const cnt = $('#kg-count');
    if (cnt) {
      const vis = kgVisibleNodes();
      const visEdge = EDGES.filter(e => kgEdgeVisible(e.k) && vis.some(n => n.id === e.f) && vis.some(n => n.id === e.t)).length;
      cnt.textContent = '显示 ' + vis.length + ' / ' + NODES.length + ' 节点 · ' + visEdge + ' / ' + EDGES.length + ' 条关系';
    }
  }));
  $$('[data-kg-reset]', host).forEach(b => b.addEventListener('click', function () {
    st.transform = null;
    st.selected = null; st.edgeSelected = null; st.path = null; st.pathMode = false; st.tour.active = false;
    st.edgeKinds = {}; st.depth = 1;
    kgUpdateView();
  }));
  $$('[data-kg-fullscreen]', host).forEach(b => b.addEventListener('click', kgToggleFullscreen));
  // 键盘
  if (!APP._kgKeyBound) { document.addEventListener('keydown', kgKeydown); APP._kgKeyBound = true; }
  kgRenderOverlay();
  kgApplyHighlight();
}

/* ---------- 节点/连线点击 ---------- */
function kgOnNodeClick(id, layout, trans, size, fitNodes) {
  const st = APP.state.kg;
  if (st.pathMode) {
    if (!st.pathStart) {
      st.pathStart = id; st.selected = id; st.edgeSelected = null;
      kgApplyHighlight(); kgRenderDetail(); kgRenderOverlay();
      return;
    }
    if (id === st.pathStart) { return; }
    const p = kgShortestPath(st.pathStart, id);
    st.pathMode = false;
    if (p) { st.path = p; st.selected = id; } else { st.path = null; st.selected = id; APP.kgPathError = true; }
    st.pathStart = null; st.edgeSelected = null;
    kgApplyHighlight(); kgRenderDetail(); kgRenderOverlay();
    return;
  }
  st.selected = id; st.edgeSelected = null; APP.kgPathError = false;
  try { if (APP.state.route === 'knowledge') history.replaceState(null, '', '#/knowledge?node=' + encodeURIComponent(id)); } catch (e) { }
  kgApplyHighlight(); kgRenderDetail(); kgRenderOverlay();
  if (layout && trans && size && fitNodes) { /* 保留当前视野，不强制居中 */ }
}
function kgOnEdgeClick(idx) {
  const st = APP.state.kg;
  const e = EDGES[idx];
  if (!e) return;
  st.edgeSelected = idx; st.selected = null;
  kgApplyHighlight(); kgRenderDetail(); kgRenderOverlay();
}
function kgOnBlankClick() {
  const st = APP.state.kg;
  if (st.pathMode) { st.pathMode = false; st.pathStart = null; kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail(); return; }
  if (st.edgeSelected !== null) { st.edgeSelected = null; kgApplyHighlight(); kgRenderDetail(); return; }
  if (st.selected) { st.selected = null; kgApplyHighlight(); kgRenderDetail(); }
}

/* ---------- 高亮 ---------- */
function kgApplyHighlight(hoverId) {
  const st = APP.state.kg;
  const svg = $('#kg-svg');
  if (!svg) return;
  const nodes = $$('.kg-node', svg);
  const edges = $$('.kg-edge', svg);
  let ctx = { nodes: null, edges: null, selected: st.selected, tour: false, path: false };
  if (st.tour.active) {
    const set = {};
    kgTourStepNodes().forEach(id => { set[id] = 1; });
    const eset = {};
    EDGES.forEach((e, i) => { if (set[e.f] && set[e.t] && kgEdgeVisible(e.k)) eset[i] = 1; });
    ctx = { nodes: set, edges: eset, selected: null, tour: true, path: false };
  } else if (st.pathMode && st.pathStart) {
    ctx = { nodes: { }, edges: null, selected: st.pathStart, tour: false, path: false, single: st.pathStart };
    ctx.nodes[st.pathStart] = 1;
  } else if (st.path) {
    const ns = {}, es = {};
    st.path.nodes.forEach(id => { ns[id] = 1; });
    st.path.edges.forEach(i => { es[i] = 1; });
    ctx = { nodes: ns, edges: es, selected: st.path.end, tour: false, path: true };
  } else if (st.edgeSelected !== null && EDGES[st.edgeSelected]) {
    const e = EDGES[st.edgeSelected];
    const ns = {}; ns[e.f] = 1; ns[e.t] = 1;
    ctx = { nodes: ns, edges: null, selected: null, tour: false, path: false, edgePair: true };
  } else if (st.selected) {
    const n = kgNeighborhood(st.selected, st.depth);
    ctx = { nodes: n.nodes, edges: n.edges, selected: st.selected, tour: false, path: false };
  } else if (hoverId) {
    const n = kgNeighborhood(hoverId, 1);
    ctx = { nodes: n.nodes, edges: n.edges, selected: hoverId, tour: false, path: false };
  }
  nodes.forEach(el => {
    const id = el.getAttribute('data-kg-node');
    el.classList.remove('selected', 'dim', 'tour-node', 'path-node');
    if (!ctx.nodes) return;
    const inside = !!ctx.nodes[id];
    if (ctx.tour) {
      el.classList.toggle('tour-node', inside);
      el.classList.toggle('dim', !inside);
    } else if (ctx.path) {
      el.classList.toggle('path-node', inside);
      el.classList.toggle('selected', id === ctx.selected);
      el.classList.toggle('dim', !inside);
    } else if (ctx.edgePair) {
      el.classList.toggle('dim', !inside);
    } else {
      el.classList.toggle('selected', id === ctx.selected);
      el.classList.toggle('dim', !inside);
    }
  });
  edges.forEach(el => {
    const i = Number(el.getAttribute('data-kg-edge'));
    const e = EDGES[i];
    if (!e) return;
    el.classList.remove('hot', 'dim', 'path', 'hidden-edge');
    if (!kgEdgeVisible(e.k)) { el.classList.add('hidden-edge'); return; }
    if (!ctx.nodes) return;
    if (ctx.path) {
      const onPath = ctx.edges && ctx.edges[i];
      el.classList.toggle('path', !!onPath);
      el.classList.toggle('hot', !!onPath);
      el.classList.toggle('dim', !onPath);
    } else if (ctx.edgePair) {
      const pair = (e.f === EDGES[st.edgeSelected].f && e.t === EDGES[st.edgeSelected].t) || (e.f === EDGES[st.edgeSelected].t && e.t === EDGES[st.edgeSelected].f);
      el.classList.toggle('hot', i === st.edgeSelected);
      el.classList.toggle('dim', !pair);
    } else if (ctx.tour) {
      const onTour = ctx.edges && ctx.edges[i];
      el.classList.toggle('hot', !!onTour);
      el.classList.toggle('dim', !onTour);
    } else {
      const inSet = ctx.nodes[e.f] && ctx.nodes[e.t];
      const onSelected = e.f === ctx.selected || e.t === ctx.selected;
      el.classList.toggle('hot', !!onSelected);
      el.classList.toggle('dim', !(inSet || onSelected));
    }
  });
}

/* ---------- 弹层：学习路径漫游 / 找路径 ---------- */
function kgRenderOverlay() {
  const host = $('#kg-overlay');
  if (!host) return;
  const st = APP.state.kg;
  const canvas = host.closest('.kg-canvas');
  function syncHint() { if (canvas) canvas.classList.toggle('has-overlay', host.innerHTML.trim() !== ''); }
  if (st.tour.active) {
    const step = LEARNING_PATH[st.tour.index];
    if (!step) { host.innerHTML = ''; return; }
    const dots = LEARNING_PATH.map((s, i) => '<button class="tour-dot' + (i === st.tour.index ? ' on' : '') + '" data-tour-go="' + i + '" title="第' + (i + 1) + '步：' + esc(s.title) + '"></button>').join('');
    host.innerHTML = '<div class="kg-tourbar">' +
      '<div class="tourbar-top"><span class="tour-badge">学习路径 · ' + (st.tour.index + 1) + ' / ' + LEARNING_PATH.length + '</span>' +
        '<span class="tour-title">' + esc(step.title) + '</span>' +
        '<span class="tour-actions">' +
          '<button class="btn btn-sm btn-ghost" data-tour-prev ' + (st.tour.index === 0 ? 'disabled' : '') + '>← 上一步</button>' +
          '<button class="btn btn-sm btn-primary" data-tour-next>' + (st.tour.index === LEARNING_PATH.length - 1 ? '完成 ✓' : '下一步 →') + '</button>' +
          '<button class="btn btn-sm btn-ghost" data-tour-exit>退出</button>' +
        '</span></div>' +
      '<div class="tour-desc">' + esc(step.desc) + '</div>' +
      '<div class="tour-dots">' + dots + '<span class="tiny muted" style="margin-left:6px">节点：' + step.nodes.map(id => NODE_MAP[id] ? esc(NODE_MAP[id].title) : '').join(' · ') + '</span></div>' +
      '</div>';
    $$('[data-tour-prev]', host).forEach(b => b.addEventListener('click', function () { kgTourGo(st.tour.index - 1); }));
    $$('[data-tour-next]', host).forEach(b => b.addEventListener('click', function () { kgTourGo(st.tour.index + 1); }));
    $$('[data-tour-exit]', host).forEach(b => b.addEventListener('click', kgExitTour));
    $$('[data-tour-go]', host).forEach(b => b.addEventListener('click', function () { kgTourGo(Number(b.getAttribute('data-tour-go'))); }));
    syncHint();
    return;
  }
  if (st.pathMode) {
    host.innerHTML = '<div class="kg-pathbar"><span class="path-badge">🔗 找路径</span>' +
      '<span>' + (st.pathStart ? '已选起点「<b>' + esc(NODE_MAP[st.pathStart] ? NODE_MAP[st.pathStart].title : st.pathStart) + '</b>」，请点击终点节点' : '请点击起点节点（再点终点节点）') + ' · 沿当前显示的关系连线求最短路径</span>' +
      '<button class="btn btn-sm btn-ghost" data-path-cancel>取消</button></div>';
    $$('[data-path-cancel]', host).forEach(b => b.addEventListener('click', function () { st.pathMode = false; st.pathStart = null; kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail(); }));
    syncHint();
    return;
  }
  if (st.path) {
    host.innerHTML = '<div class="kg-pathbar"><span class="path-badge">✓ 路径</span>' +
      '<span>找到 <b>' + (st.path.nodes.length - 1) + '</b> 步路径：' + st.path.nodes.map(id => esc(NODE_MAP[id] ? NODE_MAP[id].title : id)).join(' → ') + '</span>' +
      '<button class="btn btn-sm btn-ghost" data-path-clear>清除路径</button>' +
      '<button class="btn btn-sm btn-ghost" data-path-again>再找一条</button></div>';
    $$('[data-path-clear]', host).forEach(b => b.addEventListener('click', function () { APP.state.kg.path = null; kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail(); }));
    $$('[data-path-again]', host).forEach(b => b.addEventListener('click', function () { APP.state.kg.path = null; kgTogglePathMode(); }));
    syncHint();
    return;
  }
  host.innerHTML = '';
  syncHint();
}

/* ---------- 漫游 / 找路径 控制 ---------- */
function kgStartTour() {
  const st = APP.state.kg;
  st.mode = 'graph';
  st.tour = { active: true, index: 0 };
  st.transform = null; st.selected = null; st.edgeSelected = null; st.path = null; st.pathMode = false;
  renderKnowledgeShellRefresh();
}
function kgTourGo(idx) {
  const st = APP.state.kg;
  if (idx < 0 || idx >= LEARNING_PATH.length) { if (idx >= LEARNING_PATH.length) kgExitTour(); return; }
  st.tour.index = idx;
  kgUpdateView();
}
function kgExitTour() {
  const st = APP.state.kg;
  st.tour = { active: false, index: 0 };
  st.transform = null;
  kgUpdateView();
}
function kgTogglePathMode() {
  const st = APP.state.kg;
  if (st.tour.active) { st.tour.active = false; }
  st.pathMode = !st.pathMode;
  st.pathStart = null; st.path = null; st.edgeSelected = null;
  kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail();
  const b = $('[data-kg-path]');
  if (b) { b.className = 'btn btn-sm ' + (st.pathMode ? 'btn-primary' : 'btn-ghost'); }
}

/* ---------- 键盘 ---------- */
function kgKeydown(e) {
  if (APP.state.route !== 'knowledge') return;
  const st = APP.state.kg;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (e.key === 'Escape') {
    if (st.fullscreen) { kgToggleFullscreen(); e.preventDefault(); return; }
    if (st.tour.active) { kgExitTour(); e.preventDefault(); return; }
    if (st.pathMode) { st.pathMode = false; st.pathStart = null; kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail(); e.preventDefault(); return; }
    if (st.path) { st.path = null; kgApplyHighlight(); kgRenderOverlay(); kgRenderDetail(); e.preventDefault(); return; }
    if (st.edgeSelected !== null) { st.edgeSelected = null; kgApplyHighlight(); kgRenderDetail(); e.preventDefault(); return; }
    if (st.selected) { st.selected = null; kgApplyHighlight(); kgRenderDetail(); e.preventDefault(); }
    return;
  }
  if (st.mode !== 'graph' || !document.getElementById('kg-svg')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    if (!st.selected) return;
    const dir = e.key === 'ArrowRight' ? 'out' : 'in';
    const cands = (dir === 'out' ? EDGE_INDEX.out[st.selected] : EDGE_INDEX.in[st.selected]) || [];
    const target = cands.filter(ed => kgEdgeVisible(ed.k)).map(ed => dir === 'out' ? ed.t : ed.f).filter(id => id !== st.selected)[0];
    if (target) {
      st.selected = target; st.edgeSelected = null;
      kgApplyHighlight(); kgRenderDetail();
      try { history.replaceState(null, '', '#/knowledge?node=' + encodeURIComponent(target)); } catch (err) { }
      e.preventDefault();
    }
    return;
  }
  if (e.key === '+' || e.key === '=') { const b = $('[data-kg-zoom="in"]'); if (b) { b.click(); e.preventDefault(); } return; }
  if (e.key === '-' || e.key === '_') { const b = $('[data-kg-zoom="out"]'); if (b) { b.click(); e.preventDefault(); } return; }
  if (e.key === 'f' || e.key === 'F') { kgToggleFullscreen(); e.preventDefault(); }
}

/* ---------- 全屏 ---------- */
function kgToggleFullscreen() {
  const st = APP.state.kg;
  st.fullscreen = !st.fullscreen;
  const main = $('#kg-main');
  if (main) main.classList.toggle('kg-fullscreen', st.fullscreen);
  document.body.classList.toggle('kg-noscroll', st.fullscreen);
  setTimeout(function () { const b = $('[data-kg-zoom="fit"]'); if (st.fullscreen && b) b.click(); }, 40);
}

/* ---------- 详情面板 ---------- */
function kgRenderDetail() {
  const host = $('#kg-detail');
  if (!host) return;
  const st = APP.state.kg;
  if (st.edgeSelected !== null && EDGES[st.edgeSelected]) { host.innerHTML = kgEdgeDetailHTML(EDGES[st.edgeSelected]); bindKgDetail(host); return; }
  const id = st.selected;
  const n = id ? NODE_MAP[id] : null;
  let prefix = '';
  if (st.path) prefix = kgPathCardHTML(st.path);
  if (st.pathMode) {
    prefix = '<div class="detail-summary" style="margin:14px 18px 0">🔗 <b>找路径模式</b>：点击图中起点节点，再点击终点节点，自动高亮两点间的最短关系路径。<br>当前：' +
      (st.pathStart ? '起点「' + esc(NODE_MAP[st.pathStart] ? NODE_MAP[st.pathStart].title : st.pathStart) + '」，请点终点' : '尚未选择起点') + '</div>';
  }
  if (!n && st.tour.active) {
    const step = LEARNING_PATH[st.tour.index];
    if (step) {
      host.innerHTML = '<div class="detail-empty" style="padding:28px 22px">' +
        '<div style="font-size:11px;font-weight:900;color:#b45309;letter-spacing:.5px;margin-bottom:8px">学习路径 · 第 ' + (st.tour.index + 1) + ' / ' + LEARNING_PATH.length + ' 步</div>' +
        '<div style="font-weight:900;color:#0f172a;font-size:17px;margin-bottom:8px">' + esc(step.title) + '</div>' +
        '<div class="small muted" style="text-align:left;line-height:1.8;margin-bottom:14px">' + esc(step.desc) + '</div>' +
        '<div class="tiny muted" style="margin-bottom:6px">本步重点节点（点击查看详情）</div>' +
        '<div class="q-trace" style="justify-content:center">' + step.nodes.map(id => NODE_MAP[id] ? '<button type="button" class="trace-chip" data-goto-node="' + esc(id) + '">' + esc(NODE_MAP[id].title) + '</button>' : '').join('') + '</div>' +
        '<div class="tiny muted" style="margin-top:16px">提示：也可以在图中直接点击高亮的节点；用下方"下一步"继续漫游。</div></div>';
      bindKgDetail(host);
      return;
    }
  }
  if (!n) {
    host.innerHTML = '<div class="detail-empty"><div class="big">🧭</div>' +
      '<div style="font-weight:800;color:#334155;margin-bottom:6px">点击节点或连线开始探索</div>' +
      '<div>· 点击节点：机制链 / 教材文献 / 关联问题 / 上下游节点<br>' +
      '· 点击连线：查看两个知识点之间的关系类型与说明<br>' +
      '· 「学习路径漫游」：8 步走完本章；「找路径」：找出任意两点的最短关系链<br>' +
      '· 键盘：←/→ 沿关系跳转，+/- 缩放，F 全屏，Esc 退出</div>' +
      '<div style="margin-top:16px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">' +
      Object.keys(DISCIPLINES).map(k => '<span class="badge" style="color:' + DISCIPLINES[k].color + ';background:' + DISCIPLINES[k].bg + '">' + DISCIPLINES[k].name + '</span>').join('') + '</div></div>';
    return;
  }
  host.innerHTML = prefix + kgNodeDetailHTML(n);
  bindKgDetail(host);
}

function bindKgDetail(host) {
  $$('[data-goto-q]', host).forEach(b => b.addEventListener('click', () => gotoQuestion(b.getAttribute('data-goto-q'))));
  $$('[data-goto-node]', host).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
  $$('[data-goto-case]', host).forEach(b => b.addEventListener('click', () => gotoCase(b.getAttribute('data-goto-case'))));
  $$('[data-copy-node]', host).forEach(b => b.addEventListener('click', function () {
    const url = (function () { try { return location.origin + location.pathname + '#/knowledge?node=' + b.getAttribute('data-copy-node'); } catch (e) { return '#/knowledge?node=' + b.getAttribute('data-copy-node'); } })();
    const done = () => { b.textContent = '已复制 ✓'; setTimeout(() => { b.textContent = '复制深链接'; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => { window.prompt('复制以下链接：', url); });
    else window.prompt('复制以下链接：', url);
  }));
  $$('[data-kg-findpath]', host).forEach(b => b.addEventListener('click', function () {
    kgTogglePathMode();
  }));
}

function kgPathCardHTML(path) {
  let steps = '';
  for (let i = 0; i < path.nodes.length; i++) {
    const n = NODE_MAP[path.nodes[i]];
    steps += '<button type="button" class="trace-chip" data-goto-node="' + esc(path.nodes[i]) + '" style="max-width:100%">' + esc(n ? n.title : path.nodes[i]) + '</button>';
    if (i < path.edges.length) {
      const e = EDGES[path.edges[i]];
      const t = EDGE_TYPES[e.k] || EDGE_TYPES['关联'];
      steps += '<div class="path-arrow"><span style="color:' + t.color + '">↓</span> <span class="tiny" style="color:' + t.color + '">' + esc(e.k) + (e.label ? '：' + esc(e.label) : '') + '</span></div>';
    }
  }
  return '<div class="detail-section" style="padding:16px 18px 0;margin-top:0"><div class="panel-title"><span class="dot"></span>最短路径（' + (path.nodes.length - 1) + ' 步）</div>' +
    '<div class="path-chain">' + steps + '</div></div>';
}

function kgNodeDetailHTML(n) {
  const d = DISCIPLINES[n.disc] || { name: '', color: '#64748b', bg: '#f1f5f9' };
  const qs = NODE_Q[n.id] || [];
  const cases = uniq(NODE_CASES[n.id] || []);
  const outs = (EDGE_INDEX.out[n.id] || []).map(e => ({ e: e, n: NODE_MAP[e.t] })).filter(x => x.n);
  const ins = (EDGE_INDEX.in[n.id] || []).map(e => ({ e: e, n: NODE_MAP[e.f] })).filter(x => x.n);
  const refs = (n.refs || []).map(k => ({ k: k, r: REFS[k] })).filter(x => x.r);
  const shareUrl = (function () { try { return location.origin + location.pathname + '#/knowledge?node=' + n.id; } catch (e) { return '#/knowledge?node=' + n.id; } })();
  let html = '<div class="detail-head">' +
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="badge" style="color:' + d.color + ';background:' + d.bg + '">' + esc(d.name) + '</span>' +
    '<span class="badge badge-line">' + esc(n.kind) + '</span>' +
    (n.key ? '<span class="badge" style="color:#b45309;background:#fffbeb">关键机制 · 附文献</span>' : '') +
    (n.hub ? '<span class="badge" style="color:#0e7490;background:#ecfeff">导览节点</span>' : '') + '</div>' +
    '<h3 style="margin-top:8px">' + esc(n.title) + '</h3>' +
    '<div class="en">' + esc(n.en) + '</div></div>' +
    '<div class="detail-body">' +
    '<div class="detail-summary">' + esc(n.summary) + '</div>';
  if (n.chain && n.chain.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>机制链</div><div class="chain">' +
      n.chain.map((s, i) => '<span class="chain-step">' + esc(s) + '</span>' + (i < n.chain.length - 1 ? '<span class="chain-arrow">→</span>' : '')).join('') + '</div></div>';
  }
  if (n.points && n.points.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>核心要点</div><ul class="point-list">' +
      n.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></div>';
  }
  if (refs.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>教材 / 文献依据（可点击核对）</div>' +
      refs.map(x => '<div class="ref-item"><div class="ref-meta">' + refTypeBadge(x.r.type) + (x.r.pmid ? '<span class="badge badge-line">PMID ' + esc(x.r.pmid) + '</span>' : '') + '</div>' +
        '<div class="ref-cite">' + esc(x.r.cite) + '</div>' + refLinksHTML(x.r) + '</div>').join('') + '</div>';
  }
  if (qs.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>关联问题（' + qs.length + '）</div>' +
      qs.map(qid => { const q = Q_MAP[qid]; return '<button type="button" class="rel-chip" data-goto-q="' + esc(qid) + '"><span class="qno">' + esc(qid) + '</span>' + esc(q.title) + ' <span class="tiny muted">' + esc(q.type) + ' · ' + diffStars(q.diff) + '</span></button>'; }).join('') + '</div>';
  }
  if (cases.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>相关病例</div><div class="q-trace">' +
      cases.map(cid => { const c = NODE_MAP[cid]; return c ? '<button type="button" class="trace-chip" data-goto-case="' + esc(cid) + '" style="border-color:#fbcfe8;background:#fdf2f8;color:#be185d">' + esc(c.title) + '</button>' : ''; }).join('') + '</div></div>';
  }
  if (ins.length || outs.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>图谱上下文 <span class="tiny muted" style="font-weight:400">（点击可沿关系跳转）</span></div>';
    if (ins.length) html += '<div class="tiny muted" style="margin-bottom:5px">上游（指向本节点）</div><div class="q-trace" style="margin-bottom:10px">' +
      ins.slice(0, 12).map(x => '<button type="button" class="trace-chip" data-goto-node="' + esc(x.n.id) + '">' + esc(x.n.title) + ' <span class="tiny">· ' + esc(x.e.k) + '</span></button>').join('') + '</div>';
    if (outs.length) html += '<div class="tiny muted" style="margin-bottom:5px">下游（本节点指向）</div><div class="q-trace">' +
      outs.slice(0, 12).map(x => '<button type="button" class="trace-chip" data-goto-node="' + esc(x.n.id) + '">' + esc(x.n.title) + ' <span class="tiny">· ' + esc(x.e.k) + '</span></button>').join('') + '</div>';
    html += '</div>';
  }
  html += '<div class="detail-section" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">' +
    '<button type="button" class="btn btn-soft btn-sm" data-kg-findpath>🔗 以此为起点找路径</button>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-copy-node="' + esc(n.id) + '">复制深链接</button>' +
    '</div>' +
    '<div class="tiny muted" style="margin-top:10px">深链接：<span style="word-break:break-all">' + esc(shareUrl) + '</span></div>' +
    '</div>';
  return html;
}

function kgEdgeDetailHTML(e) {
  const t = EDGE_TYPES[e.k] || EDGE_TYPES['关联'];
  const a = NODE_MAP[e.f], b = NODE_MAP[e.t];
  const da = DISCIPLINES[a.disc], db = DISCIPLINES[b.disc];
  const sharedQ = uniq((NODE_Q[e.f] || []).concat(NODE_Q[e.t] || []));
  return '<div class="detail-head">' +
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="badge" style="color:' + t.color + ';background:#f8fafc;border:1px solid ' + t.color + '55">' + esc(e.k) + '关系</span>' +
    '<span class="badge badge-line">点击连线查看</span></div>' +
    '<h3 style="margin-top:8px">' + esc(a.title) + ' <span style="color:' + t.color + '">→</span> ' + esc(b.title) + '</h3>' +
    '<div class="en">' + esc(a.en) + ' → ' + esc(b.en) + '</div></div>' +
    '<div class="detail-body">' +
    '<div class="detail-summary"><b>关系说明：</b>' + esc(t.desc) + (e.label ? '<br><b>标注：</b>' + esc(e.label) : '') + '</div>' +
    '<div class="detail-section"><div class="panel-title"><span class="dot"></span>两端知识节点</div>' +
      '<button type="button" class="rel-chip" data-goto-node="' + esc(e.f) + '"><span class="qno" style="color:' + da.color + '">起点</span>' + esc(a.title) + ' <span class="tiny muted">' + esc(a.kind) + ' · ' + esc(da.name) + '</span></button>' +
      '<button type="button" class="rel-chip" data-goto-node="' + esc(e.t) + '"><span class="qno" style="color:' + db.color + '">终点</span>' + esc(b.title) + ' <span class="tiny muted">' + esc(b.kind) + ' · ' + esc(db.name) + '</span></button></div>' +
    (sharedQ.length ? '<div class="detail-section"><div class="panel-title"><span class="dot"></span>相关的问题（' + sharedQ.length + '）</div>' +
      sharedQ.slice(0, 8).map(qid => { const q = Q_MAP[qid]; return '<button type="button" class="rel-chip" data-goto-q="' + esc(qid) + '"><span class="qno">' + esc(qid) + '</span>' + esc(q.title) + '</button>'; }).join('') + '</div>' : '') +
    '<div class="detail-section" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" data-goto-node="' + esc(e.f) + '">查看起点节点</button>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-goto-node="' + esc(e.t) + '">查看终点节点</button></div>' +
    '<div class="tiny muted" style="margin-top:10px">提示：连线颜色区分关系类型（见上方操作栏），带箭头表示方向。</div></div>';
}
