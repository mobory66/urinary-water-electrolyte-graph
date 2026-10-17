/* ===== 首页 / 病例 / 工具 / 设计说明 ===== */
APP.views.overview = function () {
  const s = APP.stats;
  const stageCards = STAGES.map(st => {
    const d = DISCIPLINES[st.disc];
    return '<div class="stage-card"><div class="stage-bar" style="background:' + d.color + '"></div>' +
      '<div class="stage-head" style="color:' + d.color + '">' + esc(st.title) + '</div>' +
      '<div class="stage-sub">' + esc(st.sub) + '</div>' +
      '<div class="stage-nodes">' + st.nodes.map(id => {
        const n = NODE_MAP[id]; if (!n) return '';
        return '<button type="button" class="stage-node" data-goto-node="' + esc(id) + '">' + esc(n.title) + '</button>';
      }).join('') + '</div></div>';
  }).join('');
  $('#view').innerHTML =
    '<section class="hero">' +
      '<span class="hero-kicker">泌尿整合课程 · “师—生—机”协同教改 · 2024 级基础医学班</span>' +
      '<h1>水、电解质代谢紊乱<span class="thin">知识图谱 ＋ 问题图谱 · 水 · 钠 · 钾</span></h1>' +
      '<p class="hero-desc">这是一个可交互的知识图谱与问题图谱网页：以“生理—病生—病理—药理—临床”五层结构梳理水、钠、钾代谢紊乱，' +
      '65 个知识节点、152 条关系、35 个问题、7 个病例与 55 条可溯源依据全部可在页面内检索、跳转与自测。' +
      '本页同时是“AI 辅助 + 人工审核”的作品说明页，欢迎老师与同学按评分细则审阅。</p>' +
      '<div class="hero-actions">' +
        '<button class="btn btn-primary" data-nav="knowledge">进入知识图谱 →</button>' +
        '<button class="btn btn-ghost" data-nav="problems">浏览问题图谱</button>' +
        '<button class="btn btn-ghost" data-nav="guide">查看设计说明</button>' +
      '</div>' +
      '<div class="hero-tags">' +
        '<span class="badge" style="background:#eff6ff;color:#1e40af">知识图谱 5 分</span>' +
        '<span class="badge" style="background:#f5f3ff;color:#6d28d9">问题图谱 5 分</span>' +
        '<span class="badge" style="background:#ecfdf5;color:#047857">100% 问题溯源</span>' +
        '<span class="badge" style="background:#fffbeb;color:#b45309">关键机制附文献</span>' +
        '<span class="badge" style="background:#fdf2f8;color:#be185d">7 个临床病例</span>' +
      '</div>' +
      '<div class="stat-grid">' +
        '<div class="stat-card"><div class="stat-num">' + s.nodes + '</div><div class="stat-label">知识节点</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + s.edges + '</div><div class="stat-label">知识关系</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + s.questions + '</div><div class="stat-label">问题（100% 溯源）</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + s.cases + '</div><div class="stat-label">临床病例</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + s.refs + '</div><div class="stat-label">教材/文献/指南依据</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + s.mechPct + '%</div><div class="stat-label">机制探究题占比</div></div>' +
      '</div>' +
    '</section>' +

    '<div class="overview-grid">' +
      '<div class="card card-pad">' +
        '<div class="section-title" style="font-size:16px"><span class="num">Ⅰ</span>7 个学科阶段 · 一张整合图谱</div>' +
        '<div class="section-sub">点击阶段内任一节点可进入完整图谱并查看机制链、文献依据与关联问题。</div>' +
        '<div class="stage-strip">' + stageCards + '</div>' +
      '</div>' +
      '<div class="card card-pad">' +
        '<div class="section-title" style="font-size:16px"><span class="num">Ⅱ</span>本次提交信息</div>' +
        '<dl class="info-list" style="margin-top:12px">' +
          '<dt>课程</dt><dd>' + esc(META.course) + '</dd>' +
          '<dt>项目</dt><dd>' + esc(META.program) + '</dd>' +
          '<dt>模块</dt><dd>' + esc(META.module) + '（本次提交）</dd>' +
          '<dt>作业</dt><dd>' + esc(META.assignment) + '</dd>' +
          '<dt>版本</dt><dd>' + esc(META.version) + '（' + esc(META.date) + '）</dd>' +
          '<dt>提交形式</dt><dd>本页网址链接 ＋ 简要说明（AI 工具、设计思路、使用说明、特点/优点）</dd>' +
          '<dt>署名</dt><dd class="muted" style="font-weight:400">（按评分要求不在页面展示个人信息；提交时可在作业板块填写）</dd>' +
        '</dl>' +
        '<div class="hr"></div>' +
        '<div class="panel-title"><span class="dot"></span>模块与后续更新</div>' +
        '<div class="module-cards">' +
          '<div class="module-card current"><div class="mc-tag">本次提交 · ' + esc(META.version) + '</div><h4>水、电解质代谢紊乱（水·钠·钾）</h4><p>知识图谱 + 问题图谱 + 7 病例 + 学习工具，覆盖病生 / 病理 / 药理三个专业教学活动。</p></div>' +
          '<div class="module-card"><div class="mc-tag" style="color:#94a3b8">后续模块 · 计划中</div><h4>同一网址持续更新</h4><p>后续章节（如急性肾损伤、肾小球疾病等）将加入同一网址；每次提交仅需附本页链接与本次内容的设计思路说明。</p></div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="two-col" style="margin-top:18px">' +
      '<div class="card card-pad">' +
        '<div class="section-title" style="font-size:16px"><span class="num">Ⅲ</span>推荐学习路径（8 步）</div>' +
        '<div class="section-sub">沿“正常 → 紊乱 → 机制 → 病理 → 药理 → 临床”推进，每步给出可点击的核心节点。</div>' +
        '<div class="path-list" style="margin-top:12px">' +
          LEARNING_PATH.map((p, i) => '<div class="path-item"><div class="path-num">' + (i + 1) + '</div><div>' +
            '<div class="path-title">' + esc(p.title) + '</div><div class="path-desc">' + esc(p.desc) + '</div>' +
            '<div class="path-nodes">' + p.nodes.map(id => { const n = NODE_MAP[id]; return n ? '<button type="button" class="trace-chip" data-goto-node="' + esc(id) + '">' + esc(n.title) + '</button>' : ''; }).join('') + '</div>' +
          '</div></div>').join('') +
        '</div>' +
      '</div>' +
      '<div>' +
        '<div class="card card-pad">' +
          '<div class="section-title" style="font-size:16px"><span class="num">Ⅳ</span>“师—生—机”协同</div>' +
          '<div class="coop-grid" style="margin-top:12px">' +
            '<div class="coop-card"><div class="coop-icon" style="background:#2563eb">生</div><h4>学生（本人）</h4><p>梳理知识结构、确定问题、审核 AI 内容、设计病例与工具，形成可讲评的图谱。</p></div>' +
            '<div class="coop-card"><div class="coop-icon" style="background:#7c3aed">师</div><h4>教师</h4><p>课堂点评、评选优秀、按图谱溯源节点设计考核题；本页预留“课堂使用与讲评记录”。</p></div>' +
            '<div class="coop-card"><div class="coop-icon" style="background:#d97706">机</div><h4>AI / 工具</h4><p>辅助生成初稿与网页代码、检索并核对文献元数据；所有医学结论由人复核后保留。</p></div>' +
          '</div>' +
        '</div>' +
        '<div class="card card-pad" style="margin-top:14px">' +
          '<div class="section-title" style="font-size:16px"><span class="num">Ⅴ</span>快速入口</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">' +
            [['knowledge', '知识图谱', '65 节点 · 导览/图谱/大纲'], ['problems', '问题图谱', '35 题 · 矩阵/关系/自测'], ['cases', '病例情境', '7 个病例 · 诊疗决策'], ['tools', '学习工具', '计算器 · 心电图 · 对比表'], ['guide', '设计说明', 'AI 工具 · 审核记录 · 评分自查'], ['guide#refs', '参考文献', '55 条依据 · PMID/DOI']].map(x =>
              '<button type="button" class="stage-node" style="padding:10px 12px" data-nav="' + x[0].split('#')[0] + '"' + (x[0].indexOf('#') > 0 ? ' data-anchor="' + x[0].split('#')[1] + '"' : '') + '><b>' + esc(x[1]) + '</b><span class="tiny muted" style="display:block">' + esc(x[2]) + '</span></button>'
            ).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="note-box" style="margin-top:18px">' + esc(META.disclaimer) + '</div>';
  $$('[data-goto-node]', $('#view')).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
};

