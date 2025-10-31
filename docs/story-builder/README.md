# AI Story Builder Implementation Blueprint

This directory organizes the full implementation plan for delivering the AI-assisted story builder product. Each document below corresponds to a core engineering deliverable so that individual teams can work from an explicit source of truth.

- [`state_machine.md`](./state_machine.md) — Textual state diagram describing writer workflow states, transitions, and failure handling.
- [`data_schemas.md`](./data_schemas.md) — JSON document schemas for all persisted entities (projects, outlines, beats, scenes, world assets, notes, versions, autosaves).
- [`prompt_templates.md`](./prompt_templates.md) — Fully parameterized prompt suites with guardrails and evaluation rubrics.
- [`rag_integration.md`](./rag_integration.md) — Retrieval-augmented generation (RAG) strategy, chunking rules, and context assembly contract.
- [`safety_guardrails.md`](./safety_guardrails.md) — Multi-stage safety requirements including copyrighted character filters, rating enforcement, and anti-derivative checks.
- [`versioning_export.md`](./versioning_export.md) — Autosave delta, versioning, and export pipeline specifications for Markdown, DOCX, and PDF outputs.
- [`api_ui_contract.md`](./api_ui_contract.md) — Client UI contract, state-driven event map, and minimal API surface area.
- [`testing_evaluation.md`](./testing_evaluation.md) — Test plan, evaluation metrics, and go/no-go checklist ensuring the platform meets quality and safety targets.

All documents preserve the original 557-line specification and can be dropped into project documentation as-is.
