#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
自动提交并推送到 GitHub（带网络重试与自动 rebase）。

用法：
    python git-push.py                # 默认提交信息 "auto update"
    python git-push.py "更新说明"      # 自定义提交信息
说明：
    - 若工作区有改动，会自动 git add -A 并提交
    - push 时若远端领先（non-fast-forward），自动 git pull --rebase 后重试
    - 网络不通/超时则自动重试 MAX_ATTEMPTS 次
"""
import os
import subprocess
import sys
import time

GIT = "git"
DEFAULT_MSG = "auto update"
MAX_ATTEMPTS = 6
REBASE_ATTEMPTS = 4
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def run(cmd, capture=True):
    kwargs = {"cwd": BASE_DIR}
    if capture:
        kwargs.update({"capture_output": True, "text": True})
    return subprocess.run(cmd, **kwargs)


def main():
    commit_msg = sys.argv[1].strip() if len(sys.argv) > 1 and sys.argv[1].strip() else DEFAULT_MSG

    # 1) 提交当前改动（如有）
    status = run([GIT, "status", "--porcelain"])
    print("== working tree ==")
    print(status.stdout.strip() or "(clean)")
    if status.stdout.strip():
        run([GIT, "add", "-A"])
        c = run([GIT, "commit", "-m", commit_msg])
        if c.returncode != 0:
            print("[commit] not committed:", (c.stderr or "").strip())

    # 2) 带重试地 push
    rebase_done = False
    for attempt in range(1, MAX_ATTEMPTS + 1):
        print(f"== push attempt {attempt}/{MAX_ATTEMPTS} ==")
        p = run([GIT, "push", "origin", "main"])
        if p.returncode == 0:
            print("OK: 已成功推送到 GitHub")
            return 0

        err = (p.stderr + p.stdout).lower()
        if not rebase_done and ("rejected" in err or "fetch first" in err):
            print("远端领先，先 pull --rebase")
            for _ in range(REBASE_ATTEMPTS):
                rb = run([GIT, "pull", "--rebase", "origin", "main"])
                if rb.returncode == 0:
                    rebase_done = True
                    break
                print("rebase 失败，稍后重试...")
                time.sleep(4)
        time.sleep(4)

    print("FAILED: 重试后仍未推送成功，请检查网络后重试")
    return 1


if __name__ == "__main__":
    sys.exit(main())