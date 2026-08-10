<div align="center">

# Playwright-Web-Agentic-Engineering-Automation

**一條由 AI agent 驅動、從 Jira ticket 一路做到發版簽核的端到端 QA 工程流水線**

[![Claude Code](https://img.shields.io/badge/Powered%20by-Claude%20Code-7C3AED?logo=anthropic&logoColor=white)](https://claude.ai/code)
[![OpenAI Codex](https://img.shields.io/badge/Powered%20by-Codex-000000?logo=openai&logoColor=white)](https://openai.com/codex)
[![Playwright](https://img.shields.io/badge/Playwright-TypeScript-45BA4B?logo=playwright&logoColor=white)](https://playwright.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Report](https://img.shields.io/badge/Live%20Report-Smart%20Report-F38020?logo=cloudflare&logoColor=white)](https://youtube-e2e-smart-report.pages.dev)

[English](README.md) · **繁體中文**

</div>

---

> 📝 本文件為英文版 [README.md](README.md) 的翻譯，內容以**英文版為準**；若有出入，請以英文版為主。

---

![QA Pipeline & Stages](assets/pipeline.png)

---

## 總覽

`Playwright-Web-Agentic-Engineering-Automation` 是一條端到端的 AI QA 工程流水線，把**測試規劃**、**BDD 案例撰寫**、**自動化執行**、**主庫合併**、**發版簽核**串成一條完全由 AI agent 驅動的線——人類只負責做品質決策。它以 **`https://www.youtube.com`** 作為實測目標，完整示範這條流水線如何運作。

> 繁瑣的工作交給 AI；品質決策由人來做。

> 📌 本 repo 以 **YouTube**（`www.youtube.com`）作為受測產品範例，用來展示整條流水線；實際套用到你自己的專案時，只要把測試目標換成你的產品 URL 即可。

**互動式圖表**：[pipeline.html](pipeline.html)（流水線總覽）· [skills-guide.html](docs/skills-guide.html)（每個階段該用哪個 skill）。

---

## 完整流水線

<table>
<tr>
<td width="30%" valign="top">

**`01`&nbsp; 測試規劃**

AI 讀取 Jira ticket（`TICKET-xxx`），在撰寫任何案例之前先自動產出結構化的 Test Matrix 與風險場景，由 QA 審閱並確認範圍。

</td>
<td width="4%" align="center" valign="middle">→</td>
<td width="30%" valign="top">

**`02`&nbsp; 測試案例生成**

依據確認過的 matrix 自動生成 BDD `.feature` 檔，每個 scenario 都對應到一張 ticket。撰寫完成後由獨立 subagent 評分並給建議；經人工審閱後才執行。

測試範圍：搜尋 · 影片播放 · 頻道 · 搜尋篩選

</td>
<td width="4%" align="center" valign="middle">→</td>
<td width="30%" valign="top">

**`03`&nbsp; 功能測試與 E2E 自動化**

BDD 案例設計完成後，`youtube/`（Playwright + playwright-bdd）自動執行網頁場景，QA 則負責監看與驗證邊界情境。

</td>
</tr>
<tr><td colspan="5"><br></td></tr>
<tr>
<td valign="top">

**`04`&nbsp; 合併回庫與封存**

版本通過後，核可的 `.feature` 檔會合併回 `testcases/` 主案例庫。新檔整份複製；Modified 檔逐 scenario 智慧合併；`versions/{version}/testcases/` 暫存區清空。

</td>
<td align="center" valign="middle">→</td>
<td valign="top">

**`05`&nbsp; 品質關卡**

風險矩陣分析、RIDER 格式的 bug 報告，以及確認主流程無斷點的 sanity check——由 QA 對是否發版做最終裁決。

</td>
<td align="center" valign="middle">→</td>
<td valign="top">

**`06`&nbsp; 同步與可追溯性**

每個案例都連回它的 Jira ticket。TEST Sub-task 建立後會自動指派負責人並轉為 Done。go / no-go 決策由人來確認。

Ticket → BDD Case → TEST Sub-task → Release

</td>
</tr>
</table>

---

## 工作流程

```
Feature 階段 → features/{ticket}/
Version 階段 → versions/{v}/
主案例庫     → testcases/（單一真相來源）
```

流水線總覽：[pipeline.html](pipeline.html)
每個階段該用哪個 skill：[skills-guide.html](docs/skills-guide.html)
文字版單一真相來源：[docs/qa-workflow-map.md](docs/qa-workflow-map.md)

---

## E2E 自動化（youtube/）

一套以 **Playwright + playwright-bdd** 為基礎、針對 YouTube Web 的 E2E 自動化框架。BDD 設計階段產出的 `.feature` 場景，會在這裡被實作成可自動執行的 Playwright 測試（訪客／未登入狀態，涵蓋搜尋／播放／頻道／篩選）。

→ [youtube/README.md](youtube/README.md)

> ### 📊 線上測試報告
> **→ [youtube-e2e-smart-report.pages.dev](https://youtube-e2e-smart-report.pages.dev)**
>
> 每次 CI 執行後自動發布到 Cloudflare Pages。

---

## 從這裡開始（新成員）

→ **[新手教學（Step 1：專案總覽）](docs/tutorial/01-overview.md)**

六個步驟帶你從零到能實際上手，最後銜接到 YouTube Web E2E 自動化框架。

---

## 快速開始

```bash
git clone https://github.com/JulianWangHZ/Playwright-Web-Agentic-Engineering-Automation.git
cd Playwright-Web-Agentic-Engineering-Automation/youtube

# 安裝相依套件
npm install

# 執行測試（本機無法下載 bundled chromium 時，改用系統 Chrome）
BROWSER_CHANNEL=chrome npx playwright test --project=ui
```

在 repo 根目錄開啟 Claude Code，用通用的 ticket 號驅動 skill：

```
/stage-test-matrix TICKET-123
/stage-tc-merge v1.5
```

→ 完整 skill 參考：[docs/tutorial/03-skills.md](docs/tutorial/03-skills.md)

---

## 目錄結構

```
Playwright-Web-Agentic-Engineering-Automation/
├── .claude/
│   ├── rules/                 # Gherkin、commit、PR 格式與 coding style 規則
│   └── skills/                # AI skill 定義（清單見 docs/tutorial/03-skills.md）
├── assets/                    # 圖片（流水線圖、skill guide 截圖）
├── docs/
│   ├── tutorial/              # 新手教學（6 步；03 = 完整 skill 參考、04 = 完整 workflow）
│   ├── qa-workflow-map.md     # 階段 → skill 單一真相來源
│   └── skills-guide.html      # 每個階段該用哪個 skill（互動式）
├── pipeline.html              # 流水線總覽（互動式圖表）
├── features/{ticket}/         # Feature 工作區
├── testcases/                 # 穩定案例主庫（.feature）
├── versions/{v}/              # Version 工作區
└── youtube/                   # YouTube Web E2E 自動化（Playwright + BDD）
    └── README.md              # → 從這裡開始
```

---

## 授權

以 [MIT License](LICENSE) 釋出 · Copyright (c) 2026 JulianWangHZ
