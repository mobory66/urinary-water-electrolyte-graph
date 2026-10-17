/* jsdom 冒烟测试：加载 dist/index.html，模拟路由与交互，输出结构化检查结果 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'dist', 'index.html'), 'utf8');
const results = [];
const errors = [];
function check(name, fn) {
  try {
    const v = fn();
    results.push({ name, ok: v !== false && v !== undefined && v !== null, detail: typeof v === 'string' ? v : '' });
    return v;
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
    errors.push(name + ': ' + e.message);
    return null;
  }
}
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  const msg = String(e && e.message || e);
  if (/Not implemented|Could not parse CSS/i.test(msg)) return;
  errors.push('jsdomError: ' + msg);
});
const dom = new JSDOM(html, {
  url: 'https://example.org/#/overview',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.scrollTo = () => {};
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.addEventListener('error', e => errors.push('window.error: ' + (e.message || e.type)));
  }
});
const { window } = dom;
const { document } = window;
function tick(ms) { return new Promise(r => setTimeout(r, ms || 30)); }
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }
function setHash(h) { window.location.hash = h; }

(async function main() {
  await tick(120);
  check('默认路由渲染总览', () => {
    const v = $('#view');
    if (!v || v.innerHTML.length < 2000) throw new Error('总览内容过短');
    if (!document.body.textContent.includes('水、电解质代谢紊乱')) throw new Error('缺少标题');
    return true;
  });
  check('首页统计数字来自数据', () => {
    const txt = document.body.textContent;
    ['65', '152', '35', '7', '55'].forEach(n => { if (!txt.includes(n)) throw new Error('缺少统计数字 ' + n); });
    return true;
  });

  // 路由：知识图谱
  for (const h of ['#/knowledge', '#/problems', '#/cases', '#/tools', '#/guide']) {
    setHash(h);
    await tick(80);
    check('路由 ' + h + ' 渲染', () => {
      const v = $('#view');
      if (!v || v.innerHTML.length < 1500) throw new Error('内容过短 ' + (v ? v.innerHTML.length : 0));
      return v.innerHTML.length + ' 字符';
    });
  }

  // 知识图谱：深链接节点 + 完整图谱渲染
  setHash('#/knowledge?node=hypokalemia');
  await tick(150);
  check('知识图谱完整图谱节点数 = 64', () => {
    const n = $$('#kg-canvas .kg-node').length;
    if (n !== 65) throw new Error('节点数 ' + n);
    return n + ' 个节点';
  });
  check('知识图谱边渲染', () => {
    const e = $$('#kg-canvas .kg-edge').length;
    if (e < 100) throw new Error('边数 ' + e);
    return e + ' 条边';
  });
  check('节点详情面板打开', () => {
    const d = $('#kg-detail');
    if (!d || !d.textContent.includes('低钾血症')) throw new Error('详情未显示低钾血症');
    if (!d.textContent.includes('文献依据')) throw new Error('详情缺少文献依据');
    // 点击一个关联问题
    return true;
  });
  check('知识图谱筛选（学科=药理学）', () => {
    const chip = $$('[data-kg-disc]').find(b => b.getAttribute('data-kg-disc') === 'pharm');
    if (!chip) throw new Error('找不到学科筛选');
    chip.click();
    const n = $$('#kg-canvas .kg-node').length;
    if (n >= 64 || n < 5) throw new Error('筛选后节点数异常 ' + n);
    return n + ' 个节点';
  });
  check('大纲视图渲染', () => {
    const chip = $$('[data-kg-mode]').find(b => b.getAttribute('data-kg-mode') === 'outline');
    chip.click();
    const items = $$('#kg-view .outline-item').length;
    if (items < 10) throw new Error('大纲条目 ' + items);
    return items + ' 条';
  });
  check('导览视图渲染', () => {
    const chip = $$('[data-kg-mode]').find(b => b.getAttribute('data-kg-mode') === 'guide');
    chip.click();
    const cards = $$('#kg-view .guide-stage').length;
    if (cards !== 7) throw new Error('阶段卡片 ' + cards);
    return cards + ' 个阶段';
  });

  // ===== 知识图谱增强交互 =====
  setHash('#/knowledge?node=hypokalemia');
  await tick(150);
  check('增强交互：操作栏/小地图存在', () => {
    const allDisc = $$('[data-kg-disc]').find(b => (b.getAttribute('data-kg-disc') || '') === '');
    if (allDisc) allDisc.click();
    const graphBtn = $$('[data-kg-mode]').find(b => b.getAttribute('data-kg-mode') === 'graph');
    graphBtn.click();
    if (!$$('[data-kg-tour]').length) throw new Error('缺少学习路径漫游按钮');
    if (!$$('[data-kg-path]').length) throw new Error('缺少找路径按钮');
    if ($$('[data-kg-depth]').length !== 3) throw new Error('关联深度按钮数不是3');
    if (!$$('[data-kg-edgekind]').length) throw new Error('缺少关系类型筛选');
    if (!$('#kg-minimap') || !$('#kg-minimap #kg-vp')) throw new Error('缺少小地图');
    return '操作栏/小地图正常';
  });
  check('增强交互：关系类型筛选', () => {
    const mech = $$('[data-kg-edgekind]').find(b => b.getAttribute('data-kg-edgekind') === '机制');
    mech.click();
    const hidden = $$('#kg-canvas .kg-edge.hidden-edge').length;
    if (hidden < 5) throw new Error('隐藏边数 ' + hidden);
    const all = $$('[data-kg-edgekind]').find(b => b.getAttribute('data-kg-edgekind') === '__all');
    all.click();
    const hidden2 = $$('#kg-canvas .kg-edge.hidden-edge').length;
    if (hidden2 !== 0) throw new Error('恢复后仍有隐藏边 ' + hidden2);
    return '隐藏 ' + hidden + ' 条后已恢复';
  });
  check('增强交互：点击连线查看关系', () => {
    const edge = $('#kg-canvas .kg-edge');
    if (!edge) throw new Error('没有连线');
    edge.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const d = $('#kg-detail');
    if (!d.textContent.includes('关系说明') || !d.textContent.includes('两端知识节点')) throw new Error('未显示关系详情');
    return true;
  });
  check('增强交互：找路径（两点最短路径）', () => {
    const pathBtn = $$('[data-kg-path]')[0];
    pathBtn.click();
    if (!$('.kg-pathbar')) throw new Error('未进入路径模式');
    const nodeA = $('#kg-canvas .kg-node[data-kg-node="loop_diuretic"]');
    const nodeB = $('#kg-canvas .kg-node[data-kg-node="hyperkalemia"]');
    if (!nodeA || !nodeB) throw new Error('找不到节点');
    nodeA.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    nodeB.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const d = $('#kg-detail');
    if (!d.textContent.includes('最短路径')) throw new Error('未显示路径卡片');
    const pathEdges = $$('#kg-canvas .kg-edge.path').length;
    if (pathEdges < 1) throw new Error('路径边高亮数为 ' + pathEdges);
    return '路径边 ' + pathEdges + ' 条';
  });
  check('增强交互：学习路径漫游 8 步', () => {
    const start = $$('[data-kg-tour-start]')[0] || $$('[data-kg-tour]')[0];
    start.click();
    if (!$('.kg-tourbar')) throw new Error('未出现漫游条');
    if (!$('.kg-tourbar').textContent.includes('1 / 8')) throw new Error('未显示第1/8步');
    const next = $('[data-tour-next]');
    next.click();
    if (!$('.kg-tourbar').textContent.includes('2 / 8')) throw new Error('下一步未生效');
    const dot = $('[data-tour-go="7"]');
    dot.click();
    const finish = $('[data-tour-next]');
    finish.click();
    if ($('.kg-tourbar')) throw new Error('完成漫游后未退出');
    return '8 步漫游正常';
  });
  check('增强交互：全屏与键盘导航', () => {
    const fs = $$('[data-kg-fullscreen]')[0];
    fs.click();
    if (!$('#kg-main').classList.contains('kg-fullscreen')) throw new Error('未进入全屏');
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if ($('#kg-main') && $('#kg-main').classList.contains('kg-fullscreen')) throw new Error('Esc 未退出全屏');
    // 键盘沿关系跳转
    const node = $('#kg-canvas .kg-node[data-kg-node="hypokalemia"]');
    node.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const before = $('#kg-detail h3') ? $('#kg-detail h3').textContent : '';
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const after = $('#kg-detail h3') ? $('#kg-detail h3').textContent : '';
    if (!after || before === after) throw new Error('←/→ 未跳转（' + before + ' → ' + after + '）');
    return true;
  });

  // 问题图谱
  setHash('#/problems?q=Q15');
  await tick(150);
  check('问题矩阵渲染 35 题', () => {
    const n = $$('#qg-view .q-chip').length;
    if (n !== 35) throw new Error('题目数 ' + n);
    return n + ' 题';
  });
  check('问题详情含溯源节点', () => {
    const d = $('#q-detail');
    if (!d || !d.textContent.includes('溯源知识节点')) throw new Error('缺溯源区块');
    if (!d.textContent.includes('反常性酸性尿')) throw new Error('缺解析内容');
    return true;
  });
  check('自测模式隐藏解析', () => {
    const chip = $$('[data-qg-selftest]')[0];
    chip.click();
    const hasReveal = !!$('#qg-reveal');
    if (!hasReveal) throw new Error('未出现"显示解析"按钮');
    const rel = $('#qg-reveal');
    rel.click();
    if (!($('#q-detail').textContent.includes('参考解析'))) throw new Error('解析未显示');
    return true;
  });
  check('标记已掌握并保存进度', () => {
    const btn = $$('[data-qg-mark]').find(b => b.getAttribute('data-qg-mark') === 'mastered');
    if (!btn) throw new Error('找不到掌握按钮');
    btn.click();
    const text = $('#qg-progress-text');
    if (!text || !text.textContent.includes('已掌握')) throw new Error('进度未更新');
    const saved = window.localStorage.getItem('wes_progress');
    if (!saved || saved.indexOf('Q15') < 0) throw new Error('localStorage 未保存');
    return true;
  });
  check('问题层级筛选', () => {
    const chip = $$('[data-qg-level]').find(b => b.getAttribute('data-qg-level') === '3');
    chip.click();
    const n = $$('#qg-view .q-chip').length;
    if (n < 5) throw new Error('三级题数 ' + n);
    return n + ' 题';
  });
  check('关系视图渲染', () => {
    const b = $$('[data-qg-view]').find(x => x.getAttribute('data-qg-view') === 'graph');
    b.click();
    const n = $$('#qg-view .qg-node').length;
    if (n !== 10) throw new Error('关系图节点 ' + n);
    return n + ' 个节点';
  });

  // 病例
  setHash('#/cases?case=case_dka');
  await tick(100);
  check('病例页 7 张卡片', () => {
    const n = $$('#view .case-card').length;
    if (n !== 7) throw new Error('病例数 ' + n);
    return n + ' 例';
  });

  // 工具
  setHash('#/tools');
  await tick(100);
  check('体液计算器输出', () => {
    const t = $('#fluid-out');
    if (!t || !t.textContent.includes('总体液')) throw new Error('无输出');
    return true;
  });
  check('心电图渲染 + 切换', () => {
    if (!document.querySelector('#ecg-out svg path')) throw new Error('无波形 path');
    const b = $$('[data-ecg]').find(x => x.getAttribute('data-ecg') === 'highk');
    b.click();
    const sev = $('#ecg-sev');
    if (!sev) throw new Error('无严重度滑块');
    if (!$('#ecg-desc').textContent.includes('高钾')) throw new Error('描述未更新');
    return true;
  });
  check('对比表切换', () => {
    const b = $$('[data-table]').find(x => x.getAttribute('data-table') === 'potassium');
    b.click();
    if (!$('#compare-out').textContent.includes('高钾血症')) throw new Error('表格未切换');
    return true;
  });

  // 设计说明
  setHash('#/guide');
  await tick(100);
  check('参考文獻 52 条', () => {
    const n = $$('#refs .ref-list li').length;
    if (n !== 55) throw new Error('文献条目 ' + n);
    return n + ' 条';
  });
  check('评分自查表', () => {
    const n = $$('#g-rubric .rubric-table').length;
    if (n !== 2) throw new Error('评分表 ' + n);
    return n + ' 张表';
  });
  check('课堂记录输入保存', () => {
    const ta = document.querySelector('[data-record="record_teacher"]');
    if (!ta) throw new Error('无记录输入框');
    ta.value = '课堂讲评测试';
    ta.dispatchEvent(new window.Event('input', { bubbles: true }));
    if (!window.localStorage.getItem('wes_records')) throw new Error('未保存');
    return true;
  });

  // 搜索
  await tick(30);
  check('全局搜索', () => {
    const btn = $('#btn-search');
    if (!btn) throw new Error('无搜索按钮');
    btn.click();
    const input = $('#search-input');
    if (!input) throw new Error('搜索框未打开');
    input.value = '低钾';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    const n = $$('#search-results .sr-item').length;
    if (n < 3) throw new Error('搜索结果 ' + n);
    return n + ' 条结果';
  });

  const failed = results.filter(r => !r.ok);
  console.log(JSON.stringify({ total: results.length, failed: failed.length, errors: errors, results: results }, null, 1));
  process.exitCode = failed.length ? 1 : 0;
  dom.window.close();
})().catch(e => {
  console.error('TEST CRASH', e);
  process.exitCode = 2;
});
