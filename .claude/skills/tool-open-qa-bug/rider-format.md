# Bug Report Format Guide

This project's bug reports use 8 fixed sections. The writing standard for each section is described below.

---

## ⚠️ [Current Problem]

Describe the **actual abnormal behavior observed**, not "what it should be".

**Good examples:**
- After clicking a video to enter the watch page, the page is unresponsive and the console shows `TypeError: Cannot read properties of null`
- After applying the "Uploaded this week" filter, the search list still shows all results; it only updates after a page refresh

**Bad examples:**
- Notification not sent (too vague)
- The system has a problem (no specific description)

**Principles:**
- **Say it in one sentence; measure it whenever you can**: the value of a bug report is being able to grasp the problem quickly, so don't pad it out
- Include the error message (if any)
- When describing a visual anomaly, state "which component, what it shows, and what it should show"
- Avoid subjective descriptions → use measurable ones instead ("very slow" → "wait exceeds 8 seconds")

---

## 💥 [Impact Scope]

**Severity levels:**

| Level | Definition | Example |
|---|---|---|
| **Blocker** | Core function unusable, blocks release | Search results page completely blank, no videos can be played at all |
| **Critical** | Affects a main business flow, has a workaround | Player fails on first load (playable after refresh) |
| **Major** | Function impaired but not critical, has a workaround | Search filter is reset after navigating back (re-applying works) |
| **Minor** | Visual glitch or edge case | Video card text alignment error, edge case |

**Impact scope description (three dimensions):**

- **Proportion of affected users**: all users / specific conditions (e.g. specific search keyword)
- **Affected functional modules**: single function / multiple functions (e.g. video search / video playback / channel / search filters)
- **Business impact**: core flow blocked / content cannot be displayed / degraded user experience

**Good examples:**
- Critical — for all users, the results page is blank when searching for videos, so the main search flow cannot reach any video
- Major — on first entry to the watch page the player stalls while loading, affecting the video playback experience (a refresh temporarily works around it)

**Bad examples:**
- Big impact (no specific target)
- Every function has a problem (over-described)

---

## 📎 [Attachments]

List the files or links that help reproduce the problem.

**Common attachments for web projects:**

| Type | How to obtain |
|---|---|
| Screenshot | Annotate the problem area, then upload |
| Recording | Screen recording of the reproduction steps |
| Console log | Browser DevTools → Console → right-click → Save as |
| Network log | DevTools → Network → filter failed requests → copy response |
| URL | The full URL (including query string) when the problem occurred |

If there are no attachments, write "None"; do not leave it blank.

---

## 🧪 [Reproduction Steps]

Provide steps that anyone can follow to reproduce the problem.

**Format requirements:**
1. **Preconditions** (if any): account state, data conditions, environment settings
2. **Numbered steps**: one action per step, specific down to "which button to click / what value to enter / what you see next"

**Good example:**
```
Precondition: guest/logged-out, open https://www.youtube.com

1. Type "lofi music" in the search box at the top of the page
2. Press Enter to submit the search
3. On the search results page, click "Filters"
4. Expect the filter panel to expand and allow selecting "Upload date: This week"
```

**Bad example:**
```
1. Log in
2. Click once
3. Problem occurs
```

---

## ✅ [Expected Result]

Describe **what the correct behavior should be**.

**Principles:**
- Reference the Jira ticket's AC (Acceptance Criteria) or the design spec
- Explain "the state that should be seen after completing the steps"
- No need to list steps; directly describe the final expected state

**Good examples:**
- After clicking "Filters" the filter panel expands, and after selecting "This week" the list updates in real time to videos uploaded this week
- After navigating back to the search results page, the filter conditions are preserved with no need to re-apply

---

## 🍀 [Test Environment]

Fill in the test environment where the bug was found.

| Item | Description |
|---|---|
| **Environment** | dev / staging / pre-release / prod |
| branch | (if dev environment) feature branch name, e.g. `feature/TICKET-1234` |
| Browser | (if browser-related) Chrome 125 / Safari 17, etc. |
| Login state | guest/logged-out (this framework only tests the guest/logged-out state) |

At minimum you can fill in just `dev` or `staging`, and decide whether to add other fields depending on the nature of the bug.

---

## 📋 [Additional Information]

Supplementary information that helps with tracking and communication.

- **Reproduction rate**: 100% / intermittent (X/10 times) / only under specific conditions
- **First found in**: branch name, sprint name, or version number
- **Related Ticket**: the associated TICKET-xxx (duplicate bug, prerequisite issue, etc.)
- **Workaround**: if there is a temporary workaround, fill it in for the user or CS team to reference
