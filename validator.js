/* ===== 数据自动校验（由 build.py 注入数据后执行） ===== */
const errs = [], warns = [];
const nodeIds = {}, qIds = {};
function err(m) { errs.push(m); }
function warn(m) { warns.push(m); }

/* 节点 */
NODES.forEach(n => {
  if (!n.id) err('节点缺少 id');
  if (nodeIds[n.id]) err('节点 id 重复: ' + n.id);
  nodeIds[n.id] = n;
  if (!n.title) err('节点缺少 title: ' + n.id);
  if (!DISCIPLINES[n.disc]) err('节点学科无效: ' + n.id + ' -> ' + n.disc);
  if (!COLUMNS.some(c => c.id === n.col)) err('节点列无效: ' + n.id + ' -> ' + n.col);
  if (typeof n.row !== 'number' || n.row < 0) err('节点 row 无效: ' + n.id);
  if (!n.summary || n.summary.length < 8) err('节点 summary 过短: ' + n.id);
  if (!n.points || !n.points.length) err('节点缺少 points: ' + n.id);
  (n.refs || []).forEach(r => { if (!REFS[r]) err('节点引用不存在的文献: ' + n.id + ' -> ' + r); });
  if (n.chain) { if (!Array.isArray(n.chain) || n.chain.length < 2) err('节点 chain 无效: ' + n.id); }
});
/* 列内 row 唯一 */
COLUMNS.forEach(c => {
  const rows = NODES.filter(n => n.col === c.id).map(n => n.row);
  const dup = rows.filter((r, i) => rows.indexOf(r) !== i);
  if (dup.length) err('列 ' + c.id + ' 内 row 重复: ' + uniq(dup).join(','));
});
/* 关键机制节点必须附文献链接 */
NODES.filter(n => n.key).forEach(n => {
  const lit = (n.refs || []).filter(r => { const x = REFS[r]; return x && (x.pmid || x.doi || x.url); });
  if (!lit.length) err('关键机制节点缺少可点击文献链接: ' + n.id);
});
/* 边 */
const edgeKeys = {};
EDGES.forEach((e, i) => {
  if (!nodeIds[e.f]) err('边端点不存在(f): 第' + (i + 1) + ' 条 ' + e.f);
  if (!nodeIds[e.t]) err('边端点不存在(t): 第' + (i + 1) + ' 条 ' + e.t);
  if (e.f === e.t) err('边自环: ' + e.f);
  if (!EDGE_TYPES[e.k]) err('边类型无效: ' + e.k);
  const k = e.f + '>' + e.t + ':' + e.k;
  if (edgeKeys[k]) warn('重复边: ' + k);
  edgeKeys[k] = 1;
});
/* 图连通性（无向） */
(function () {
  const adj = {}; NODES.forEach(n => { adj[n.id] = []; });
  EDGES.forEach(e => { if (adj[e.f] && adj[e.t]) { adj[e.f].push(e.t); adj[e.t].push(e.f); } });
  const seen = {}; const stack = [NODES[0].id]; seen[NODES[0].id] = 1;
  while (stack.length) { const x = stack.pop(); adj[x].forEach(y => { if (!seen[y]) { seen[y] = 1; stack.push(y); } }); }
  NODES.forEach(n => { if (!seen[n.id]) err('节点与主图不连通: ' + n.id); });
})();
/* 问题 */
const types = { 概念: 0, 机制: 0, 病例: 0, 综合: 0 };
const levels = { 1: 0, 2: 0, 3: 0 };
let mech = 0, lit = 0, clinical = 0, anchors = 0;
QUESTIONS.forEach(q => {
  if (qIds[q.id]) err('问题 id 重复: ' + q.id);
  qIds[q.id] = q;
  if (!q.title) err('问题缺少标题: ' + q.id);
  if (!q.prompt) err('问题缺少题干: ' + q.id);
  if (!q.answer) err('问题缺少解析: ' + q.id);
  if (!q.hint) err('问题缺少提示: ' + q.id);
  if (![1, 2, 3].includes(q.level)) err('问题层级无效: ' + q.id);
  if (!types.hasOwnProperty(q.type)) err('问题类型无效: ' + q.id + ' -> ' + q.type);
  if (![1, 2, 3].includes(q.diff)) err('问题难度无效: ' + q.id);
  if (!q.nodes || !q.nodes.length) err('问题未溯源知识节点: ' + q.id);
  (q.nodes || []).forEach(nid => { if (!nodeIds[nid]) err('问题溯源节点不存在: ' + q.id + ' -> ' + nid); });
  (q.refs || []).forEach(r => { if (!REFS[r]) err('问题文献不存在: ' + q.id + ' -> ' + r); });
  types[q.type]++; levels[q.level]++;
  if (q.mech) mech++;
  if (q.lit) lit++;
  if (q.clinical) clinical++;
  anchors += (q.nodes || []).length;
});
Object.keys(types).forEach(t => { if (!types[t]) err('问题类型覆盖缺失: ' + t); });
[1, 2, 3].forEach(l => { if (!levels[l]) err('问题层级覆盖缺失: ' + l); });
if (lit < 1) err('缺少文献溯源题');
/* 问题关系 */
QEDGES.forEach((e, i) => {
  if (!qIds[e.f]) err('问题关系起点不存在: ' + e.f);
  if (!qIds[e.t]) err('问题关系终点不存在: ' + e.t);
  if (!QEDGE_TYPES[e.k]) err('问题关系类型无效: ' + e.k);
});
/* 病例 */
const cases = NODES.filter(n => n.kind === '病例');
if (cases.length < 5) err('病例数量不足: ' + cases.length);
cases.forEach(c => {
  const has = EDGES.some(e => e.f === c.id || e.t === c.id);
  if (!has) err('病例未与知识节点建立联系: ' + c.id);
  if (!c.points || c.points.length < 4) err('病例要点不足: ' + c.id);
});
/* 统计 */
const stats = {
  nodes: NODES.length, edges: EDGES.length, questions: QUESTIONS.length,
  cases: cases.length, qedges: QEDGES.length, refs: Object.keys(REFS).length,
  types: types, levels: levels, mech: mech, mechPct: Math.round(mech / QUESTIONS.length * 1000) / 10,
  lit: lit, clinical: clinical, traced: QUESTIONS.filter(q => (q.nodes || []).length).length,
  anchors: anchors, avgAnchors: Math.round(anchors / QUESTIONS.length * 10) / 10,
  keyNodes: NODES.filter(n => n.key).length,
  keyNodesWithLit: NODES.filter(n => n.key && (n.refs || []).some(r => REFS[r] && (REFS[r].pmid || REFS[r].doi || REFS[r].url))).length,
  chains: NODES.filter(n => n.chain).length,
  hubs: NODES.filter(n => n.hub).length
};
if (mech / QUESTIONS.length < 0.4) err('机制探究类问题占比不足 40%: ' + stats.mechPct + '%');
if (stats.traced !== QUESTIONS.length) err('存在未溯源问题');
console.log(JSON.stringify({ errors: errs, warnings: warns, stats: stats }, null, 1));
if (errs.length) process.exitCode = 1;
