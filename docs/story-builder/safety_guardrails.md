# Safety Guardrails

- **Outline Stage:** Outline generation prompt enforces rating ceiling, original content, and explicit risk checklist. Validator checks for banned keywords (configurable), rating limit violations, and similarity scores >0.82; failure returns to Outline state.
- **Scene Stage:** Scene drafting prompt mandates rating compliance, inclusive language, and continuity annotations. Automated safety review inspects lexical cues (violence, explicitness) and applies heuristics per rating band. Originality audit compares embeddings; if score <70, block progress.
- **Export Stage:** Final safety pass runs copyrighted-character filter (embedding + keyword list), rating boundary verification across full manuscript, and derivative content check using multi-level similarity (project vs reference corpus). Exports require all checks = pass; otherwise reroute to revision.
- **Copyrighted-character Filter:** Maintain curated blocklist (names, locations, signature items). Use fuzzy matching (Levenshtein distance ≤2) + embedding similarity threshold 0.75.
- **Rating Boundaries:**
  - PG: no explicit violence, language, or sexual content; implied only.
  - PG-13: moderate violence, limited strong language (max 1 per scene), no explicit sexual content.
  - R: adult themes allowed but disallow explicit sexual violence or hate speech.
  - Validators map lexical intensity to rating; exceedances trigger needs-edit or escalate.
- **Anti-Derivative Checks:** Combine originality prompt + cross-project fingerprinting (MinHash) to flag derivative structures; require manual acknowledgement if medium risk.
- **Escalation Protocol:** Any `escalate` status sends to human moderation queue with locked editing until resolution.
