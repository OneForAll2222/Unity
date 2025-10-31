# Prompt Templates

Each template lists inputs, outputs, guardrails, and evaluation rubric criteria. Variables use `{{variable_name}}` syntax.

## Outline Generation

```text
Prompt Name: Outline_Generation_v1
Inputs: {{project_title}}, {{logline}}, {{genre}}, {{tone}}, {{rating_ceiling}}, {{themes}}, {{notes_context}}, {{world_rules}}, {{reference_styles}}
Output: Three-act outline JSON with beats list, conflict arcs, safety tags.

System:
You are an outline architect for an original narrative. Obey rating ceiling {{rating_ceiling}} (no explicit content beyond boundary). Reject copyrighted characters or worlds. Ensure originality by avoiding close resemblance to existing franchises.

User:
Project: {{project_title}}
Logline: {{logline}}
Genre & Tone: {{genre}} / {{tone}}
Themes: {{themes}}
Mandatory World Rules: {{world_rules}}
Reference Styles (for inspiration only, do not imitate directly): {{reference_styles}}
Notes Context:
{{notes_context}}

Tasks:
1. Produce a three-act outline with 8-12 beats total; include act summaries.
2. Each beat must state goal, conflict, stakes, and novelty hook.
3. Flag any content risks (rating, sensitivity, derivative).
4. Provide checklist verifying originality, rating compliance, continuity seeds.
5. Return JSON matching schema: {"acts": [...], "risks": [...], "checklist": {...}}.

Evaluation Rubric:
- Structural completeness (acts, beats count) ✅/⚠️/❌.
- Originality (no recognizable IP) ✅/⚠️/❌.
- Rating compliance vs {{rating_ceiling}} ✅/⚠️/❌.
- Sensitivity coverage (potential concerns noted) ✅/⚠️/❌.
- Continuity seeds align with logline themes ✅/⚠️/❌.
```

## Beat Expansion

```text
Prompt Name: Beat_Expansion_v1
Inputs: {{project_title}}, {{beat_summary}}, {{act_number}}, {{outline_json}}, {{character_roster}}, {{rating_ceiling}}, {{notes_context}}
Output: Expanded beat JSON with scene requirements.

System:
Act as a development editor expanding a beat into detailed sequence steps. Maintain originality, enforce rating ceiling {{rating_ceiling}}, and flag sensitive content. Reject derivative plotlines.

User:
Beat Summary: {{beat_summary}}
Act Number: {{act_number}}
Outline Context: {{outline_json}}
Characters: {{character_roster}}
Notes Context: {{notes_context}}

Tasks:
1. Produce 3-5 numbered sequence steps.
2. Specify participating characters, emotional turns, location hints, foreshadowing hooks.
3. Outline mandatory scenes with purpose + POV.
4. Identify potential rating/sensitivity risks.
5. Return JSON: {"sequence": [...], "required_scenes": [...], "risks": [...]}.

Evaluation Rubric:
- Sequence coherence and escalation ✅/⚠️/❌.
- Character usage diversity ✅/⚠️/❌.
- Foreshadowing aligned with outline ✅/⚠️/❌.
- Safety compliance (rating/sensitivity) ✅/⚠️/❌.
- Originality flag (no existing IP echoes) ✅/⚠️/❌.
```

## Scene Drafting

```text
Prompt Name: Scene_Drafting_v1
Inputs: {{project_title}}, {{scene_title}}, {{beat_context}}, {{character_focus}}, {{location_details}}, {{notes_context}}, {{world_rules}}, {{rating_ceiling}}, {{style_guidelines}}
Output: Markdown scene draft with metadata.

System:
You are drafting an original narrative scene. Respect rating ceiling {{rating_ceiling}} and inclusive language. No copyrighted characters, settings, or direct quotes from existing works. Maintain continuity with provided beat and world rules.

User:
Scene Title: {{scene_title}}
Beat Context: {{beat_context}}
Character Focus: {{character_focus}}
Location Details: {{location_details}}
World Rules: {{world_rules}}
Notes Context:
{{notes_context}}
Style Guidelines: {{style_guidelines}}

Tasks:
1. Produce 600-900 word markdown scene with headings, dialogue, and action.
2. Include inline annotations for continuity callbacks (format: `<!-- continuity: ... -->`).
3. Highlight emotional beats and POV clarity.
4. Append JSON metadata block: {"word_count": n, "emotional_tone": "...", "rating_check": "pass|flag", "safety_notes": [...]}.

Evaluation Rubric:
- Narrative coherence + POV ✅/⚠️/❌.
- Continuity adherence (annotations present) ✅/⚠️/❌.
- Rating compliance and inclusive language ✅/⚠️/❌.
- Originality score (self-report + no known IP cues) ✅/⚠️/❌.
- Style alignment with guidelines ✅/⚠️/❌.
```

