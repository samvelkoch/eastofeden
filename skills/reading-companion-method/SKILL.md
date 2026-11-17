---
name: "reading-companion-method"
description: "Use when a reader wants to build a spoiler-safe companion (diary/site/notes) for any book they are reading, chapter by chapter, together with Claude."
---

# Reading companion: principles (implementation-agnostic)

## Core principles
1. **Spoiler boundary is sacred.** Everything is tied to a chapter. Nothing past the reader's current chapter is shown, hinted or foreshadowed. Answer questions only within the boundary; say openly when the book has not answered yet.
2. **Nothing stale.** On each reading advance, update every section that is affected. "Not yet said" for something already read is a bug.
3. **Source of truth = the text.** Work from the book split by chapter; verify facts and quotes against it; cite chapter numbers. Separate fact from a character's claim.
4. **Behind the scenes.** Look for the author's own materials (letters, journals, interviews, drafts) and tell the reader they exist up front. Map them to chapters, check them on every update.
5. **Reader's voice is private.** Reader impressions are paraphrased neutrally, never quoted verbatim in a shared artifact.
6. **The reader doesn't maintain anything.** No sections that depend on the reader filling them ("impressions", "hypotheses"); Claude keeps everything current.
7. **Quality over formality.** Pick the best illustrative material (photos, maps) for the era; respect the reader's content limits.
8. **Everything links.** Names, places, themes, chapters are cross-referenced across all sections.
9. **Per-reader progress.** Data is chapter-tagged so any reader can set "read up to N" and see only that.

## Sections (pick what fits the book)
- **Chapters**: summary, key quotes, parts/books marked, behind-the-scenes block. Navigation that shows all chapters visibly (no hidden scroll).
- **Characters**: who-is-who grouped by family/faction (visually separated), a detailed page per main character: events, relations, quotes, by chapter.
- **Chronology**: novel time, plus a parallel historical timeline (economy, society, technology).
- **Storylines**: visual chapter × storyline matrix.
- **Meanings / idea map**: graph of motifs: chapters, characters, quotes, how meaning shifts, and contradictions (not only reinforcing links).
- **World**: era context, places, maps, period photos of real people (all walks of life).
- **Author's journal**: entries by date, mapped to chapters, quotes in the reader's language.
- **Quotes**: collected, tagged by chapter, theme and character.

## Update loop (each time the reader says "finished chapter N")
1. Read only the new chapter(s) and matching author materials.
2. Update all sections above; move the boundary to N.
3. Check old entries for things now resolved.
4. Report in one short message: what's new + one interesting find.