/* ================= 病例 ================= */
APP.views.cases = function (params) {
  let active = null;
  if (params.case && NODE_MAP[params.case]) active = params.case;
  const cards = CASES.map((c, ci) => {
    const qs = NODE_Q[c.id] || [];
    const linked = EDGES.filter(e => e.f === c.id || e.t === c.id).map(e => (e.f === c.id ? e.t : e.f)).filter(id => NODE_MAP[id] && NODE_MAP[id].kind !== '病例');
    return '<div class="case-card" id="case-' + esc(c.id) + '"' + (active === c.id ? ' style="outline:2px solid #f9a8d4;outline-offset:2px"' : '') + '>' +
      '<div class="case-top"><div class="case-no">病例 ' + (ci + 1) + ' · 临床情境</div>' +
      '<h3>' + esc(c.title) + '</h3><div class="case-sum">' + esc(c.summary) + '</div></div>' +
      '<div class="case-body">' +
        c.points.map(p => '<div class="case-row">' + esc(p) + '</div>').join('') +
        '<div><div class="tiny muted" style="margin-bottom:4px">关联知识节点</div><div class="case-links">' + uniq(linked).slice(0, 6).map(id => nodeChip(id)).join('') + '</div></div>' +
        (qs.length ? '<div><div class="tiny muted" style="margin-bottom:4px">关联问题</div><div class="case-links">' + qs.map(id => qChip(id)).join('') + '</div></div>' : '') +
      '</div>' +
      '<div class="case-foot"><button class="btn btn-soft btn-sm" data-goto-node="' + esc(c.id) + '">在知识图谱中查看</button>' +
      '<button class="btn btn-ghost btn-sm" data-goto-case-rel="' + esc(c.id) + '">查看关联节点</button></div>' +
    '</div>';
  }).join('');
  $('#view').innerHTML =
    '<div class="section-head" style="margin-top:0"><div><div class="section-title"><span class="num">03</span>病例情境</div>' +
      '<div class="section-sub">7 个真实临床情境：从主诉、检验到处理要点，串联“病理—病生—药理”做诊疗决策；每个病例可回溯到知识节点与问题。</div></div></div>' +
    '<div class="case-grid">' + cards + '</div>' +
    '<div class="note-box" style="margin-top:16px">病例为课程教学用改写情境，检验数值与处理要点依据人卫版教材与最新指南（见“设计说明—参考文献”），不作为临床处方依据。</div>';
  $$('[data-goto-node]', $('#view')).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
  $$('[data-goto-q]', $('#view')).forEach(b => b.addEventListener('click', () => gotoQuestion(b.getAttribute('data-goto-q'))));
  $$('[data-goto-case-rel]', $('#view')).forEach(b => b.addEventListener('click', function () {
    const cid = b.getAttribute('data-goto-case-rel');
    const c = NODE_MAP[cid];
    if (!c) return;
    const linked = EDGES.filter(e => e.f === cid || e.t === cid).map(e => (e.f === cid ? e.t : e.f)).filter(id => NODE_MAP[id] && NODE_MAP[id].kind !== '病例');
    APP.state.kg.selected = linked[0] || cid;
    APP.state.kg.mode = 'graph';
    APP.state.kg.transform = null;
    navigate('knowledge', { node: APP.state.kg.selected });
  }));
  if (active) {
    const el = document.getElementById('case-' + active);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }
};

