# RAG Retrieval Specification

- **Embedding Strategy:** Use 1536-dim text embeddings (e.g., OpenAI text-embedding-3-large). Embed Note content, character bios, location descriptions, and world rules upon creation/update.
- **Chunking:**
  - Split notes into 400-token windows with 100-token overlap using semantic-aware splitter (respect markdown headings).
  - Character/Location bios chunked by section (appearance, motivation, history); max 300 tokens.
- **Metadata Tags:** {"projectId", "entityType", "tags", "ratingCeiling", "language"}.
- **Retrieval Criteria:**
  - Filter by projectId and language.
  - Limit to ratingCeiling ≤ scene rating.
  - Prioritize chunks tagged with active beat, characters, or locations.
  - Use hybrid search (embedding similarity + keyword) returning top 6 chunks with similarity ≥0.78.
  - Deduplicate overlapping chunks by content hash before prompt injection.
- **Context Assembly:**
  - Build ordered context: beat summary → character snippets → location snippets → notes/world lore.
  - Cap total context to 1800 tokens; drop lowest relevance if exceeded.
- **Feedback Loop:**
  - Log retrieved chunk IDs with scene version for audit.
  - If originality audit flags overlap with retrieved chunk, annotate source for user transparency.
