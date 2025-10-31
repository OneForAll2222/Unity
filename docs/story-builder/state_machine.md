# Workflow State Machine

Textual state diagram describing states (S), events (E), transitions (T), and failure states (F). Every state exposes at least one exit to avoid dead-ends.

- **S0 Onboarding**
  - **Entry:** new or returning user without active project.
  - **E0 CompleteProfile:** user selects experience level, preferred workflow (no-code UI / VS Code plugin), consent to policies.
    - **T:** Store profile, initialize tutorial checklist → **S1 ProjectSetup**.
  - **F0 AbandonOnboarding:** user exits; autosave partial data and prompt resume banner on next login.

- **S1 ProjectSetup**
  - **E1 CreateProject:** user inputs title, genre, tone, rating ceiling (PG/PG-13/R), originality affirmation.
    - **Valid:** persist project shell → **S2 VoiceSelection**.
    - **Invalid:** missing fields / rating conflict → remain **S1** with inline errors.
  - **E2 ImportProject:** optional import from markdown; triggers copyright scan. If infringing → **F1 ProjectRejected**; else continue to **S2**.
  - **Exit:** Delete project request → **S0**.

- **S2 VoiceSelection**
  - **E3 ChooseVoicePreset:** user selects base style template; or **E4 UploadReference** (custom voice). Both enforce originality filter.
    - After selection, run AI style synthesis preview → **S3 OutlinePlanning**.
  - **F2 VoiceRejected:** reference flagged (copyright/rating violation) → route back to **S2** with alert.

- **S3 OutlinePlanning**
  - **E5 GenerateOutline:** triggers outline prompt with guardrails + RAG context.
    - **Success:** store Outline v1, autosave delta, run evaluation rubric → **S4 BeatDesign**.
    - **Failure:** validation errors (length, safety) → remain **S3**.
  - **E6 ManualOutlineEdit:** user edits; autosave versions.

- **S4 BeatDesign**
  - **E7 ExpandBeats:** AI expands major beats; evaluation rubric ensures plot coverage.
    - **Success:** persist Beats, notify character/location setup → **S5 WorldBuilding**.
    - **Failure:** safety/originality issues → revert to **S3** or remain for revision.
  - **E8 UserAdjustBeat:** manual edits with autosave.

- **S5 WorldBuilding**
  - **E9 CreateCharacters/Locations:** user adds or imports; triggers safety validation per entity.
    - **Completion:** minimum cast + locations defined → **S6 SceneDrafting**.
  - **F3 AssetRejected:** flagged entity (copyright/rating) → stay in **S5** with error log.

- **S6 SceneDrafting**
  - **E10 DraftScene:** AI generates scene using beat context + RAG notes.
    - **Success:** store Scene draft, run continuity + safety review queue → **S7 ReviewLoop**.
    - **Failure:** guardrails fail (tone/rating/originality) → remain **S6** for edits.
  - **E11 ManualWriteScene:** user writes; still queued for reviews.

- **S7 ReviewLoop**
  - **E12 ContinuityCheck:** automated check ensures scene alignment; pass → next review.
  - **E13 SensitivityCheck:** ensures inclusive language, rating boundaries; pass → ready state.
  - **E14 UserApproveScene:** when all reviews pass, mark scene ready → **S8 CompileProject**.
  - **E15 RequestRevisions:** send scene back to **S6** with feedback summary.
  - **F4 ReviewBlock:** repeated violations escalate to moderation queue; project locked until resolved.

- **S8 CompileProject**
  - **E16 RunOriginalityScan:** compare entire project to embeddings; if clean → **S9 ExportPrep**.
    - **Failure:** flagged similarity → return to **S6** for rewrites with diagnostic report.
  - **E17 AddAppendices:** optional notes/world bible attachments.

- **S9 ExportPrep**
  - **E18 SelectExportFormat:** choose Markdown / DOCX / PDF.
  - **E19 FinalSafetyPass:** full manuscript + metadata review (copyright, rating, sensitive content).
    - **Success:** trigger export pipeline → **S10 ExportComplete**.
    - **Failure:** send actionable feedback → **S7** (if content fix) or **S5** (if metadata fix).

- **S10 ExportComplete**
  - **E20 DownloadFile:** deliver exports, log version snapshot; user can re-enter **S6** for further edits or **S0** to start new project.
  - **Exit:** archive project or duplicate for new iteration.
