#!/usr/bin/env bash
set -euo pipefail

snapshot=src/views/clients/releases.json
# 只允许同步器的发布数据进入自动提交；人工资料和其他改动必须人工处理。
if [ "$(git branch --show-current)" != main ]; then
  echo '只能从 main 发布目录快照。' >&2
  exit 1
fi
while IFS= read -r path; do
  if [ "$path" != "$snapshot" ]; then
    echo "拒绝提交非发布数据改动：$path" >&2
    exit 1
  fi
done < <(git diff --name-only HEAD)
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo '存在未跟踪文件，拒绝自动提交。' >&2
  exit 1
fi

git fetch origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo 'main 已变化；保留远端人工编辑，等待下一轮重新同步。' >&2
  exit 1
fi
if git diff --quiet HEAD -- "$snapshot"; then
  echo '发布快照未变化。'
  exit 0
fi
git add -- "$snapshot"
git -c user.name='github-actions[bot]' \
  -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
  commit -m 'chore(clients): 更新官方发布快照'
# 普通快进推送也会拒绝 fetch 之后的并发编辑，不 rebase、不 force。
git push origin HEAD:refs/heads/main
