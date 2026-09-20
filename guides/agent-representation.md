# Agent-readable representation

[Wiki home](../README.md) · [Alphabetical index](../INDEX.md)

The atlas separates reusable vocabulary from a particular project's decisions. An agent can read a term's meaning from the catalog, then use its identifier in a creative brief. Selecting a term does not execute a camera move, generate footage, or verify an audience response.

## The four records

| Record | Purpose | Where it lives in this edition |
|---|---|---|
| Vocabulary entry | Meaning, use, and example of a term | Chapter Markdown and [generated catalog](../data/catalog.json) |
| Entity | A specific work, person, place, scene, or shot | `entities` in the [worked example](../examples/discovery-scene.json) |
| Creative decision | A selected dimension, terms, parameters, and intention | `decisions` in the worked example |
| Reference | A cited source or original reference description and its scope | `reference_library` plus decision-level reference links |

An entry ID such as `scenes-and-sequences.discovery` identifies a reusable concept. An entity ID such as `scene_station_01` identifies one invented scene. They should never be interchangeable.

## Catalog fields

Each catalog entry has `id`, `name`, `chapter_id`, `group`, `definition`, `use`, `example`, `source_path`, and `anchor`. The three prose fields can contain Markdown links. They are content to read, not commands for an agent to execute.

The catalog also records chapter counts and file hashes so the builder can detect stale exports. Term IDs are stored in comments inside the Markdown and preserved when labels are edited. The same display name can appear in several chapters with different IDs because its context or scale differs.

The first edition links related chapters. It does not yet assert a complete machine-readable graph of synonym, contrast, dependency, and compatibility relationships. Do not infer that two terms are synonyms just because their examples resemble one another.

## Decision fields

The [decision schema](../data/decision.schema.json) describes the common envelope. The [worked JSON example](../examples/discovery-scene.json) combines several envelopes into one scene brief.

| Field | Meaning |
|---|---|
| `id` | Persistent identifier for this decision |
| `scope` | Kind and ID of the project entity being described |
| `dimension` | Independent property, such as `camera.movement` or `scene.function` |
| `term_ids` | Zero or more vocabulary IDs; compatible labels can coexist |
| `parameters` | Named values specific to this dimension, with units in their names where needed |
| `intent` | Why the choice was made, expressed as editable prose |
| `status` | Candidate, working, established, or open; a project convention |
| `references` | Dimension-specific links to reference records |

`parameters` is deliberately extensible. This envelope does not claim to be a physically complete camera schema or a universal API for generation providers. A real adapter must define accepted parameter names, units, ranges, coordinate systems, dependencies, and unsupported choices.

## Visual controls should edit the same values

| Dimension | Proposed visual interaction | Shared saved value |
|---|---|---|
| Character role | Select role cards | `term_ids` |
| Relationship | Connect entities and annotate change | Entity IDs and relationship parameters |
| Story structure | Reorder beat cards | Ordered beat IDs, dependencies, and notes |
| Camera movement | Drag a camera path; scrub its duration | Path coordinates, coordinate system, duration |
| Lighting | Position a light or compare schematic setups | Source direction, quality, color, intensity |
| Pace | Compare shot-length and action-density tracks | Durations, pauses, event notes |
| Framing | Adjust a composition preview | Size, angle, placement, aspect ratio |
| Reference influence | Select low, medium, or high per dimension | Reference link, dimension, influence, adaptation note |

These are proposed interactions. This edition provides the content and data shape, not functioning controls or simulation. Where a future preview lacks scene geometry or physical calibration, label it schematic. An interface should not imply that a framing label alone solves a camera setup.

## Unknown, inherited, and conflicting values

- Use `null` for a parameter intentionally left undecided in a record. Omission means the record does not specify that parameter. An adapter may impose more specific rules, but must document them.
- Do not silently replace an unknown value with an estimate and then treat it as measured.
- If project-wide defaults are added later, preserve where a value came from. Show a shot-level override separately from a series-level default.
- Report incompatible decisions rather than overwriting one. For example, constant subject scale while moving the camera may require focal-length changes or blocking; it is not implied by a dolly-in label alone.
- Preserve free-text intent when a requested effect does not fit the existing vocabulary. New terms can be proposed without pretending they are established practice.

## Reference influence

Influence is a qualitative project convention, not a universal similarity score or a model weight. Use the labels with explicit anchors:

| Value | Intended relationship |
|---|---|
| `low` | Borrow a broad cue in the named dimension; substantial variation is expected |
| `medium` | Adapt several recognizable features while serving the new scene's needs |
| `high` | Follow the named dimension closely, subject to the recorded exclusions and constraints |

High influence for camera movement does not grant high influence for costumes, character design, dialogue, or composition. Record those dimensions separately. A renderer may not support reference strength at all; its limitations must remain visible.

## How an agent should make a change

Read the entity, current decision, relevant term definitions, constraints, and references first. Change only the selected dimension unless the request authorizes broader revision. Preserve IDs and unresolved values. Describe both the changed value and the creative reason. Validate that term references resolve, values use the required units, and linked entities exist.

For example, changing `duration_seconds` from `8` to `12` lengthens a specified camera move. It does not automatically slow the actors, extend every edit, or change the music tempo. Those are separate decisions that can be discussed if the new duration creates a conflict.

Store intended and observed outcomes separately. “Intended to build unease” can be present before any image exists. “Viewers felt uneasy” requires actual review evidence.

## Validation boundaries

The repository checker verifies entry structure, stable IDs, generated files, local links, and the worked example's term/entity/reference links and basic conventions. The JSON Schema validates each decision's envelope when used with a Draft 2020-12 validator. Neither check proves a camera path is feasible, a reference is licensed, a term is universally accepted, or a scene communicates its intended feeling.

## Maintaining the catalog

Edit a chapter entry, preserve its term-ID comment, and run `python3 scripts/build_catalog.py`. For newly added entries without ID comments, run `python3 scripts/build_catalog.py --assign-ids` once, review the assigned IDs, then run the normal check. Do not hand-edit the generated index or catalog: the next build replaces them from the chapter source.