/* ================= 学习工具 ================= */
APP.state.tools = { fluid: { w: 60, sex: 'm' }, deficit: { mode: 'water', w: 60, sex: 'm', na: 155, target: 140 }, ecg: { cond: 'normal', sev: 2 }, table: 'dehydration', checks: {} };

APP.views.tools = function () {
  $('#view').innerHTML =
    '<div class="section-head" style="margin-top:0"><div><div class="section-title"><span class="num">04</span>学习工具</div>' +
      '<div class="section-sub">把“看懂图”变成“算一遍、比一比、测一测”：体液计算、缺水/缺钠估算、心电图对比、三型脱水对比、补钾与高钾急救清单。</div></div></div>' +
    '<div class="tool-grid">' +
      '<div class="tool-card" id="tool-fluid"><h3>💧 体液分布计算器</h3><div class="tool-sub">按标准成人估算体液分布（儿童、老年、水肿/脱水者不适用）。</div>' +
        '<div class="field-row"><div class="field"><label>体重（kg）</label><input class="input" id="fluid-w" type="number" min="20" max="150" value="60"></div>' +
        '<div class="field"><label>性别</label><select class="select" id="fluid-sex"><option value="m">男（TBW≈60%）</option><option value="f">女（TBW≈50%）</option></select></div></div>' +
        '<div id="fluid-out"></div></div>' +
      '<div class="tool-card" id="tool-deficit"><h3>🧮 缺水 / 缺钠量估算器</h3><div class="tool-sub">用于理解补液计算思路；实际补液需分次、动态监测（教学演示，不构成处方）。</div>' +
        '<div class="tab-row"><button class="chip on" data-defmode="water">缺水估算（高钠）</button><button class="chip" data-defmode="na">缺钠估算（低钠）</button></div>' +
        '<div class="field-row"><div class="field"><label>体重（kg）</label><input class="input" id="def-w" type="number" min="20" max="150" value="60"></div>' +
        '<div class="field"><label>性别</label><select class="select" id="def-sex"><option value="m">男（0.6）</option><option value="f">女（0.5）</option></select></div>' +
        '<div class="field"><label>实测血钠（mmol/L）</label><input class="input" id="def-na" type="number" min="90" max="200" value="155"></div></div>' +
        '<div id="def-out"></div></div>' +
      '<div class="tool-card" id="tool-ecg" style="grid-column:1/-1"><h3>📈 低钾 / 高钾心电图交互对比</h3><div class="tool-sub">选择状态并拖动"高钾严重度"滑块，观察 T 波→P 波→QRS→正弦波的演变；波形为教学示意，不是真实患者记录。</div>' +
        '<div class="ecg-controls">' +
          '<button class="chip on" data-ecg="normal">正常心电图</button><button class="chip" data-ecg="lowk">低钾血症</button><button class="chip" data-ecg="highk">高钾血症</button>' +
          '<span style="flex:1"></span><span class="tiny muted">高钾严重度</span><input type="range" id="ecg-sev" min="1" max="4" step="1" value="2" style="width:180px">' +
        '</div>' +
        '<div class="ecg-wrap" id="ecg-out"></div><div class="ecg-desc" id="ecg-desc"></div></div>' +
      '<div class="tool-card" id="tool-compare" style="grid-column:1/-1"><h3>📊 对比速查表</h3><div class="tool-sub">期末复习高频对比：三型脱水、低钾与高钾、利尿药的电解质影响。</div>' +
        '<div class="tab-row"><button class="chip on" data-table="dehydration">三型脱水</button><button class="chip" data-table="potassium">低钾 vs 高钾</button><button class="chip" data-table="diuretic">利尿药与电解质</button></div>' +
        '<div id="compare-out"></div></div>' +
      '<div class="tool-card"><h3>✅ 静脉补钾原则清单</h3><div class="tool-sub">点击勾选，自查是否记全。</div><div id="check-k"></div></div>' +
      '<div class="tool-card"><h3>🚨 高钾血症急救流程清单</h3><div class="tool-sub">按“停诱因→稳膜→促内移→促排出→透析”顺序记忆。</div><div id="check-hk"></div></div>' +
    '</div>';
  setupFluidTool(); setupDeficitTool(); setupEcgTool(); setupCompareTool(); setupChecklists();
  $$('[data-goto-node]', $('#view')).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
};

