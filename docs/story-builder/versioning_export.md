# Versioning, Autosave, and Export

- **Autosave Deltas:**
  - Use JSON Patch ops stored in `Autosave` collection every 30 seconds or significant change (>200 chars).
  - On resume, apply deltas sequentially to last committed `Version` snapshot.
- **Versioning:**
  - Each major action (outline approval, beat expansion, scene approval) writes full snapshot to `Version` with diff vs previous.
  - Allow user-labeled milestones (e.g., "Outline_v2") stored in `label`.
  - Provide timeline view sorted by `createdAt`.
- **Export Specs:**
  - **Markdown (.md):** Compose project into single markdown file with YAML frontmatter (title, author, rating, version). Scenes appended in sequence with headings.
  - **DOCX (.docx):** Use server-side conversion (e.g., `docx` npm package). Preserve headings, emphasis, and inline annotations stripped unless flagged to keep.
  - **PDF (.pdf):** Render via headless browser (Puppeteer) using export template; include cover page, table of contents, scene headers.
  - All exports embed revision metadata (versionId, timestamp) in document properties.
  - Export pipeline requires `Originality_Audit_v1` status = pass and `FinalSafetyPass` = pass.
