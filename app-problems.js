/* ===== 问题图谱页面 ===== */
const QG_LEVELS = [
  { v: 1, name: '一级问题', sub: '记忆性', color: '#475569', bg: '#f1f5f9' },
  { v: 2, name: '二级问题', sub: '分析 / 理解', color: '#1d4ed8', bg: '#dbeafe' },
  { v: 3, name: '三级问题', sub: '应用 / 总结', color: '#be123c', bg: '#ffe4e6' }
];
const QG_TYPES = ['概念', '机制', '病例', '综合'];

APP.views.problems = function (params) {
  const st = APP.state.qg;
  if (params.q && Q_MAP[params.q]) st.selected = params.q;
  if (params.view === 'graph' || params.view === 'matrix') st.view = params.view;
  const levelChips = [chip('全部层级', { on: !st.level, attr: 'data-qg-level=""' })].concat(
    QG_LEVELS.map(l => chip(l.name, { on: st.level === l.v, attr: 'data-qg-level="' + l.v + '"', dot: l.color }))
  ).join('');
  const typeChips = [chip('全部类型', { on: !st.type, attr: 'data-qg-type=""' })].concat(
    QG_TYPES.map(t => chip(t, { on: st.type === t, attr: 'data-qg-type="' + t + '"' }))
  ).join('');
  const viewBtns = [['matrix', '矩阵视图'], ['graph', '关系视图']].map(m =>
    '<button type="button" class="btn btn-sm ' + (st.view === m[0] ? 'btn-primary' : 'btn-ghost') + '" data-qg-view="' + m[0] + '">' + m[1] + '</button>'
  ).join('');
  $('#view').innerHTML =
    '<div class="section-head" style="margin-top:0">' +
      '<div><div class="section-title"><span class="num">02</span>问题图谱</div>' +
      '<div class="section-sub">35 个问题 · 100% 溯源知识节点 · 三级问题（记忆/分析/应用）· 四类问题（概念/机制/病例/综合）· 机制探究类 ' + APP.stats.mech + ' 题（' + APP.stats.mechPct + '%）· 文献溯源题 1 题</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + viewBtns + '</div>' +
    '</div>' +
    '<div class="q-layout" style="margin-top:0">' +
      '<div class="q-main card" style="overflow:hidden">' +
        '<div class="toolbar">' +
          '<span class="tiny muted" style="font-weight:700">层级</span>' + levelChips +
          '<span style="width:10px"></span><span class="tiny muted" style="font-weight:700">类型</span>' + typeChips +
          '<span style="width:10px"></span>' + chip('仅机制探究', { on: st.mechOnly, attr: 'data-qg-mech="1"' }) + chip('仅文献溯源', { on: st.litOnly, attr: 'data-qg-lit="1"' }) +
          chip('自测模式', { on: st.selftest, attr: 'data-qg-selftest="1"' }) +
          '<span class="grow"></span>' +
          '<div class="progress-wrap" title="自测进度保存在本机浏览器"><div class="progress-bar"><div class="progress-fill" id="qg-progress-fill" style="width:0%"></div></div><span class="tiny muted" id="qg-progress-text"></span></div>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="qg-random">随机抽题</button>' +
          '<input class="input" id="qg-search" placeholder="筛选问题关键词…" style="width:170px" value="' + esc(st.q || '') + '">' +
        '</div>' +
        '<div id="qg-view"></div>' +
      '</div>' +
      '<aside class="q-detail card" id="q-detail"></aside>' +
    '</div>' +
    '<div class="note-box" style="margin-top:14px">' +
      '<b>问题图谱说明：</b>每个问题均标注"溯源知识节点"（点击可跳转到知识图谱对应节点，做到 100% 挂载）；' +
      '层级按布鲁姆认知层级简化：一级＝记忆性，二级＝分析/理解，三级＝应用/总结。开启「自测模式」后解析隐藏，可自评"已掌握/待复习"，进度仅保存在本机。' +
    '</div>';

  $$('[data-qg-view]').forEach(b => b.addEventListener('click', function () {
    st.view = b.getAttribute('data-qg-view');
    $$('[data-qg-view]').forEach(x => { const on = x.getAttribute('data-qg-view') === st.view; x.className = 'btn btn-sm ' + (on ? 'btn-primary' : 'btn-ghost'); });
    qgUpdateView();
  }));
  $$('[data-qg-level]').forEach(b => b.addEventListener('click', function () {
    const v = b.getAttribute('data-qg-level');
    st.level = v ? Number(v) : null;
    $$('[data-qg-level]').forEach(x => x.classList.toggle('on', String(x.getAttribute('data-qg-level') || '') === String(st.level || '')));
    qgUpdateView();
  }));
  $$('[data-qg-type]').forEach(b => b.addEventListener('click', function () {
    const v = b.getAttribute('data-qg-type') || null;
    st.type = st.type === v ? null : v;
    $$('[data-qg-type]').forEach(x => x.classList.toggle('on', (x.getAttribute('data-qg-type') || null) === st.type));
    qgUpdateView();
  }));
  $$('[data-qg-mech]').forEach(b => b.addEventListener('click', function () { st.mechOnly = !st.mechOnly; b.classList.toggle('on', st.mechOnly); qgUpdateView(); }));
  $$('[data-qg-lit]').forEach(b => b.addEventListener('click', function () { st.litOnly = !st.litOnly; b.classList.toggle('on', st.litOnly); qgUpdateView(); }));
  $$('[data-qg-selftest]').forEach(b => b.addEventListener('click', function () { st.selftest = !st.selftest; b.classList.toggle('on', st.selftest); qgUpdateView(); }));
  const rand = $('#qg-random');
  if (rand) rand.addEventListener('click', function () {
    const list = qgFiltered();
    if (!list.length) return;
    const pool = list.filter(q => APP.state.progress[q.id] !== 'mastered');
    const pick = (pool.length ? pool : list)[Math.floor(Math.random() * (pool.length ? pool.length : list.length))];
    st.selected = pick.id; st.revealed = {};
    qgUpdateView();
  });
  const search = $('#qg-search');
  let timer = null;
  if (search) search.addEventListener('input', function () {
    st.q = search.value;
    clearTimeout(timer); timer = setTimeout(qgUpdateView, 180);
  });
  qgUpdateView();
};