function setupFluidTool() {
  const w = $('#fluid-w'), sex = $('#fluid-sex'), out = $('#fluid-out');
  sex.value = APP.state.tools.fluid.sex;
  function draw() {
    const kg = clamp(Number(w.value) || 60, 20, 150);
    const s = sex.value;
    APP.state.tools.fluid = { w: kg, sex: s };
    const tbw = (s === 'm' ? 0.6 : 0.5) * kg;
    const icf = (s === 'm' ? 0.4 : 0.3) * kg;
    const ecf = 0.2 * kg;
    const isf = 0.15 * kg, pv = 0.05 * kg;
    const rows = [['总体液（TBW）', tbw, '#1d4ed8'], ['细胞内液（ICF，40%/30%）', icf, '#7c3aed'], ['细胞外液（ECF，20%）', ecf, '#0891b2'], ['组织间液（ISF，15%）', isf, '#0d9488'], ['血浆（PV，5%）', pv, '#db2777']];
    out.innerHTML = '<div class="stack-bar">' +
      '<div class="stack-seg" style="width:' + (icf / tbw * 100) + '%;background:#7c3aed">ICF ' + icf.toFixed(1) + ' L</div>' +
      '<div class="stack-seg" style="width:' + (isf / tbw * 100) + '%;background:#0d9488">ISF ' + isf.toFixed(1) + ' L</div>' +
      '<div class="stack-seg" style="width:' + (pv / tbw * 100) + '%;background:#db2777">PV ' + pv.toFixed(1) + ' L</div></div>' +
      '<table class="fluid-table"><thead><tr><th>成分</th><th>占体重</th><th>估计容量</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + r[0] + '</td><td>' + (r[1] / kg * 100).toFixed(0) + '%</td><td class="num">' + r[1].toFixed(1) + ' L</td></tr>').join('') +
      '</tbody></table><div class="tiny muted" style="margin-top:8px">估算式：男性 TBW=0.6×体重、女性 0.5×体重；ECF 约 20%、组织间液 15%、血浆 5%。新生儿/婴儿体液比例更高，肥胖、老年、水肿者需个体化。</div>';
  }
  w.addEventListener('input', draw); sex.addEventListener('change', draw); draw();
}

function setupDeficitTool() {
  const w = $('#def-w'), sex = $('#def-sex'), na = $('#def-na'), out = $('#def-out');
  let mode = APP.state.tools.deficit.mode;
  function setMode(m) {
    mode = m;
    $$('[data-defmode]').forEach(b => b.classList.toggle('on', b.getAttribute('data-defmode') === m));
    w.parentElement.style.display = ''; // keep
    draw();
  }
  function draw() {
    const kg = clamp(Number(w.value) || 60, 20, 150);
    const s = sex.value;
    const naVal = Number(na.value) || (mode === 'water' ? 155 : 128);
    const tbw = (s === 'm' ? 0.6 : 0.5) * kg;
    let html = '';
    if (mode === 'water') {
      const def = tbw * (Math.max(naVal, 140) / 140 - 1);
      html = '<div class="calc-out">按血钠 <b>' + naVal + '</b> mmol/L、体重 <b>' + kg + '</b> kg、TBW≈<b>' + tbw.toFixed(1) + ' L</b> 估算：' +
        '<div style="margin-top:6px;font-size:15px">水缺乏量 ≈ <b>' + Math.max(0, def).toFixed(2) + ' L</b></div>' +
        '<div class="tiny muted" style="margin-top:6px">公式：水缺乏 ≈ TBW×(实测 Na/140 − 1)。实际补液还需加上每日生理需要量（约 1500～2000 ml）与继续丢失量；慢性高钠纠正速度≤0.5 mmol/L/h，避免脑水肿。</div></div>';
    } else {
      const target = 140;
      const def = tbw * (target - Math.min(naVal, 135));
      const nacl09 = def / 154;
      const nacl3 = def / 513;
      html = '<div class="calc-out">按血钠 <b>' + naVal + '</b> mmol/L（目标 ' + target + ' mmol/L）、体重 <b>' + kg + '</b> kg 估算：' +
        '<div style="margin-top:6px;font-size:15px">钠缺失量 ≈ <b>' + Math.max(0, def).toFixed(0) + ' mmol</b></div>' +
        '<div style="margin-top:6px">≈ 0.9% NaCl <b>' + Math.max(0, nacl09).toFixed(2) + ' L</b>（154 mmol/L）或 3% NaCl <b>' + Math.max(0, nacl3).toFixed(2) + ' L</b>（513 mmol/L）</div>' +
        '<div class="tiny muted" style="margin-top:6px">公式：钠缺失 ≈ TBW×(目标 Na−实测 Na)，TBW=体重×0.6（男）/0.5（女）。实际纠正需分次：24 h 内血钠升高≤8～10 mmol/L（慢性），急性症状性低钠先用 3% 高渗盐水小剂量冲击，防渗透性脱髓鞘。</div></div>';
    }
    out.innerHTML = html;
  }
  $$('[data-defmode]').forEach(b => b.addEventListener('click', () => setMode(b.getAttribute('data-defmode'))));
  w.addEventListener('input', draw); sex.addEventListener('change', draw); na.addEventListener('input', draw);
  setMode(mode);
}

