<div align="center">

# Playwright-Web-Agentic-Engineering-Automation

**從 Jira 票到發版簽核，全程由 AI agent 驅動的端到端 QA 工程流水線**

[![Claude Code](https://img.shields.io/badge/Powered%20by-Claude%20Code-7C3AED?logo=anthropic&logoColor=white)](https://claude.ai/code)
[![OpenAI Codex](https://img.shields.io/badge/Powered%20by-Codex-000000?logo=openai&logoColor=white)](https://openai.com/codex)
[![Playwright](https://img.shields.io/badge/Playwright-TypeScript-45BA4B?logo=playwright&logoColor=white)](https://playwright.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Report](https://img.shields.io/badge/Live%20Report-Smart%20Report-F38020?logo=cloudflare&logoColor=white)](https://youtube-e2e-smart-report.pages.dev)

[English](README.md) · **繁體中文**

</div>

![QA 流水線](assets/pipeline.png)

> 📝 本文件為英文版 [README.md](README.md) 的翻譯，內容以**英文版為準**。

## 總覽

把一張 Jira 票交給 `/qa-ticket`，AI 會讀票、評風險、設計用例、寫自動化、跑測試、結案，**只在用例確認時停一次**讓人決定。確認後的 `.feature` 合回 `testcases/` 主庫；發版前用 `/tool-qa-release-gate` 對整個版本做 go / no-go 判斷。

以 **`https://www.youtube.com`** 作為實測目標；套用到自己的專案時，把測試目標換成你的產品 URL 即可。

> 繁瑣的工作交給 AI；品質決策由人來做。

視覺總覽：[pipeline.html](pipeline.html)

---

## 流水線

```
/qa-ticket TICKET-xxx
context → risk → cases → ★確認 → scripts → run → review → 結案
  讀票     風險    用例    合庫     自動化    驗證   code審查   結論
```

| # | 階段 | 做什麼 | 產物（`runs/{票號}/`） |
|---|---|---|---|
| 1 | context | 讀票、實際走一遍目標網站、對照主庫 | `context.md` |
| 2 | risk | 把票拆成具體風險項與等級 | `risks.md` |
| 3 | cases | 測試矩陣 → 狀態機 → BDD → 原型 → 獨立評審 | `test_matrix.md`、`cases/`、`review.html` … |
| 4 | ★確認 | 人看 `review.html` 確認；確認後合回 `testcases/` | — |
| 5 | scripts | planner 實走真實頁面抽 locator → generator 寫 step / POM | `youtube/evidence/` |
| 6 | run | 跑測試、抓假綠、healer 修失敗 | — |
| 7 | review | 自動化 code 審查 | — |
| 8 | 結案 | 結論 + 需人工驗證清單 | `progress.md` 結案段 |

中斷後再打一次 `/qa-ticket TICKET-xxx` 會從上次的階段續跑。環境（dev / staging / prod）只是註記，不是階段。

- 各階段 skill 與常駐工具 → [docs/qa-workflow-map.md](docs/qa-workflow-map.md)
- 每個階段的細節 → [docs/tutorial/04-workflow.md](docs/tutorial/04-workflow.md)
- 每個 skill 的參數與產物 → [docs/tutorial/03-skills.md](docs/tutorial/03-skills.md)

---

## E2E 自動化（youtube/）

YouTube Web 的 E2E 自動化框架，基於 **Playwright + playwright-bdd**。確認後的 `.feature` 情境在這裡實作成可執行的 Playwright 測試（訪客 / 未登入，涵蓋搜尋、播放、頻道、篩選）。

→ [youtube/README.md](youtube/README.md)

> ### 📊 線上測試報告
> **→ [youtube-e2e-smart-report.pages.dev](https://youtube-e2e-smart-report.pages.dev)**
>
> 每次 CI 跑完自動發布到 Cloudflare Pages。

---

## 從這裡開始

→ **[新手教學（Step 1：專案總覽）](docs/tutorial/01-overview.md)**（英文）

五個步驟：總覽 → 環境設定 → skill → 跑第一張票 → checklist。

---

## 快速開始

```bash
git clone https://github.com/JulianWangHZ/Playwright-Web-Agentic-Engineering-Automation.git
cd Playwright-Web-Agentic-Engineering-Automation/youtube

# 安裝依賴
npm install

# 跑測試（本機下載不到內建 chromium 時改用系統 Chrome）
BROWSER_CHANNEL=chrome npx playwright test --project=ui
```

在 repo 根目錄開啟 Claude Code：

```
/qa-ticket TICKET-123         # 測一張票
/tool-qa-release-gate v1.5    # 發版前簽核
```

---

## 目錄結構

```
Playwright-Web-Agentic-Engineering-Automation/
├── .claude/
│   ├── skills/            # qa-ticket 流程與常駐工具（索引見 docs/qa-workflow-map.md）
│   ├── agents/            # 自動化 planner / generator / healer
│   └── rules/             # Gherkin、自動化、commit、PR 規則
├── docs/
│   ├── tutorial/          # 新手教學（英文）
│   └── qa-workflow-map.md # 階段 → skill 單一真相
├── pipeline.html          # 流水線總覽
├── testcases/             # BDD 主庫（單一真相，只由 qa-merge 寫入）
├── runs/{票號}/           # 每票工作區（不進 git）
├── releases/{版號}.md     # 發版簽核文件（不進 git）
└── youtube/               # YouTube Web E2E 自動化（Playwright + BDD）
```

---

## License

以 [MIT License](LICENSE) 釋出 · Copyright (c) 2026 JulianWangHZ
