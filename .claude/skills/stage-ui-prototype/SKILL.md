---
name: stage-ui-prototype
description: Produce an interactive HTML prototype for the Feature / Version stage. argument: TICKET-xxx → Feature; vX.X TICKET-xxx → Version (regenerate when requirements change). Triggers when the user mentions "prototype", "interactive mockup", "HTML prototype", or "screen demo". Stop Use this skill only when you want the "HTML prototype" artifact by itself; for the full feature-ticket flow use flow-feature-testing-workflow.
argument-hint: "<TICKET-xxx | vX.X TICKET-xxx>"
allowed-tools: Read, Write, Bash, mcp__atlassian__jira_get_issue, mcp__atlassian__jira_get_issue_development_info, mcp__claude_ai_Figma__get_design_context
---

HTML prototype helper. Automatically determines the Feature / Version stage from the argument. **Produces a single prototype.html only**. Forbidden: writing test_matrix/state_machine/feature / writing multiple files / modifying repo code / commit / push.

**When to run**: new module/new page / complex UI flow / PM-RD alignment / demo / regenerate after Version requirement changes. Simple changes to existing pages usually do not need it.

---

## Phase 0: Determine stage + path

| argument | Stage | Prerequisite | Output path |
|---|---|---|---|
| `TICKET-xxx` | Feature | `features/{ticket}/test_matrix.md` (if missing → run `/stage-test-matrix` first) | `features/{ticket}/prototype.html` |
| `vX.X TICKET-xxx` | Version | `versions/{version}/testcases/{ticket}/test_matrix.md` (if missing → run `/stage-test-matrix` first) | `versions/{version}/testcases/{ticket}/prototype.html` |

Ask if the argument is incomplete. If prototype.html already exists → ask overwrite/cancel.

---

## Step 0: Confirm the current state of the target site (required)

