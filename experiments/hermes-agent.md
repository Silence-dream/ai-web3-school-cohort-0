# Hermes Agent 详细学习笔记

> 更新日期：2026-05-20  
> 来源：AI × Web3 School「AI Agent 入门 —— Hermes 从 0 到 1」课程 + 实际使用经验

## 1. Hermes Agent 是什么？

Hermes Agent 是一个**运行在服务器上的持久化 AI Agent 平台**，由 Nous Research 开发。它不是普通的聊天机器人，而是具备以下特点的**长期协作型 Agent**：

- **跨会话记忆**：能记住用户偏好、项目结构、常用命令、历史决策
- **工具驱动执行**：可以真正执行命令、操作文件、调用 API、浏览网页
- **技能系统**：支持加载专业工作流（SKILL.md）
- **子代理协作**：可以派生子代理并行完成复杂任务
- **Git 原生集成**：特别适合维护学习仓库和 Proof-of-Work

它的目标是成为用户的**第二大脑 + 执行助手**，特别适合长期学习、项目开发和知识管理场景。

## 2. 核心组成模块

| 模块          | 作用                                   | 实际使用例子                              |
|---------------|----------------------------------------|-------------------------------------------|
| **Memory**    | 持久化保存事实和偏好                   | 保存“用户偏好中文回复”、“项目结构”       |
| **Tools**     | 可执行的具体能力                       | terminal、browser_navigate、file、git 等   |
| **Skills**    | 可复用的专业工作流                     | `hermes-agent`、`github-code-review`、`plan` |
| **Subagents** | 委托子代理并行工作                     | 复杂任务拆分执行                          |
| **Cron**      | 定时任务和提醒                         | 每天早上自动提醒学习                      |

## 3. 在 AI × Web3 School 中的应用

Hermes Agent 在本课程中主要承担以下角色：

- **学习管家**：每天提醒学习、生成 daily note 和打卡草稿
- **仓库管理员**：维护 `ai-web3-school-cohort-0` 仓库结构和 Git 操作
- **信息查询员**：通过 WCB Agent API 查询任务、会议、进度
- **内容整理者**：把课程活动整理成结构化笔记
- **反馈沉淀者**：收集 Handbook 问题并整理到 `handbook-feedback/`

## 4. 重要工作流（已实践）

### 初始化流程
1. 确认学员画像（每轮最多 2-3 个问题）
2. 引导 GitHub CLI 登录
3. 创建个人学习仓库（推荐 `ai-web3-school-cohort-0`）
4. 初始化目录结构（daily、tasks、experiments、handbook-feedback 等）
5. 创建 README、profile、learning-plan 等核心文件
6. 提交初始版本

### 每日学习流程
1. 通过 WCB API 查询今日会议和任务
2. 生成 `daily/YYYY-MM-DD.md`
3. 整理活动信息、收获、打卡内容
4. 提交到 GitHub

### API 使用
- 使用 `WCB_AGENT_SECRET_API_KEY` 调用以下接口：
  - `users.getProfile`
  - `tasks.listForLearner`
  - `events.listForLearner`

## 5. 核心原则（必须遵守）

- **人工确认优先**：所有涉及创建仓库、文件写入、Git 提交、API 写入的操作必须先让用户确认
- **不泄露敏感信息**：Secret Key、Token、密码等不要写进 repo 或聊天记录
- **轻量启动**：先让今天能行动，而不是一次性规划全部未来
- **开源思维**：repo 是公开的 Proof-of-Work，要有实际产出
- **隐私安全**：public repo 严禁存放 API Key、私钥、助记词等

## 6. 常用命令模式

```bash
# 创建 daily note
cat > daily/2026-05-19.md << 'EOF'
...
EOF

# 提交变更
git add .
git commit -m "Add daily note for 2026-05-19"
git push
```

## 7. 部署技巧：让其他 Agent 帮助部署 Hermes Agent

在实际使用中，直接自己部署 Hermes Agent 比较麻烦。推荐采用 **「让 Agent 帮 Agent 部署」** 的方式，效率更高。

### 推荐做法：使用 Claude Code 辅助部署

**核心思路**：让 Claude Code（或 Codex、OpenCode）作为“部署工程师”，而 Hermes Agent 作为“最终运行的 Agent”，两者分工协作。

### 实用部署流程建议

1. **准备阶段**
   - 准备好服务器（推荐 Ubuntu 22.04+ 或 Debian）
   - 准备好 API Key（OpenAI / Anthropic / Grok 等）
   - 准备好 GitHub Token（用于 git 操作）

2. **让 Claude Code 帮你部署的 Prompt 示例**

```markdown
你是一个专业的 DevOps 工程师，请帮我在一台新的 Linux 服务器上部署 Hermes Agent。

要求：
1. 使用最新版本的 Hermes Agent
2. 配置好环境变量（包括 API Key）
3. 安装必要的依赖（Playwright、git、curl 等）
4. 创建一个 systemd 服务，让 Hermes Agent 开机自启
5. 配置好持久化目录和日志
6. 最后给出完整的部署命令和验证步骤

服务器信息：Ubuntu 22.04，root 用户
```

3. **部署后的验证清单**
   - `hermes --version` 是否正常
   - 是否能正常调用工具（terminal、browser）
   - Memory 是否能持久化
   - 是否能成功连接 GitHub
   - 是否能加载技能

4. **进阶技巧**
   - **多 Agent 协作部署**：先让 Claude Code 写部署脚本，再让 Hermes Agent 执行和验证
   - **模板化部署**：把常用部署流程写成技能（SKILL.md），以后一键部署
   - **环境隔离**：建议为 Hermes Agent 单独创建一个 `hermes` 用户，而不是用 root

5. **常见坑点**
   - Playwright/Chromium 依赖缺失（需要安装 `libatk-bridge-2.0`、`at-spi2-atk` 等）
   - 权限问题（文件读写、git push）
   - API Key 泄露（不要写进公开脚本）
   - 端口冲突或防火墙问题

---

**备注**：本笔记将持续更新，建议定期 review 并补充实际使用中的新技巧和坑点。
