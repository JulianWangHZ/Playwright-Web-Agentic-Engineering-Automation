# Bug Report Examples

---

## Example 1: Search video issue

**Feature ticket**: TICKET-1234  
**Bug title**: `[Bug] After entering a keyword and searching, the search results page is blank with no error message`

**Jira Description Markdown:**

```markdown
**⚠️ [Current problem]**

After entering the keyword "lofi music" in the home page search box and pressing Enter, the page navigates to the search results page but the list is completely blank, with no video cards and no "No results found" message text. The console shows `TypeError: Cannot read properties of undefined`.

---

**💥 [Impact scope]**

**Severity:** Critical

All users are affected when searching for videos. Search is a core entry point of YouTube, and a blank results page makes it impossible to reach any video via search.

---

**📎 [Attachments]**

Screen recording: https://drive.google.com/xxx
Console log: [error message screenshot]

---

**🧪 [Reproduction test steps]**

**Preconditions:** guest/logged-out, open https://www.youtube.com

1. Click the search box at the top of the page and enter "lofi music"
2. Press Enter to submit the search
3. Observe whether the search results page shows a video list

---

**✅ [Expected result]**

The search results page shows a list of video cards related to "lofi music", each card containing a thumbnail, title, channel name, and view count.

---

**🍀 [Test environment]**

staging | Chrome 125 | guest/logged-out

---

**📋 [Additional information]**

**Initial ownership:** frontend (youtube; reason: a frontend TypeError in the console, the results page rendering crashes)

**Reproduction rate:** 100%

**First found:** feature/TICKET-1234

**Related ticket:** none

**Workaround:** none (the main search flow is broken)
```

---

## Example 2: Search filter behavior issue

**Feature ticket**: TICKET-5678  
**Bug title**: `[Bug] After applying the "Uploaded this week" filter, switching tabs and going back resets the filter`

**Jira Description Markdown:**

```markdown
**⚠️ [Current problem]**

On the search results page, expanding the "Filters" and checking "Upload date: This week" updates the list correctly. Clicking any video to enter the watch page and then pressing the browser back button to return to the search results page clears the filter, the list reverts to the unfiltered state, and the filter panel no longer shows the selected tag.

---

**💥 [Impact scope]**

**Severity:** Minor

All users who use search filters are affected. After going back they need to re-apply the filter, which affects user experience but is not a core flow and does not affect search or playback itself.

---

**📎 [Attachments]**

Screen recording: https://drive.google.com/yyy

---

**🧪 [Reproduction test steps]**

**Preconditions:** guest/logged-out, already searched for any keyword on https://www.youtube.com

1. On the search results page, click "Filters"
2. Check "Upload date: This week"
3. Confirm the list has updated per the filter
4. Click any video to enter the watch page
5. Press the browser back button to return to the search results page
6. Observe whether the filter is retained

---

**✅ [Expected result]**

After returning to the search results page, the "Uploaded this week" filter should be retained, the list should stay in the filtered state, and the filter panel should show the selected tag.

---

**🍀 [Test environment]**

staging | guest/logged-out

---

**📋 [Additional information]**

**Initial ownership:** frontend (youtube; reason: the filter state is not retained across navigation, which is frontend state management)

**Reproduction rate:** 100%

**First found:** staging v2.1

**Related ticket:** none

**Workaround:** none (visual/experience issue, does not affect functionality)
```

---

## Example 3: Video playback issue

**Feature ticket**: TICKET-9012  
**Bug title**: `[Bug] After clicking a video to enter the watch page, the player is stuck on the loading spinner and does not start playing`

**Jira Description Markdown:**

```markdown
**⚠️ [Current problem]**

After clicking any video from the search results or home page to enter the watch page, the player area keeps showing the loading spinner, the video does not start playing, and no error screen appears. There is still no response after waiting more than 30 seconds. Refreshing the page for the same video plays it normally.

---

**💥 [Impact scope]**

**Severity:** Major

Some users cannot get the video to load automatically on their first entry to the watch page and need to refresh to play it, affecting the core video playback experience (a refresh can temporarily work around it).

---

**📎 [Attachments]**

Screenshot (player stuck on loading screen): https://drive.google.com/zzz
Network log (if any): none

---

**🧪 [Reproduction test steps]**

**Preconditions:** guest/logged-out, open https://www.youtube.com

1. On the home page, click any recommended video
2. Enter the watch page and observe whether the player starts playing (wait about 30 seconds)
3. If it is stuck loading, refresh the page and observe again

---

**✅ [Expected result]**

After entering the watch page, the player should start playing the video within a few seconds, showing the picture and playback progress, without needing a refresh.

---

**🍀 [Test environment]**

staging | Chrome 125 | guest/logged-out

---

**📋 [Additional information]**

**Initial ownership:** to be confirmed (youtube; reason: could be a frontend player initialization issue or a backend response for the video stream, insufficient evidence)

**Reproduction rate:** intermittent (about 3/10 times)

**First found:** staging sprint-24

**Workaround:** the page plays normally after a refresh
```
