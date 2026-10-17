#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建单文件网页：拼接数据与前端代码 → 校验数据 → 输出 dist/index.html。

说明：DSH 沙箱下不能用管道捕获子进程输出，因此把 node 的输出重定向到文件后再读取。
"""
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
BUILD = os.path.join(ROOT, '_build')
NODE_EXE = r'C:\Program Files\nodejs\node.exe'

DATA_FILES = ['data-refs.js', 'data-nodes.js', 'data-edges.js', 'data-questions.js', 'data-meta.js']
APP_FILES = ['app-core.js', 'app-knowledge.js', 'app-problems.js', 'app-pages.js', 'app-init.js']


def read(name, base=SRC):
    with open(os.path.join(base, name), encoding='utf-8') as f:
        return f.read()


def run_to_file(args, out_path):
    with open(out_path, 'w', encoding='utf-8') as fo:
        proc = subprocess.run(args, stdout=fo, stderr=subprocess.STDOUT)
    return proc.returncode


def main():
    os.makedirs(DIST, exist_ok=True)
    os.makedirs(BUILD, exist_ok=True)
    data_js = '\n'.join(read(n) for n in DATA_FILES)
    app_js = '\n'.join(read(n) for n in APP_FILES)
    css = read('style.css')
    template = read('index.template.html')
    validator = read(os.path.join('..', '_tools', 'validator.js')) if False else read('validator.js', os.path.join(ROOT, '_tools'))

    # 1) 数据校验（node 输出重定向到文件）
    validate_js = '(function(){"use strict";\n' + data_js + '\n' + validator + '\n})();\n'
    vpath = os.path.join(BUILD, 'validate.js')
    vout = os.path.join(BUILD, 'validate_out.txt')
    with open(vpath, 'w', encoding='utf-8') as f:
        f.write(validate_js)
    rc = run_to_file([NODE_EXE, vpath], vout)
    report = read('validate_out.txt', BUILD)
    print(report.strip())
    if rc != 0:
        print('DATA VALIDATION FAILED (node exit ' + str(rc) + ')', file=sys.stderr)
        sys.exit(1)
    stats = json.loads(report[report.index('{'):report.rindex('}') + 1])
    with open(os.path.join(BUILD, 'stats.json'), 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=1)

    # 2) 拼装 JS 并语法检查
    js = '(function(){"use strict";\n' + data_js + '\n' + app_js + '\n})();\n'
    bund_path = os.path.join(BUILD, 'bundle.js')
    with open(bund_path, 'w', encoding='utf-8') as f:
        f.write(js)
    chk_out = os.path.join(BUILD, 'check_out.txt')
    rc2 = run_to_file([NODE_EXE, '--check', bund_path], chk_out)
    if rc2 != 0:
        print('JS SYNTAX ERROR', file=sys.stderr)
        print(read('check_out.txt', BUILD), file=sys.stderr)
        sys.exit(1)

    # 3) 生成 HTML
    html = template.replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
    out_path = os.path.join(DIST, 'index.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = round(os.path.getsize(out_path) / 1024, 1)
    print('BUILT', out_path, size_kb, 'KB')
    print('STATS', json.dumps(stats['stats'], ensure_ascii=False))

    # 4) 文案数字一致性提示
    s = stats['stats']
    checks = [
        (r'(\d+)\s*个知识节点', s['nodes'], '知识节点'),
        (r'(\d+)\s*条关系', s['edges'], '知识关系'),
        (r'(\d+)\s*个问题', s['questions'], '问题'),
        (r'(\d+)\s*个病例', s['cases'], '病例'),
        (r'(\d+)\s*条依据', s['refs'], '依据'),
    ]
    for pat, expected, label in checks:
        found = sorted(set(int(x) for x in re.findall(pat, html)))
        bad = [x for x in found if x != expected]
        if bad:
            print('HINT: 文案中“' + label + '”出现 ' + str(bad) + '，实际为 ' + str(expected) + '，请检查是否需要更新文案')

    # 5) 复制根目录入口文件（GitHub Pages 用 index.html；另存一份中文名便于本地打开）
    shutil.copyfile(out_path, os.path.join(ROOT, '水电解质紊乱_知识图谱与问题图谱.html'))
    shutil.copyfile(out_path, os.path.join(ROOT, 'index.html'))
    nojekyll = os.path.join(ROOT, '.nojekyll')
    if not os.path.exists(nojekyll):
        with open(nojekyll, 'w', encoding='utf-8') as f:
            f.write('')
    print('COPIED root html (index.html + 中文名)')


if __name__ == '__main__':
    main()
