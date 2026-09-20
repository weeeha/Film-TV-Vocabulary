# Creative Vocabulary — Film & TV Atlas

A connected vocabulary for writing, directing, designing, filming, editing, and discussing a movie or television show. Browse by subject, look up a term, or combine entries into a creative brief that an agent can read and edit.

Project repository: [weeeha/Film-TV-Vocabulary](https://github.com/weeeha/Film-TV-Vocabulary).

**Start with the [alphabetical index](INDEX.md), the [reading guide](guides/how-to-use.md), or the [worked discovery scene](examples/discovery-scene.md).**

**Illustration pilot:** [Compare 12 lighting treatments](docs/pilots/lighting-2026-09-20.md) on one neutral subject, with captions and agent-readable asset records.

This first written edition expands all 22 areas of the original outline. Each term has a definition, practical use, and original hypothetical example. Chapters add important distinctions, related topics, sources, and proposed visual interactions with corresponding data fields. The [coverage report](docs/coverage.md) gives current counts.

## Story, structure, and characters

| Chapter | What it helps you describe |
|---|---|
| [01 · Form, format, and genre](wiki/01-form-format-and-genre.md) | Fiction and nonfiction, live action and animation, films and series, genre combinations, and tone |
| [02 · Premise, theme, and meaning](wiki/02-premise-theme-and-meaning.md) | What the work is about, the questions it raises, recurring motifs, symbols, and thematic ideas |
| [03 · Story patterns and dramatic engines](wiki/03-story-patterns-and-dramatic-engines.md) | Quests, investigations, survival, revenge, conflict, stakes, obstacles, and escalation |
| [04 · Narrative structure and time](wiki/04-narrative-structure-and-time.md) | Acts, beats, sequences, turning points, nonlinear chronology, flashbacks, and narrative arrangements |
| [05 · Television storytelling](wiki/05-television-storytelling.md) | Series engines, season and episode arcs, A/B stories, cold opens, cliffhangers, and episode types |
| [06 · Character roles](wiki/06-character-roles.md) | Protagonists, antagonists, foils, allies, narrators, confidants, and other story functions |
| [07 · Character archetypes and construction](wiki/07-character-archetypes-and-construction.md) | Mentors, tricksters, outsiders, antiheroes, motivations, beliefs, flaws, and agency |
| [08 · Character arcs and relationships](wiki/08-character-arcs-and-relationships.md) | Growth, decline, redemption, corruption, trust, rivalry, rupture, and repair |

## World, scenes, and performance

| Chapter | What it helps you describe |
|---|---|
| [09 · World and setting](wiki/09-world-and-setting.md) | Places, eras, social systems, infrastructure, world rules, limitations, weather, and time of day |
| [10 · Scenes and sequences](wiki/10-scenes-and-sequences.md) | Discoveries, confrontations, negotiations, chases, meals, reunions, reveals, and internal scene changes |
| [11 · Perspective and audience experience](wiki/11-perspective-and-audience-experience.md) | Who knows what, subjective experience, suspense, surprise, curiosity, empathy, and distance |
| [12 · Dialogue, performance, and blocking](wiki/12-dialogue-performance-and-blocking.md) | Subtext, delivery, silence, gestures, objectives, tactics, movement, and spatial relationships |
| [13 · Production design and appearance](wiki/13-production-design-and-appearance.md) | Sets, locations, props, costume, materials, texture, silhouette, patina, and visual continuity |

## Image, sound, and construction

| Chapter | What it helps you describe |
|---|---|
| [14 · Shot size, angle, and composition](wiki/14-shot-size-angle-and-composition.md) | Close-ups, wide shots, viewpoint, subject arrangement, shot functions, negative space, and aspect ratio |
| [15 · Camera movement and support](wiki/15-camera-movement-and-support.md) | Pans, tilts, dolly moves, tracking, handheld and stabilized support, paths, speed, and duration |
| [16 · Lens, focus, and image capture](wiki/16-lens-focus-and-image-capture.md) | Focal length, field of view, depth of field, exposure, frame rate, shutter, grain, and optical character |
| [17 · Lighting and color](wiki/17-lighting-and-color.md) | Key and fill, light quality and direction, motivated sources, contrast, palette, and grading |
| [18 · Editing, transitions, and pace](wiki/18-editing-transitions-and-pace.md) | Cuts, dissolves, montage, continuity, cross-cutting, split edits, shot duration, and rhythm |
| [19 · Sound, voice, and music](wiki/19-sound-voice-and-music.md) | Dialogue, ambience, Foley, diegetic sound, perspective, score, musical motifs, and audio texture |
| [20 · Animation, effects, and mixed techniques](wiki/20-animation-effects-and-mixed-techniques.md) | Animation methods, timing, spacing, practical effects, compositing, and integration |
| [21 · Documentary and nonfiction](wiki/21-documentary-and-nonfiction.md) | Documentary modes, interviews, archives, reconstruction, evidence, participation, and attribution |
| [22 · References and creative constraints](wiki/22-references-and-creative-constraints.md) | What to borrow from references, dimension-specific influence, exclusions, priorities, and decision status |

## How the vocabulary fits together

A character's **role**, **archetype**, **motivation**, and **arc** are different dimensions. A scene's **activity**, **dramatic function**, **setting**, and **audience information** are also different dimensions. A shot combines **size**, **angle**, **composition**, **movement**, **lens**, and **purpose**.

For example: an outsider protagonist pursuing belonging can discover a betrayal during a family meal, presented through restricted narration, a restrained performance, and an uninterrupted medium shot. Each choice can be discussed or changed without replacing the entire description.

The taxonomy is editorial and expandable. It does not claim that all cinema follows one set of archetypes, structures, or emotional effects. Named frameworks and terminology differences are identified in the chapters.

## Guides and editable data

- [How to use the atlas](guides/how-to-use.md): reading routes and practical combinations.
- [Writing and extending an entry](guides/entry-template.md): common format, sources, IDs, and maintenance.
- [Agent-readable representation](guides/agent-representation.md): definitions versus project decisions, proposed controls, units, unknown values, and reference influence.
- [Worked discovery scene](examples/discovery-scene.md): one scene described in prose and [editable JSON](examples/discovery-scene.json).
- [Vocabulary catalog](data/catalog.json): generated definitions, uses, examples, IDs, and source locations.
- [Decision schema](data/decision.schema.json): a common envelope for agent-editable creative choices.
- [Content coverage](docs/coverage.md): counts by chapter.
- [Original outline](docs/initial-outline.md): the initial proposal retained for comparison.

## What this edition contains

This repository contains a searchable Next.js/Fumadocs wiki, the source Markdown, a structured vocabulary export, and 12 generated lighting illustrations. The illustrations are candidates for the visual vocabulary, not calibrated lighting simulations. The reader includes chapter navigation, search, an A–Z index, and a lighting comparison gallery. Simulators and creative generation controls described in chapters remain design proposals; no generation backend is included. Film clips, audio demonstrations, and finished storyboards are not bundled.

Technical and theoretical source checks appear in each chapter. Those checks support specific distinctions; they do not turn the entire taxonomy into an industry standard or prove that a creative choice will produce a particular audience response.

## Maintain and verify

Edit the chapter Markdown, preserving existing term-ID comments. Then run:

```sh
python3 scripts/build_catalog.py
python3 scripts/build_catalog.py --check
```

The builder refreshes the alphabetical index, catalog, and coverage report from the same content. The checker verifies entry fields, IDs, local links, generated-file consistency, and the worked example's references. A schema validator can additionally check each decision against `data/decision.schema.json`.

## Website

Read the atlas at [film-tv-atlas.vercel.app](https://film-tv-atlas.vercel.app). See the [release verification](docs/site-verification.md) for tested behavior and publishing status.

## Website development

Use Node 24. Run `npm ci`, then `npm run dev` for the local reader. Restart after Markdown edits. Before publishing, regenerate editorial outputs with `npm run content:build` and run `npm run content:check`, `npm run test:unit`, `npm run typecheck`, `npm run build`, and `npm run test:e2e`.

See [site maintenance](docs/site-maintenance.md) for the authoring workflow.
