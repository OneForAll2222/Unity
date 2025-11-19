# Client UI Contract & API Routes

## UI Layout

- **Main Panel:** Markdown editor with scene tabs, autosave indicator, word count, evaluation badges.
- **Left Panel:** Project navigator (Outline → Beats → Scenes), state machine progress indicator.
- **Right Panel:** Context tabs (Notes RAG snippets, Character cards, Safety alerts, Evaluation rubric results).
- **Footer:** Workflow controls (Generate, Review, Approve, Export) mapped to state transitions.

## Key UI Events → API Calls

| UI Event | Description | API Route | Method | Payload | Response |
| --- | --- | --- | --- | --- | --- |
| `completeOnboarding` | Submit onboarding form | `/api/onboarding` | POST | profile data | project shell + JWT |
| `createProject` | Create project | `/api/projects` | POST | title, genre, rating, workflow | project object |
| `updateProjectMetadata` | Edit metadata | `/api/projects/:id` | PATCH | metadata fields | updated project |
| `generateOutline` | Trigger outline AI | `/api/projects/:id/outline` | POST | prompt vars | outline JSON + evaluation |
| `updateOutline` | Manual edits | `/api/outlines/:id` | PATCH | markdown/json diff | outline |
| `expandBeat` | AI beat expansion | `/api/beats` | POST | beat context | beat JSON + risks |
| `updateBeat` | Manual beat edit | `/api/beats/:id` | PATCH | diff | beat |
| `createCharacter` | Add character | `/api/characters` | POST | character payload | character |
| `createLocation` | Add location | `/api/locations` | POST | location payload | location |
| `draftScene` | AI scene draft | `/api/scenes` | POST | scene context | scene draft + metadata |
| `updateScene` | Manual scene edit | `/api/scenes/:id` | PATCH | diff | scene |
| `runContinuityCheck` | Queue continuity review | `/api/scenes/:id/continuity` | POST | sceneId | audit report |
| `runSensitivityReview` | Queue sensitivity | `/api/scenes/:id/sensitivity` | POST | sceneId | review report |
| `requestOriginalityAudit` | Check originality | `/api/scenes/:id/originality` | POST | sceneId | audit result |
| `approveScene` | Mark scene ready | `/api/scenes/:id/approve` | POST | approverId | status |
| `prepareExport` | Trigger compilation | `/api/projects/:id/compile` | POST | export options | readiness status |
| `downloadExport` | Get export file | `/api/projects/:id/export?format=md\|docx\|pdf` | GET | n/a | file stream |
| `listVersions` | View version timeline | `/api/projects/:id/versions` | GET | n/a | version array |
| `restoreVersion` | Rollback entity | `/api/versions/:id/restore` | POST | entityId | restored entity |

## Minimal API Considerations

- Authentication: JWT with project-level RBAC (owner, collaborator, reviewer).
- Rate limits: enforce per-route throttles to prevent overuse of AI endpoints.
- Webhooks: optional `POST /api/webhooks/moderation` for escalation results.