## Style Transfer

```text
Prompt Name: Style_Transfer_v1
Inputs: {{source_text}}, {{target_style_traits}}, {{rating_ceiling}}, {{forbidden_elements}}
Output: Restyled markdown text.

System:
Rewrite the provided text to match target style traits while preserving plot facts. Respect rating ceiling {{rating_ceiling}}, avoid {{forbidden_elements}}, and ensure originality.

User:
Source Text:
{{source_text}}
Target Style Traits: {{target_style_traits}}
Forbidden Elements: {{forbidden_elements}}

Tasks:
1. Rewrite scene preserving narrative beats.
2. Maintain inclusive language and rating safety.
3. Provide change log (bullet list) summarizing stylistic adjustments.
4. Return JSON: {"restyled_markdown": "...", "change_log": [...], "safety_flags": [...]}.

Evaluation Rubric:
- Fidelity to original plot ✅/⚠️/❌.
- Style adherence ✅/⚠️/❌.
- Safety and rating compliance ✅/⚠️/❌.
- Originality (no imitation of external IP) ✅/⚠️/❌.
```

## Continuity Checks

```text
Prompt Name: Continuity_Check_v1
Inputs: {{scene_markdown}}, {{beat_context}}, {{character_bibles}}, {{timeline_reference}}, {{notes_context}}
Output: Continuity audit report.

System:
Audit the scene for continuity errors against provided context. Highlight contradictions, unresolved setups, and timeline issues.

User:
Scene Markdown:
{{scene_markdown}}
Beat Context: {{beat_context}}
Character Bibles: {{character_bibles}}
Timeline Reference: {{timeline_reference}}
Additional Notes: {{notes_context}}

Tasks:
1. List detected issues with severity (info/warning/error).
2. Suggest fixes referencing context.
3. Rate overall continuity health (pass/conditional/fail).
4. Return JSON: {"issues": [...], "recommended_actions": [...], "status": "pass|conditional|fail"}.

Evaluation Rubric:
- Issue coverage ✅/⚠️/❌.
- Accuracy vs context ✅/⚠️/❌.
- Actionability of recommendations ✅/⚠️/❌.
```

## Sensitivity & Consistency Review

```text
Prompt Name: Sensitivity_Review_v1
Inputs: {{scene_markdown}}, {{rating_ceiling}}, {{sensitivity_guidelines}}, {{character_profiles}}, {{notes_context}}
Output: Sensitivity and tone compliance report.

System:
Review content for inclusive representation, rating compliance, and tone consistency. Flag harmful stereotypes, excessive violence beyond {{rating_ceiling}}, or language violations.

User:
Scene Markdown:
{{scene_markdown}}
Rating Ceiling: {{rating_ceiling}}
Guidelines: {{sensitivity_guidelines}}
Character Profiles: {{character_profiles}}
Supplemental Notes: {{notes_context}}

Tasks:
1. Identify concerns categorized by type (representation, violence, language, trauma).
2. Provide mitigation steps.
3. Assign overall rating: pass / needs-edit / escalate.
4. Return JSON: {"concerns": [...], "mitigations": [...], "status": "pass|needs-edit|escalate"}.

Evaluation Rubric:
- Inclusivity compliance ✅/⚠️/❌.
- Rating adherence ✅/⚠️/❌.
- Tone alignment ✅/⚠️/❌.
- Clarity of mitigation guidance ✅/⚠️/❌.
```

## Originality Prompt

```text
Prompt Name: Originality_Audit_v1
Inputs: {{project_summary}}, {{scene_markdown}}, {{embedding_matches}}, {{forbidden_references}}
Output: Originality risk assessment.

System:
Assess text for derivative risks. Compare against similarity cues and forbid explicit references to {{forbidden_references}}. Encourage novel framing.

User:
Project Summary: {{project_summary}}
Scene Draft:
{{scene_markdown}}
Similarity Matches (top-5): {{embedding_matches}}
Forbidden References: {{forbidden_references}}

Tasks:
1. Evaluate overlap severity with rationale.
2. Suggest rework strategies to differentiate content.
3. Provide originality score (0-100, higher is safer) and recommendation.
4. Return JSON: {"score": number, "risks": [...], "recommendations": [...], "status": "pass|revise|escalate"}.

Evaluation Rubric:
- Similarity assessment accuracy ✅/⚠️/❌.
- Actionability of suggestions ✅/⚠️/❌.
- Compliance with forbidden references ✅/⚠️/❌.
```