YouTube is an external site (https://www.youtube.com, guest/logged-out state), with no in-house repo. In order:

1. `jira_get_issue({ticket})` + `jira_get_issue_development_info({ticket})` — get the feature description, AC, and Figma link
2. Walk through the target site to observe the corresponding screens (search / watch / channel / search filters) — confirm the actual UI layout, copy, and interactions
3. If there is a Figma link → go to Step 2 to read the design

Goal: the prototype's copy, layout, and interaction logic match the actual state of the target site.

## Step 1: Read existing information

Read the test_matrix.md at the corresponding path (screens/components/roles/flows) + state_machine.md (if any) + the Jira + codebase obtained in Step 0.

## Step 2: Ask Figma (optional)

Is there a Figma link? Yes → use `mcp__claude_ai_Figma__get_design_context` to pull the screen structure. It can still be done without one.

## Step 3: Confirm the prototype scope

```
Screens to include:
1. {Screen A} — role X
2. {Screen B} — trigger Y

Interaction points: {tap X→Y screen / condition Z→warning}

All of them or just the core ones? Recommendation: N core screens + M main interactions.
```

Wait for user confirmation before writing.

## Step 4: Write prototype.html

**You must first read `.claude/UI_BASE.md`** and apply the full spec (CSS vars, Urbanist, card, badge, etc.).

**Structure rules**: HTML5, inline CSS/JS, interactive, no external dependencies.

**Mobile prototypes must use the sidebar + phone frame layout**:

```html
<!--
  {ticket} — {full Jira title}
  Jira: https://your-workspace.atlassian.net/browse/{ticket}
  Related: test_matrix.md / state_machine.md
-->
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{ticket} — {title} Prototype</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --dark:#222026; --gray:#EBEBEB; --green:#A7E46A; --blue:#A8DFF8; --bg:#F4F5F8;
  --t1:#222026; --t2:#6B6773; --t3:#AEAAB7;
  --green-bg:rgba(167,228,106,0.18); --blue-bg:rgba(168,223,248,0.18);
  --shadow:0 2px 20px rgba(34,32,38,0.07); --r:20px; --rs:12px; --rp:100px;
  --f:'Urbanist',-apple-system,sans-serif; --fm:'SF Mono','Fira Code',Consolas,monospace;
}
body { font-family:var(--f); background:var(--bg); color:var(--t1); min-height:100vh; -webkit-font-smoothing:antialiased; }
.layout { display:flex; height:100vh; }
.sidebar { width:200px; flex-shrink:0; background:#fff; border-right:1px solid var(--gray); overflow-y:auto; }
.sidebar-head { padding:16px; border-bottom:1px solid var(--gray); }
.sidebar-head .ticket { font-size:15px; font-weight:800; color:var(--dark); }
.sidebar-head .desc { font-size:11px; color:var(--t2); margin-top:2px; }
.nav-group { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--t3); padding:12px 14px 4px; }
.nav-item { padding:8px 14px; font-size:12.5px; font-weight:500; color:var(--t2); cursor:pointer; border-left:3px solid transparent; transition:all .15s; line-height:1.3; }
.nav-item:hover { background:var(--bg); }
.nav-item.active { color:var(--dark); background:var(--bg); border-left-color:var(--dark); font-weight:700; }
.main { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; gap:12px; overflow:auto; }
.screen-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--t3); }
.phone { width:320px; height:620px; background:#fff; border-radius:44px; border:10px solid var(--dark); position:relative; overflow:hidden; flex-shrink:0; box-shadow:0 20px 60px rgba(34,32,38,.2),0 6px 16px rgba(34,32,38,.1); }
.notch { position:absolute; top:0; left:50%; transform:translateX(-50%); width:100px; height:24px; background:var(--dark); border-radius:0 0 14px 14px; z-index:40; }
.scr { position:absolute; inset:0; display:none; flex-direction:column; background:#f8f9fb; }
.scr.on { display:flex; }
.scr::before { content:''; display:block; height:24px; flex-shrink:0; } /* notch spacer, must be kept */
.debug { position:fixed; bottom:16px; right:16px; background:var(--dark); color:#fff; border-radius:var(--rs); padding:10px 14px; font-family:var(--f); display:flex; align-items:center; gap:14px; box-shadow:0 4px 20px rgba(34,32,38,.3); z-index:999; }
.debug-label { font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.45); }
.debug-val { font-size:12px; font-weight:600; color:var(--green); }
</style>
</head>
<body>
<div class="layout">
  <div class="sidebar">
    <div class="sidebar-head">
      <div class="ticket">{ticket}</div>
      <div class="desc">{brief}</div>
    </div>
    <div class="nav-group">Group</div>
    <div class="nav-item active" onclick="go('s1',this)">Screen 1</div>
    <div class="nav-item" onclick="go('s2',this)">Screen 2</div>
  </div>
  <div class="main">
    <div class="screen-label" id="lbl">Screen 1</div>
    <div class="phone">
      <div class="notch"></div>
      <div class="scr on" id="s1"><!-- screen content, .scr::before automatically provides 24px notch space --></div>
      <div class="scr" id="s2"><!-- ... --></div>
    </div>
  </div>
</div>
<div class="debug">
  <div><div class="debug-label">Ticket</div><div style="font-weight:800;">{ticket}</div></div>
  <div><div class="debug-label">Screen</div><div class="debug-val" id="dv">Screen 1</div></div>
  <div style="display:flex;align-items:center;gap:6px;">
    <button id="playBtn" onclick="togglePlay()" style="background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:6px;padding:5px 10px;font-family:var(--f);font-size:13px;cursor:pointer;">▶</button>
    <div style="font-size:10px;color:rgba(255,255,255,.4);" id="playCount">1 / {N}</div>
  </div>
</div>
<script>
const labels = { s1:'Screen 1', s2:'Screen 2' };
const order = ['s1','s2'];
let playIdx = 0, playTimer = null;
function go(id, el) {
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  document.getElementById('lbl').textContent = labels[id] || id;
  document.getElementById('dv').textContent = labels[id] || id;
  playIdx = order.indexOf(id);
  document.getElementById('playCount').textContent = (playIdx+1)+' / '+order.length;
  if (el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  } else {
    const ni = document.querySelectorAll('.nav-item');
    if (ni[playIdx]) { ni.forEach(n=>n.classList.remove('active')); ni[playIdx].classList.add('active'); ni[playIdx].scrollIntoView({block:'nearest'}); }
  }
}
function togglePlay() {
  const btn = document.getElementById('playBtn');
  if (playTimer) { clearInterval(playTimer); playTimer=null; btn.textContent='▶'; }
  else { btn.textContent='⏸'; playTimer=setInterval(()=>{playIdx=(playIdx+1)%order.length;go(order[playIdx],null);},2500); }
}
</script>
</body>
</html>
```

## Step 5: Write the file

`Write` to the corresponding output path.

## Report

```
Produced {output path} (Feature/Version)
Screens covered: {list} | Interaction points: {list}
open {output path}
Next: /stage-write-bdd {argument}
```

---

## Rules

- Ask if the argument is ambiguous; if test_matrix does not exist → run /stage-test-matrix first
- **Step 0 is required** (Jira → walk the target site → Figma); the prototype must match the actual state of the target site
- **Mobile prototypes must use sidebar + phone frame**; the `.scr::before` 24px notch spacer must be kept
- **The debug bar must have ▶/⏸ autoplay** (switch every 2.5s; go() syncs sidebar active + scrollIntoView)
- Always a single file with inline CSS+JS; apply UI_BASE.md; no external dependencies; always write files with `Write`
- Version regenerate: overwrite `versions/{version}/testcases/{ticket}/prototype.html`; the old version is preserved by git history
