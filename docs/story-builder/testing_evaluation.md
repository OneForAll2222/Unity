# Testing & Evaluation Plan

- **Unit Tests:**
  - Validate JSON schema enforcement for each entity.
  - Test autosave diff merge logic (apply + rollback).
  - Ensure rating validator flags boundary violations with sample text corpora.
- **Integration Tests:**
  - Simulate state machine progression (mock events) verifying transitions and failure handling.
  - End-to-end flow: create project → outline → beat → scene → reviews → export (use mocked AI responses).
  - RAG retrieval: confirm chunk selection matches criteria and respects token cap.
- **Prompt Regression:**
  - Snapshot tests verifying prompt templates render with sample variables.
  - Safety-focused tests: feed borderline content; expect guardrail triggers.
- **Manual QA:**
  - Cross-role review (writer vs reviewer) for UI workflows.
  - Export file inspection for metadata + layout.
- **Monitoring Metrics:**
  - Originality score distribution; flag <70 for investigation.
  - Safety incident counts per stage.
  - Export success vs failure ratio.

- **Go/No-Go Checklist:**
  - All prompts validated through red-teaming for safety.
  - Moderation escalation path tested.
  - Version restore and autosave recovery verified.
  - Export pipeline produces identical content across formats (text diff tolerance <1%).
