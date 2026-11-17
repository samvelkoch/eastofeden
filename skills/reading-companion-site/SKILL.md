---
name: "reading-companion-site"
description: "Use to implement or update a reading-companion website (static GitHub Pages) for a book, following the reading-companion-method principles."
---

# Reading companion: implementation (static site)

Follow `reading-companion-method` for principles. This is one way to build it.

## Setup
1. Get the book file (epub). Split into `book/chNN.txt` + `index.json` (chapter titles, parts, offsets) and a small `find.py` to search quotes by chapter.
2. If an author journal/letters exist: split into `journal/entries/NNN.txt` with date and the chapter it concerns; keep a README with the mapping.
3. Repo on GitHub, one `index.html` (vanilla JS, no build) served by GitHub Pages; tabs = sections.

## Data model
- Every item (quote, event, character fact, journal entry, motif link, timeline point) carries `ch` (chapter where it becomes known).
- Global `BOUNDARY` = reader's chapter. A "my progress" selector stored in localStorage hides items with `ch > progress`. Long summaries written for the current boundary are hidden whole when progress is lower.
- Cross-links: anchors like `#ch-12`, `#person-adam`, `#motif-choice`; render names/"гл. N" as links automatically.

## Visuals
- Chapter navigation: `← Chapter N of M →` + grid of all chapters, unread ones dimmed and disabled, parts labeled.
- Storylines: chapter × line matrix (SVG/HTML grid).
- Idea map: force or fixed-layout graph; solid edge = reinforces, dashed = contradicts.
- Dual timeline: history vs novel, aligned by decade.
- Images: hotlink high-quality archival photos/maps; record source.

## Update procedure
1. Read new chapter files and matching journal entries only.
2. Edit data for all sections, bump BOUNDARY.
3. Grep for stale placeholders ("пока не сказано", "?") in already-read range.
4. Commit, push, check the Pages URL, report the chapter link.

## Memory to keep
Site URL, update rule, spoiler boundary, privacy rule (paraphrase reader), image preferences, no extra artifacts.