/* 心电图：教学示意波形 */
function ecgSVG(cond, sev) {
  const W = 880, H = 300, baseline = 210, mV = 46, interval = 180, start = 52;
  const params = cond === 'normal'
    ? { p: .13, r: 1.0, t: .28, tSig: 17, st: 0, u: 0, qrsSig: 4.2, sine: false }
    : cond === 'lowk'
      ? { p: .11, r: .95, t: .06, tSig: 20, st: -.07, u: .20, qrsSig: 4.5, sine: false }
      : (function () {
        const sv = clamp(sev, 1, 4);
        if (sv === 4) return { p: 0, r: .55, t: .55, tSig: 12, st: 0, u: 0, qrsSig: 9, sine: true };
        if (sv === 3) return { p: .02, r: .72, t: .72, tSig: 9, st: .02, u: 0, qrsSig: 7, sine: false };
        if (sv === 2) return { p: .05, r: .85, t: .72, tSig: 8, st: 0, u: 0, qrsSig: 5.5, sine: false };
        return { p: .08, r: .95, t: .62, tSig: 7.5, st: 0, u: 0, qrsSig: 5, sine: false };
      })();
  function gauss(x, mu, sig, amp) { const d = (x - mu) / sig; return amp * Math.exp(-0.5 * d * d); }
  function signalAt(x) {
    const phase = ((x - start) % interval + interval) % interval;
    if (params.sine) return .52 * Math.sin((x - start) / 20) * (0.75 + 0.25 * Math.sin((x - start) / 63));
    let y = 0;
    y += gauss(phase, 34, 8, params.p);
    y += gauss(phase, 80, 2.6, -0.12);
    y += gauss(phase, 88, params.qrsSig, params.r);
    y += gauss(phase, 97, 2.8, -0.28);
    if (phase > 100 && phase < 126) y += params.st * Math.exp(-Math.pow((phase - 113) / 12, 2));
    y += gauss(phase, 146, params.tSig, params.t);
    if (params.u) y += gauss(phase, 170, 11, params.u);
    return y;
  }
  let d = '';
  for (let x = 24; x <= W - 12; x += 1.6) {
    const y = baseline - signalAt(x) * mV;
    d += (d ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }
  let grid = '';
  for (let x = 20; x < W - 10; x += 8) grid += '<line x1="' + x + '" y1="8" x2="' + x + '" y2="' + (H - 18) + '" stroke="' + (x % 40 === 20 ? '#f3b8c4' : '#fbe3e8') + '" stroke-width="' + (x % 40 === 20 ? 1 : .6) + '"/>';
  for (let y = 8; y < H - 10; y += 8) grid += '<line x1="20" y1="' + y + '" x2="' + (W - 10) + '" y2="' + y + '" stroke="' + (y % 40 === 8 ? '#f3b8c4' : '#fbe3e8') + '" stroke-width="' + (y % 40 === 8 ? 1 : .6) + '"/>';
  const cal = '<path d="M24,' + (baseline) + ' L24,' + (baseline - 1 * mV) + ' L30,' + (baseline - 1 * mV) + ' L30,' + baseline + '" fill="none" stroke="#64748b" stroke-width="1.4"/>' +
    '<text x="34" y="' + (baseline - 8) + '" font-size="10" fill="#94a3b8">1 mV</text>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="background:#fff">' + grid + cal +
    '<text x="' + (W - 14) + '" y="26" text-anchor="end" font-size="11" fill="#94a3b8">教学示意图 · 非真实心电图</text>' +
    '<line x1="20" y1="' + baseline + '" x2="' + (W - 10) + '" y2="' + baseline + '" stroke="#cbd5e1" stroke-width=".7" stroke-dasharray="4 4"/>' +
    '<path d="' + d + '" fill="none" stroke="#111827" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
    '</svg>';
}

function setupEcgTool() {
  const out = $('#ecg-out'), desc = $('#ecg-desc'), sev = $('#ecg-sev');
  function draw() {
    const st = APP.state.tools.ecg;
    sev.disabled = st.cond !== 'highk';
    out.innerHTML = ecgSVG(st.cond, st.sev);
    if (st.cond === 'normal') desc.innerHTML = '<b>正常心电图：</b>P 波 → QRS 波群 → T 波顺序出现，T 波方向与 QRS 主波一致，无 U 波。';
    else if (st.cond === 'lowk') desc.innerHTML = '<b>低钾血症：</b>T 波低平、ST 段压低、U 波明显（可高于 T 波）、QT(U) 延长；严重者室性心律失常。U 波是特征性线索。';
    else {
      const txt = ['', '<b>高钾（轻度）：</b>T 波高尖、对称、基底变窄（"帐篷 T"），是早期表现。',
        '<b>高钾（中度）：</b>T 波持续高尖，P 波振幅降低、PR 延长。',
        '<b>高钾（重度）：</b>P 波低平/消失、QRS 增宽、传导阻滞。',
        '<b>高钾（极重度）：</b>QRS 与 T 波融合成"正弦波"，室颤/心脏骤停风险极高。'][st.sev];
      desc.innerHTML = txt;
    }
    $$('[data-ecg]').forEach(b => b.classList.toggle('on', b.getAttribute('data-ecg') === st.cond));
  }
  $$('[data-ecg]').forEach(b => b.addEventListener('click', function () {
    APP.state.tools.ecg.cond = b.getAttribute('data-ecg');
    draw();
  }));
  sev.addEventListener('input', function () { APP.state.tools.ecg.sev = Number(sev.value); draw(); });
  sev.value = APP.state.tools.ecg.sev;
  draw();
}

/* 对比表 */
function setupCompareTool() {
  const out = $('#compare-out');
  const tables = {
    dehydration: {
      cols: ['高渗性脱水', '低渗性脱水', '等渗性脱水'],
      rows: [
        ['水钠丢失比例', '失水>失钠', '失钠>失水', '水钠等比例'],
        ['血浆渗透压', '↑（>310）', '↓（<280）', '正常'],
        ['主要缺失', '细胞内液↓ + 细胞外液↓', '细胞外液↓↓，细胞内液↑', '细胞外液↓'],
        ['口渴', '明显', '早期无', '有'],
        ['尿量/尿比重', '少尿、比重↑', '早期多尿、低渗尿；后期少尿', '少尿、比重↑'],
        ['尿钠', '↑或正常', '↓（肾性原因除外）', '↓'],
        ['主要危险', '脑细胞脱水、脱水热', '休克、脑水肿', '休克；可转为高渗/低渗'],
        ['补液选择', '补水为主（5% 葡萄糖）', '等渗/高渗盐水', '平衡盐/生理盐水']
      ]
    },
    potassium: {
      cols: ['低钾血症', '高钾血症'],
      rows: [
        ['血钾', '<3.5 mmol/L', '>5.5 mmol/L'],
        ['神经肌肉', '超极化阻滞 → 肌无力、肠麻痹', '轻度兴奋↑、重度去极化阻滞 → 肌无力'],
        ['心肌兴奋性', '↑', '先↑后↓'],
        ['传导性/自律性', '传导↓、自律性↑', '传导↓、自律性↓'],
        ['心电图', 'T 波低平、U 波、ST 压低、QT 延长', 'T 波高尖→P 波消失→QRS 增宽→正弦波'],
        ['酸碱平衡', '代谢性碱中毒（反常性酸性尿）', '代谢性酸中毒（反常性碱性尿）'],
        ['治疗要点', '口服/静脉补钾（见尿补钾、浓度<0.3%、速度<20 mmol/h）', '钙剂稳膜→促内移→促排出→透析；停诱因']
      ]
    },
    diuretic: {
      cols: ['袢利尿药（呋塞米）', '噻嗪类', '保钾利尿药', '甘露醇', '托伐普坦'],
      rows: [
        ['作用靶点', '髓袢升支粗段 NKCC2', '远曲小管 NCC', '醛固酮受体 / ENaC', '肾小管液渗透压', '集合管 V2 受体'],
        ['电解影响', '低钾、低钠、低氯性碱中毒', '低钾、低钠、高钙', '高钾', '高钠/高渗性脱水、低钾', '高钠（排水）'],
        ['主要风险', '低血容量、耳毒性、高尿酸', '低钠（老年）、高尿酸、高血糖', '高钾（联用 ACEI/ARB、CKD）', '反跳、渗透性肾病', '纠正过快致 ODS'],
        ['监测', '血钾、血钠、肌酐、尿量', '血钠、血钾、尿酸、血糖', '血钾、肌酐', '血钠、渗透压、肾功能', '血钠（每 6～8 h）']
      ]
    }
  };
  function draw() {
    const key = APP.state.tools.table;
    const t = tables[key];
    out.innerHTML = '<div style="overflow-x:auto"><table class="compare-table"><thead><tr><th></th>' + t.cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
      t.rows.map(r => '<tr><td>' + esc(r[0]) + '</td>' + r.slice(1).map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div>';
    $$('[data-table]').forEach(b => b.classList.toggle('on', b.getAttribute('data-table') === key));
  }
  $$('[data-table]').forEach(b => b.addEventListener('click', function () { APP.state.tools.table = b.getAttribute('data-table'); draw(); }));
  draw();
}

/* 清单 */
function setupChecklists() {
  const kItems = ['见尿补钾（尿量>30～40 ml/h 或>500 ml/d）', '浓度不宜过高（<0.3%，约 40 mmol/L）', '速度不宜过快（<20 mmol/h）', '每日总量不宜过多（一般≤6 g KCl）', '严禁静脉推注', '同时纠正碱中毒与低镁血症', '优先口服补钾（氯化钾/枸橼酸钾）', '监测血钾、心电图、尿量与肾功能'];
  const hkItems = ['停用保钾药物、含钾食物/液体，去除诱因', '10% 葡萄糖酸钙缓慢静注（心电监护，稳定心肌膜）', '胰岛素＋葡萄糖促钾内移（监测血糖）', '沙丁胺醇雾化（辅助促内移）', '5% 碳酸氢钠（仅合并代谢性酸中毒时）', '呋塞米促钾排出（肾功能允许）', '阳离子交换树脂/环硅酸锆钠/帕替罗默', '血液透析（最有效，肾衰/难治性高钾）', '复查血钾、心电图，处理病因'];
  function render(host, items, key) {
    host.innerHTML = '<div class="checklist">' + items.map((t, i) => '<label class="check-item' + (APP.state.tools.checks[key + i] ? ' checked' : '') + '"><input type="checkbox" data-check="' + key + i + '" ' + (APP.state.tools.checks[key + i] ? 'checked' : '') + '><span>' + esc(t) + '</span></label>').join('') + '</div>';
    $$('input[data-check]', host).forEach(cb => cb.addEventListener('change', function () {
      const id = cb.getAttribute('data-check');
      APP.state.tools.checks[id] = cb.checked;
      cb.parentElement.classList.toggle('checked', cb.checked);
    }));
  }
  render($('#check-k'), kItems, 'k');
  render($('#check-hk'), hkItems, 'hk');
}

/* ================= 设计说明 ================= */
APP.views.guide = function () {
  const refGroups = { 教材: [], 文献: [], 指南: [], 共识: [] };
  REF_KEYS.forEach(k => { const r = REFS[k]; (refGroups[r.type] = refGroups[r.type] || []).push({ k: k, r: r }); });
  const refsHTML = Object.keys(refGroups).map(g => {
    const arr = refGroups[g]; if (!arr.length) return '';
    return '<div class="ref-group"><h3>' + g + '（' + arr.length + '）</h3><ol class="ref-list">' + arr.map(x =>
      '<li><span style="color:#94a3b8;font-family:var(--mono);font-size:11px">[' + esc(x.k) + ']</span> ' + esc(x.r.cite) + refLinksHTML(x.r) + '</li>'
    ).join('') + '</ol></div>';
  }).join('');
  const rubricTable = (data) => '<table class="rubric-table"><thead><tr><th style="width:150px">评分维度</th><th style="width:64px">权重</th><th>本作品对应</th></tr></thead><tbody>' +
    data.items.map(it => '<tr><td><b>' + esc(it.dim) + '</b></td><td style="font-family:var(--mono)">' + it.w + ' 分</td><td>' + esc(it.self) + (it.note ? '<div class="tiny muted" style="margin-top:3px">' + esc(it.note) + '</div>' : '') + '</td></tr>').join('') +
    '</tbody><tfoot><tr><td>合计</td><td>' + data.total + ' 分</td><td>按基础医学班微调口径（权重再分配，两图各 5 分不变）</td></tr></tfoot></table>';
  const recordRows = [
    ['展示/使用时间', 'record_time'],
    ['使用环节', 'record_stage'],
    ['教师点评', 'record_teacher'],
    ['同学反馈 / 投票', 'record_peer'],
    ['后续修改', 'record_revise']
  ];
  $('#view').innerHTML =
    '<div class="section-head" style="margin-top:0"><div><div class="section-title"><span class="num">05</span>设计说明</div>' +
      '<div class="section-sub">提交说明的完整版：AI 工具、设计思路、使用说明、特点与优点、审核与纠错记录、评分自查、参考文献、课堂使用记录。</div></div></div>' +
    '<div class="guide-layout">' +
      '<nav class="guide-nav" id="guide-nav">' +
        '<button data-guide-go="g-submit">提交信息</button><button data-guide-go="g-ai">AI 工具使用说明</button>' +
        '<button data-guide-go="g-design">设计思路</button><button data-guide-go="g-usage">使用说明</button>' +
        '<button data-guide-go="g-feature">特点与优点</button><button data-guide-go="g-audit">审核与纠错记录</button>' +
        '<button data-guide-go="g-rubric">评分自查</button><button data-guide-go="refs">参考文献</button>' +
        '<button data-guide-go="record">课堂使用与讲评记录</button><button data-guide-go="g-version">版本与更新</button>' +
      '</nav>' +
      '<div>' +
        '<section class="guide-section" id="g-submit"><h2>提交信息</h2><div class="sec-sub">本页即提交网址；以下为提交时需附的简要说明（可直接复制）。</div>' +
          '<table class="record-table"><tbody>' +
            '<tr><th>课程 / 项目</th><td>' + esc(META.course) + ' · ' + esc(META.program) + '</td></tr>' +
            '<tr><th>本次模块</th><td><b>' + esc(META.module) + '</b>（水、钠、钾；病生 / 病理 / 药理三专业教学活动）</td></tr>' +
            '<tr><th>作品形式</th><td>交互式知识图谱 + 问题图谱网页（单文件，无商业图谱平台依赖）</td></tr>' +
            '<tr><th>版本 / 日期</th><td>' + esc(META.version) + ' · ' + esc(META.date) + '</td></tr>' +
            '<tr><th>一句话说明</th><td>本作品用“生理—病生—病理—药理—临床”五层结构整合水电解质紊乱知识图谱（65 节点/152 关系），并设计 35 个 100% 溯源知识节点的问题图谱（三级问题、四类问题、机制探究占 ' + APP.stats.mechPct + '%），附 7 个临床病例与交互学习工具；AI 仅用于生成初稿与网页代码，医学内容逐条对照教材、指南与 PubMed 文献人工核对。</td></tr>' +
          '</tbody></table>' +
          '<div class="note-box" style="margin-top:12px"><b>提交提示：</b>把本页网址粘贴到作业板块即可；同一网址后续会更新其他模块，每次提交只需复制链接并说明本次内容。若需展示课堂使用记录，可在下方补充。</div>' +
        '</section>' +
        '<section class="guide-section" id="g-ai"><h2>AI 工具使用说明</h2><div class="sec-sub">对应作业要求：说明所用 AI 工具、设计思路、使用说明、特点/优点，并体现“审核后再提交”。</div>' +
          '<p>' + esc(GUIDE.ai.intro) + '</p>' +
          '<h3>所用工具与分工</h3><dl class="tool-role">' + GUIDE.ai.tools.map(t => '<dt>' + esc(t.name) + '</dt><dd>' + esc(t.role) + '</dd>').join('') + '</dl>' +
          '<h3>人机分工</h3><ul>' + GUIDE.ai.division.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
          '<h3>工作流程</h3><ol>' + GUIDE.ai.workflow.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' +
          '<h3>审核方法（防幻觉）</h3><ul>' +
            '<li><b>教材为纲：</b>以人卫版《病理生理学》第 10 版、《病理学》第 10 版、《药理学》第 10 版、《生理学》第 10 版、《内科学》第 10 版核对概念与机制。</li>' +
            '<li><b>文献机检：</b>期刊文献的作者、期刊、年份、卷期、页码、DOI/PMID 均通过 NCBI E-utilities 逐条查询核对（' + APP.stats.journalOnly + ' 条），无法核实的引用一律删除。</li>' +
            '<li><b>指南更新：</b>高钾急救、低钠纠正、DKA 补钾等参考最新指南/共识（UK Kidney Association 2026 更新、ADA 2024 共识等），并标注与教材的差异。</li>' +
            '<li><b>错误公开：</b>将 AI 初稿中的典型错误与修正过程整理为“审核与纠错记录”（见下）。</li>' +
            '<li><b>自动校验：</b>用脚本检查节点唯一性、边端点存在性、问题 100% 溯源、机制题占比、关键节点文献齐全等指标。</li>' +
          '</ul>' +
        '</section>' +
        '<section class="guide-section" id="g-design"><h2>设计思路</h2><div class="sec-sub">回答“为什么这样组织图谱与问题”。</div>' +
          GUIDE.design.map(d => '<h3>' + esc(d.title) + '</h3><p>' + esc(d.text) + '</p>').join('') +
        '</section>' +
        '<section class="guide-section" id="g-usage"><h2>使用说明</h2><div class="sec-sub">老师与同学可以这样使用本页。</div>' +
          GUIDE.usage.map(d => '<h3>' + esc(d.title) + '</h3><p>' + esc(d.text) + '</p>').join('') +
          '<h3>快捷操作</h3><ul><li>按 <code>/</code> 打开全局搜索，<code>Esc</code> 关闭；</li><li>知识图谱中双击节点可将其居中；</li><li>问题图谱中开启“自测模式”后先自答，再点“显示解析”，最后标记“已掌握/待复习”。</li></ul>' +
        '</section>' +
        '<section class="guide-section" id="g-feature"><h2>特点与优点</h2><div class="sec-sub">对应教师评分的“知识专业性、知识点链接、工具互动性、问题是否反映真实思考”。</div>' +
          '<div class="feature-grid">' + GUIDE.features.map(f => '<div class="feature-card"><h4>' + esc(f.title) + '</h4><p>' + esc(f.text) + '</p></div>').join('') + '</div>' +
        '</section>' +
        '<section class="guide-section" id="g-audit"><h2>审核与纠错记录</h2><div class="sec-sub">AI 容易产生幻觉；以下为 AI 初稿中的典型问题与人工修正（可对照教材/指南核实）。</div>' +
          '<div style="overflow-x:auto"><table class="correction-table"><thead><tr><th style="width:120px">知识点</th><th style="width:200px">AI 初稿（错误）</th><th>人工修正</th><th style="width:200px">依据</th></tr></thead><tbody>' +
          GUIDE.corrections.map(c => '<tr><td><b>' + esc(c.item) + '</b></td><td class="wrong">' + esc(c.ai) + '</td><td class="fixed">' + esc(c.fixed) + '</td><td class="tiny muted">' + esc(c.basis) + '</td></tr>').join('') +
          '</tbody></table></div>' +
          '<div class="note-box" style="margin-top:12px">以上为节选。全部内容均按"教材 + 指南 + 已核对文献"三源核对，未查到可靠出处的表述已删除或改为教材表述。</div>' +
        '</section>' +
        '<section class="guide-section" id="g-rubric"><h2>评分自查（基础医学班口径）</h2><div class="sec-sub">对照《学生“知识图谱”与“问题图谱”教师评分细则》逐项自查；基础医学班按微调规则再分配权重。</div>' +
          '<h3>知识图谱（5 分）</h3>' + rubricTable(RUBRIC.kg) +
          '<div class="note-box" style="margin-top:10px">基础医学班微调：将“学科深度与拓展”由 1.0 调为 1.5（逻辑组织与可视化的 0.5 划入），并要求关键机制节点附文献链接——本作品 ' + APP.stats.keyNodesWithLit + ' / ' + APP.stats.keyNodes + ' 个关键机制节点均附文献链接。</div>' +
          '<h3 style="margin-top:18px">问题图谱（5 分）</h3>' + rubricTable(RUBRIC.qg) +
          '<h3 style="margin-top:18px">两条红线自查</h3>' +
          RUBRIC.redlines.map(r => '<div class="redline' + (r.status === '已规避' ? '' : ' pending') + '"><div><b>' + esc(r.line) + '</b><div class="tiny muted" style="margin-top:2px">' + esc(r.detail) + '</div></div><span class="badge ' + (r.status === '已规避' ? '" style="background:#dcfce7;color:#166534"' : '" style="background:#fef3c7;color:#92400e"') + '>' + esc(r.status) + '</span></div>').join('') +
        '</section>' +
        '<section class="guide-section" id="refs"><h2>参考文献</h2><div class="sec-sub">共 ' + APP.stats.refs + ' 条依据：教材 ' + APP.stats.textbook + ' 部、期刊文献 ' + APP.stats.journalOnly + ' 篇（PMID/DOI 经 NCBI 接口核对）、指南/共识/WHO 文件 ' + APP.stats.guideline + ' 份。点击可跳转核对。</div>' + refsHTML + '</section>' +
        '<section class="guide-section" id="record"><h2>课堂使用与讲评记录</h2><div class="sec-sub">对应红线②：图谱需进入教学环节。课堂展示/讲评后在此补充记录（内容仅保存在本机浏览器，可复制贴回页面说明）。</div>' +
          '<table class="record-table"><tbody>' + recordRows.map(r => '<tr><th>' + r[0] + '</th><td><textarea class="record-input" data-record="' + r[1] + '" rows="2" placeholder="待课堂讲评后补充…">' + esc(APP.state.records[r[1]] || '') + '</textarea></td></tr>').join('') + '</tbody></table>' +
          '<div class="tiny muted" style="margin-top:10px">建议课堂使用方式：①课堂投屏展示知识图谱导览与问题图谱；②教师按"溯源节点"选题讲评；③同学投票选出最优节点/问题；④根据意见修订并记录版本。</div>' +
        '</section>' +
        '<section class="guide-section" id="g-version"><h2>版本与更新</h2><div class="sec-sub">同一网址持续更新，每次提交只需附链接与本次说明。</div>' +
          GUIDE.versions.map(v => '<div class="version-line"><b>' + esc(v.v) + '</b><span class="muted">' + esc(v.date) + '</span><span>' + esc(v.note) + '</span></div>').join('') +
          '<div class="warn-box" style="margin-top:14px">' + esc(META.disclaimer) + '</div>' +
        '</section>' +
      '</div>' +
    '</div>';
  $$('[data-guide-go]').forEach(b => b.addEventListener('click', function () {
    const el = document.getElementById(b.getAttribute('data-guide-go'));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $$('[data-record]').forEach(t => t.addEventListener('input', function () {
    APP.state.records[t.getAttribute('data-record')] = t.value;
    store.set('records', APP.state.records);
  }));
  $$('[data-goto-node]', $('#view')).forEach(b => b.addEventListener('click', () => gotoNode(b.getAttribute('data-goto-node'))));
  $$('[data-goto-q]', $('#view')).forEach(b => b.addEventListener('click', () => gotoQuestion(b.getAttribute('data-goto-q'))));
  if (APP.pendingAnchor) { /* handled by router */ }
};