function qgFiltered() {
  const st = APP.state.qg;
  const q = (st.q || '').trim().toLowerCase();
  return QUESTIONS.filter(x => {
    if (st.level && x.level !== st.level) return false;
    if (st.type && x.type !== st.type) return false;
    if (st.mechOnly && !x.mech) return false;
    if (st.litOnly && !x.lit) return false;
    if (st.hideMastered && APP.state.progress[x.id] === 'mastered') return false;
    if (q) {
      const hay = [x.id, x.title, x.prompt, x.answer, x.type, (x.nodes || []).map(nid => NODE_MAP[nid] ? NODE_MAP[nid].title : '').join(' ')].join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
}

function qgUpdateView() {
  const host = $('#qg-view');
  if (!host) return;
  const list = qgFiltered();
  updateQgProgress();
  if (APP.state.qg.view === 'graph') host.innerHTML = qgGraphHTML(list);
  else host.innerHTML = qgMatrixHTML(list);
  attachQgEvents(host);
  qgRenderDetail();
}

function updateQgProgress() {
  const vals = Object.keys(APP.state.progress).map(k => APP.state.progress[k]);
  const mastered = vals.filter(v => v === 'mastered').length;
  const review = vals.filter(v => v === 'review').length;
  const total = QUESTIONS.length;
  const pct = Math.round(mastered / total * 100);
  const fill = $('#qg-progress-fill'), text = $('#qg-progress-text');
  if (fill) fill.style.width = pct + '%';
  if (text) text.innerHTML = '已掌握 <b style="color:#059669">' + mastered + '</b> · 待复习 <b style="color:#d97706">' + review + '</b> · 共 ' + total;
}

function qgChipHTML(q, relatedMap, selected) {
  const lv = QG_LEVELS.filter(l => l.v === q.level)[0] || QG_LEVELS[2];
  const prog = APP.state.progress[q.id];
  const cls = 'q-chip' + (selected === q.id ? ' selected' : '') + (relatedMap && relatedMap[q.id] ? ' related' : '') + (selected && !relatedMap[q.id] ? ' dim' : '');
  return '<button type="button" class="' + cls + '" data-qg-q="' + esc(q.id) + '" style="border-left:3px solid ' + lv.color + '">' +
    '<div class="qc-top"><span class="qc-no">' + esc(q.id) + '</span>' +
    '<span class="tiny" style="color:' + lv.color + '">' + esc(q.type) + '</span>' +
    '<span class="qc-diff" title="难度">' + diffStars(q.diff) + '</span></div>' +
    '<div class="qc-title">' + esc(q.title) + '</div>' +
    (prog ? '<span class="qc-mark ' + (prog === 'mastered' ? 'mastered' : 'review') + '">' + (prog === 'mastered' ? '✓' : '!') + '</span>' : '') +
    '</button>';
}

function qgMatrixHTML(list) {
  const st = APP.state.qg;
  const sel = st.selected;
  const relatedMap = {};
  if (sel) {
    relatedMap[sel] = 1;
    (QEDGE_INDEX.out[sel] || []).forEach(e => { relatedMap[e.t] = 1; });
    (QEDGE_INDEX.in[sel] || []).forEach(e => { relatedMap[e.f] = 1; });
  }
  const counts = {};
  QG_TYPES.forEach(t => { counts[t] = list.filter(q => q.type === t).length; });
  let grid = '<div class="matrix-corner"></div>' +
    QG_TYPES.map(t => '<div class="matrix-col-head">' + t + '<span class="tiny muted">' + counts[t] + ' 题</span></div>').join('');
  QG_LEVELS.forEach(lv => {
    const inLevel = list.filter(q => q.level === lv.v);
    grid += '<div class="matrix-row-head" style="border-left:4px solid ' + lv.color + '"><span class="mrh-name">' + lv.name + '</span><span class="tiny muted">' + lv.sub + ' · ' + inLevel.length + ' 题</span></div>';
    QG_TYPES.forEach(t => {
      const qs = inLevel.filter(q => q.type === t);
      grid += '<div class="matrix-cell' + (qs.length ? ' has-items' : '') + '">' + qs.map(q => qgChipHTML(q, sel ? relatedMap : null, sel)).join('') + '</div>';
    });
  });
  return '<div class="matrix"><div class="matrix-grid">' + grid + '</div></div>' +
    '<div class="q-legend">' +
      '<span class="legend-item"><span class="legend-dot" style="background:#059669"></span>✓ 已掌握</span>' +
      '<span class="legend-item"><span class="legend-dot" style="background:#d97706"></span>! 待复习</span>' +
      '<span class="legend-item"><span class="tiny muted">行＝认知层级（记忆→分析→应用/总结）· 列＝问题类型（概念/机制/病例/综合）</span></span>' +
      (st.selftest ? '<span class="badge" style="background:#eff6ff;color:#1e40af;margin-left:auto">自测模式：点击问题后先自答，再点"显示解析"</span>' : '') +
    '</div>';
}

/* 关系视图 */
const QG_NW = 232, QG_NH = 56, QG_GX = 90, QG_GY = 74;
function qgGraphHTML(list) {
  const cols = QG_LEVELS.slice(); // 一级→二级→三级 从左到右
  const byLevel = {};
  cols.forEach(l => { byLevel[l.v] = list.filter(q => q.level === l.v).sort((a, b) => QG_TYPES.indexOf(a.type) - QG_TYPES.indexOf(b.type) || a.id.localeCompare(b.id)); });
  const maxRows = Math.max.apply(null, cols.map(l => byLevel[l.v].length).concat([1]));
  const W = 60 + cols.length * QG_NW + (cols.length - 1) * QG_GX + 60;
  const H = 70 + maxRows * QG_GY + 30;
  const pos = {};
  cols.forEach((l, i) => {
    byLevel[l.v].forEach((q, j) => {
      pos[q.id] = { x: 60 + i * (QG_NW + QG_GX), y: 70 + j * QG_GY };
    });
  });
  const visibleIds = {}; list.forEach(q => { visibleIds[q.id] = 1; });
  let heads = '', nodes = '', edges = '';
  cols.forEach((l, i) => {
    const x = 60 + i * (QG_NW + QG_GX);
    heads += '<g><rect x="' + (x - 8) + '" y="14" width="' + (QG_NW + 16) + '" height="40" rx="9" fill="' + l.bg + '" stroke="' + l.color + '33"></rect>' +
      '<text class="qg-col-head" x="' + (x + 8) + '" y="33">' + l.name + ' · ' + l.sub + '</text>' +
      '<text class="qg-note" x="' + (x + 8) + '" y="47">' + byLevel[l.v].length + ' 题</text></g>';
  });
  QEDGES.forEach(e => {
    if (!visibleIds[e.f] || !visibleIds[e.t]) return;
    const a = pos[e.f], b = pos[e.t];
    if (!a || !b) return;
    const t = QEDGE_TYPES[e.k] || QEDGE_TYPES['关联'];
    const cy1 = a.y + QG_NH / 2, cy2 = b.y + QG_NH / 2;
    let x1, x2, forward = b.x > a.x;
    if (Math.abs(b.x - a.x) < QG_NW * 0.8) { x1 = a.x + QG_NW; x2 = b.x + QG_NW; }
    else { x1 = forward ? a.x + QG_NW : a.x; x2 = forward ? b.x : b.x + QG_NW; }
    const dx = Math.max(40, Math.abs(x2 - x1) * 0.4);
    const c1 = forward ? x1 + dx : x1 - dx, c2 = forward ? x2 - dx : x2 + dx;
    edges += '<path class="qg-edge" d="M' + x1 + ',' + cy1 + ' C' + c1 + ',' + cy1 + ' ' + c2 + ',' + cy2 + ' ' + x2 + ',' + cy2 + '" stroke="' + t.color + '" stroke-width="1.4"' +
      (t.dash ? ' stroke-dasharray="' + t.dash + '"' : '') + '><title>' + esc(e.f + ' ' + e.k + ' ' + e.t) + '</title></path>';
  });
  list.forEach(q => {
    const p = pos[q.id]; if (!p) return;
    const lv = QG_LEVELS.filter(l => l.v === q.level)[0] || QG_LEVELS[2];
    const prog = APP.state.progress[q.id];
    const selected = APP.state.qg.selected === q.id;
    const lines = wrapTitle(q.title, 15);
    nodes += '<g class="qg-node' + (selected ? ' selected' : '') + '" data-qg-q="' + esc(q.id) + '" transform="translate(' + p.x + ',' + p.y + ')">' +
      '<rect class="qg-box" x="0" y="0" width="' + QG_NW + '" height="' + QG_NH + '" rx="9"></rect>' +
      '<rect x="0" y="8" width="4" height="' + (QG_NH - 16) + '" rx="2" fill="' + lv.color + '"></rect>' +
      '<text class="qg-no" x="12" y="20">' + esc(q.id) + ' · ' + esc(q.type) + ' · ' + diffStars(q.diff) + '</text>' +
      lines.map((ln, i) => '<text class="qg-title" x="12" y="' + (34 + i * 13) + '">' + esc(ln) + '</text>').join('') +
      (prog ? '<circle cx="' + (QG_NW - 14) + '" cy="14" r="7" fill="' + (prog === 'mastered' ? '#059669' : '#d97706') + '"></circle><text x="' + (QG_NW - 14) + '" y="17.5" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">' + (prog === 'mastered' ? '✓' : '!') + '</text>' : '') +
      '</g>';
  });
  return '<div class="q-graph-wrap" style="max-height:70vh;overflow:auto">' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" style="min-width:980px;width:100%;height:auto">' + heads + edges + nodes + '</svg></div>' +
    '<div class="q-legend">' + Object.keys(QEDGE_TYPES).map(k => '<span class="legend-item"><span class="legend-swatch" style="border-top-color:' + QEDGE_TYPES[k].color + (QEDGE_TYPES[k].dash ? ';border-top-style:dashed' : '') + '"></span>' + k + '</span>').join('') +
    '<span class="tiny muted" style="margin-left:auto">左侧为一级问题，向右递进到三级；点击节点查看详情</span></div>';
}

function attachQgEvents(host) {
  $$('[data-qg-q]', host).forEach(el => el.addEventListener('click', function (e) {
    e.stopPropagation();
    const id = el.getAttribute('data-qg-q');
    APP.state.qg.selected = id;
    APP.state.qg.revealed = {};
    qgUpdateView();
  }));
}

function qgRelated(qid) {
  const outs = (QEDGE_INDEX.out[qid] || []).map(e => ({ dir: 'out', e: e, other: e.t }));
  const ins = (QEDGE_INDEX.in[qid] || []).map(e => ({ dir: 'in', e: e, other: e.f }));
  return { outs: outs, ins: ins };
}

function qgRenderDetail() {
  const host = $('#q-detail');
  if (!host) return;
  const st = APP.state.qg;
  const q = st.selected ? Q_MAP[st.selected] : null;
  if (!q) {
    host.innerHTML = '<div class="detail-empty"><div class="big">❓</div>' +
      '<div style="font-weight:800;color:#334155;margin-bottom:6px">点击一道题查看详情</div>' +
      '<div>每道题均标注溯源知识节点、层级、类型、难度、思维提示与参考解析。<br>建议先自己思考，再展开解析。</div>' +
      '<div style="margin-top:16px"><button class="btn btn-soft btn-sm" id="qg-random2">随机抽一题试试</button></div></div>';
    const r = $('#qg-random2');
    if (r) r.addEventListener('click', function () { const b = $('#qg-random'); if (b) b.click(); });
    return;
  }
  const prog = APP.state.progress[q.id];
  const rel = qgRelated(q.id);
  const trace = (q.nodes || []).map(nid => NODE_MAP[nid]).filter(Boolean);
  const refs = (q.refs || []).map(k => ({ k: k, r: REFS[k] })).filter(x => x.r);
  st.revealed = st.revealed || {};
  const revealed = !!st.revealed[q.id] || !st.selftest;
  const answerHTML = '<div class="q-answer">' + esc(q.answer) + '</div>';
  let html = '<div class="detail-head">' +
    '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
      '<span class="badge" style="background:#eff6ff;color:#1e40af">' + esc(q.id) + '</span>' + levelBadge(q.level) +
      '<span class="badge badge-line">' + esc(q.type) + '</span>' +
      (q.mech ? '<span class="badge" style="background:#f0fdf4;color:#166534">机制探究</span>' : '') +
      (q.lit ? '<span class="badge" style="background:#fef3c7;color:#92400e">文献溯源</span>' : '') +
      '<span class="badge badge-line" title="难度">' + diffStars(q.diff) + '</span>' +
    '</div>' +
    '<h3 style="margin-top:8px">' + esc(q.title) + '</h3></div>' +
    '<div class="detail-body">' +
    '<div class="q-prompt">' + esc(q.prompt) + '</div>' +
    '<div class="q-meta-row" style="margin-top:12px">' + (prog === 'mastered' ? '<span class="badge" style="background:#dcfce7;color:#166534">✓ 已掌握</span>' : prog === 'review' ? '<span class="badge" style="background:#fef3c7;color:#92400e">! 待复习</span>' : '<span class="badge badge-line">未标记</span>') +
      '<span class="tiny muted">进度保存在本机浏览器</span></div>' +
    '<div class="detail-section"><div class="panel-title"><span class="dot"></span>溯源知识节点（点击跳转知识图谱）</div><div class="q-trace">' +
      trace.map(n => nodeChip(n.id)).join('') + '</div></div>' +
    '<div class="detail-section"><div class="panel-title"><span class="dot"></span>思维提示</div><div class="q-hint">' + esc(q.hint) + '</div></div>' +
    '<div class="detail-section"><div class="panel-title"><span class="dot"></span>参考解析</div>' +
      (st.selftest && !revealed
        ? '<button type="button" class="btn btn-soft btn-sm" id="qg-reveal">显示解析（先自己回答）</button>'
        : answerHTML) + '</div>';
  if (refs.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>文献依据</div>' +
      refs.map(x => '<div class="ref-item"><div class="ref-meta">' + refTypeBadge(x.r.type) + '</div><div class="ref-cite">' + esc(x.r.cite) + '</div>' + refLinksHTML(x.r) + '</div>').join('') + '</div>';
  }
  if (rel.outs.length || rel.ins.length) {
    html += '<div class="detail-section"><div class="panel-title"><span class="dot"></span>问题之间的关系</div>';
    const row = (title, arr, dir) => arr.length ? '<div class="tiny muted" style="margin:6px 0 4px">' + title + '</div><div class="q-trace">' +
      arr.map(x => { const o = Q_MAP[x.other]; return o ? '<button type="button" class="trace-chip" data-goto-q="' + esc(o.id) + '">' + esc(o.id) + ' ' + esc(o.title) + ' <span class="tiny">· ' + esc(x.e.k) + '</span></button>' : ''; }).join('') + '</div>' : '';
    html += row('前置/相似/关联（指向本题）', rel.ins) + row('本题延伸（前置/进阶/相似）', rel.outs);
    html += '</div>';
  }
  html += '<div class="detail-section" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">' +
    '<button type="button" class="btn btn-sm ' + (prog === 'mastered' ? 'btn-primary' : 'btn-ghost') + '" data-qg-mark="mastered">✓ 已掌握</button>' +
    '<button type="button" class="btn btn-sm ' + (prog === 'review' ? 'btn-primary' : 'btn-ghost') + '" data-qg-mark="review">! 待复习</button>' +
    '<button type="button" class="btn btn-sm btn-ghost" data-qg-mark="clear">清除标记</button>' +
    '</div></div>';
  host.innerHTML = html;
  const reveal = $('#qg-reveal');
  if (reveal) reveal.addEventListener('click', function () { APP.state.qg.revealed[q.id] = 1; qgRenderDetail(); });
  $$('[data-goto-q]', host).forEach(b => b.addEventListener('click', () => gotoQuestion(b.getAttribute('data-goto-q'))));
  $$('[data-goto-node]', host).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
  $$('[data-qg-mark]', host).forEach(b => b.addEventListener('click', function () {
    const v = b.getAttribute('data-qg-mark');
    if (v === 'clear') delete APP.state.progress[q.id];
    else APP.state.progress[q.id] = v;
    store.set('progress', APP.state.progress);
    updateQgProgress();
    qgUpdateView();
  }));
}
