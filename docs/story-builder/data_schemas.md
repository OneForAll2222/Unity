# Data Schemas (JSON Documents)

```json
{
  "Project": {
    "id": "uuid",
    "ownerId": "uuid",
    "title": "string",
    "logline": "string",
    "genre": "string",
    "tone": "string",
    "ratingCeiling": "enum: ['PG', 'PG-13', 'R']",
    "workflowMode": "enum: ['no-code', 'vs-code']",
    "status": "enum: ['onboarding', 'outline', 'beats', 'world', 'drafting', 'review', 'compile', 'exported']",
    "currentVersionId": "uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "metadata": {
      "tags": ["string"],
      "language": "string",
      "wordCount": "integer"
    }
  },
  "Outline": {
    "id": "uuid",
    "projectId": "uuid",
    "versionId": "uuid",
    "acts": [
      {
        "actNumber": "integer",
        "summary": "string",
        "beats": ["string"]
      }
    ],
    "themes": ["string"],
    "conflicts": ["string"],
    "safetyReview": {
      "rating": "string",
      "copyrightFlags": ["string"],
      "sensitivityNotes": ["string"],
      "status": "enum: ['pending', 'passed', 'failed']"
    },
    "createdAt": "timestamp"
  },
  "Beat": {
    "id": "uuid",
    "projectId": "uuid",
    "outlineId": "uuid",
    "title": "string",
    "sequenceOrder": "integer",
    "goal": "string",
    "conflict": "string",
    "stakes": "string",
    "summary": "string",
    "requiredScenes": ["uuid"],
    "notes": "string",
    "reviewStatus": "enum: ['draft', 'needs-revision', 'approved']",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "Scene": {
    "id": "uuid",
    "projectId": "uuid",
    "beatId": "uuid",
    "title": "string",
    "sceneType": "enum: ['action', 'dialogue', 'montage', 'mixed']",
    "povCharacterId": "uuid",
    "locationId": "uuid",
    "draftMarkdown": "string",
    "continuityFindings": [
      {
        "type": "enum: ['character', 'timeline', 'logic']",
        "status": "enum: ['pass', 'warning', 'fail']",
        "message": "string"
      }
    ],
    "safetyFindings": [
      {
        "type": "enum: ['rating', 'sensitivity', 'copyright']",
        "status": "enum: ['pass', 'warning', 'fail']",
        "message": "string"
      }
    ],
    "originalityScore": "number",
    "versionId": "uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "Character": {
    "id": "uuid",
    "projectId": "uuid",
    "name": "string",
    "role": "string",
    "archetype": "string",
    "description": "string",
    "relationships": [
      {
        "characterId": "uuid",
        "description": "string"
      }
    ],
    "safetyFlags": ["string"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "Location": {
    "id": "uuid",
    "projectId": "uuid",
    "name": "string",
    "type": "string",
    "description": "string",
    "timePeriod": "string",
    "safetyFlags": ["string"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "Note": {
    "id": "uuid",
    "projectId": "uuid",
    "entityType": "enum: ['world', 'character', 'plot', 'research']",
    "title": "string",
    "content": "markdown",
    "embeddingVector": ["float"],
    "tags": ["string"],
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "Version": {
    "id": "uuid",
    "projectId": "uuid",
    "entityType": "enum: ['project', 'outline', 'beat', 'scene', 'character', 'location']",
    "entityId": "uuid",
    "snapshot": "json",
    "diff": "json",
    "createdAt": "timestamp",
    "createdBy": "uuid",
    "label": "string"
  },
  "Autosave": {
    "id": "uuid",
    "projectId": "uuid",
    "entityType": "string",
    "entityId": "uuid",
    "delta": "json-patch",
    "createdAt": "timestamp"
  }
}
```
