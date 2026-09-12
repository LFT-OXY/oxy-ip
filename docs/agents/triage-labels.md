# Triage Labels

工程技能使用以下五个规范角色，对应标签保持默认名称：

| 规范角色          | 实际标签          | 含义                     |
| ----------------- | ----------------- | ------------------------ |
| `needs-triage`    | `needs-triage`    | 等待维护者评估           |
| `needs-info`      | `needs-info`      | 等待报告者补充信息       |
| `ready-for-agent` | `ready-for-agent` | 规格完整，可交给代理实施 |
| `ready-for-human` | `ready-for-human` | 需要人工实施             |
| `wontfix`         | `wontfix`         | 不予处理                 |

技能提及某个分诊角色时，使用表中的实际标签。

ATW 任务内实施票据不进入分诊队列；具体规则见 `issue-tracker.md`。本映射不授权在 GitHub 创建标签或 Issue。

若以后调整标签名称，只修改“实际标签”列，保留规范角色不变。
