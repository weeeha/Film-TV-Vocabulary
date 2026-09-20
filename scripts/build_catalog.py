#!/usr/bin/env python3
"""Build the wiki index/catalog and check their agreement with chapter Markdown."""

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
TERM_RE = re.compile(r"^### ([^\n]+)\n(.*?)(?=^#{1,3} |\Z)", re.M | re.S)
ID_RE = re.compile(r"<!-- term-id: ([a-z0-9][a-z0-9.-]+) -->")
EXPECTED_CHAPTERS = list(range(1, 23))


def anchor(text):
    text = re.sub(r"[`*_]", "", text).lower().strip()
    text = "".join(c for c in text if c.isalnum() or c in "-_ ")
    return text.replace(" ", "-")


def term_slug(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def unfenced(text):
    return re.sub(r"^```[^\n]*\n.*?^```\s*$", "", text, flags=re.M | re.S)


def all_anchors(text):
    seen = Counter()
    result = set()
    for heading in re.findall(r"^#{1,6} (.+)$", unfenced(text), re.M):
        slug = anchor(heading)
        result.add(slug if seen[slug] == 0 else f"{slug}-{seen[slug]}")
        seen[slug] += 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', text))
    return result


def field(body, label):
    match = re.search(rf"\*\*{label}\.\*\*\s*(.*?)(?=\n\*\*(?:Definition|Use|Example)\.\*\*|\Z)", body, re.S)
    return match.group(1).strip() if match else ""


def collect(assign_ids=False):
    chapters, entries, errors = [], [], []
    files = sorted((ROOT / "wiki").glob("*.md"))
    numbers = [int(p.name.split("-", 1)[0]) for p in files]
    if numbers != EXPECTED_CHAPTERS:
        errors.append(f"Expected chapters 01–22; found {numbers}")
    for path in files:
        chapter_id = path.stem.split("-", 1)[1]
        text = path.read_text()
        if assign_ids:
            def assign(match):
                label, body = match.group(1), match.group(2)
                if ID_RE.search(body):
                    return match.group(0)
                return f"### {label}\n<!-- term-id: {chapter_id}.{term_slug(label)} -->\n{body}"
            updated = TERM_RE.sub(assign, text)
            if updated != text:
                path.write_text(updated)
                text = updated
        title_match = re.search(r"^# (.+)$", text, re.M)
        title = title_match.group(1) if title_match else path.stem
        path_string = path.relative_to(ROOT).as_posix()
        chapter_entries = []
        seen_anchors = Counter()
        for match in TERM_RE.finditer(text):
            label, body = match.group(1), match.group(2)
            id_match = ID_RE.search(body)
            entry_id = id_match.group(1) if id_match else f"{chapter_id}.{term_slug(label)}"
            if not id_match:
                errors.append(f"{path_string}: {label}: missing stable term-id comment")
            slug = anchor(label)
            term_anchor = slug if seen_anchors[slug] == 0 else f"{slug}-{seen_anchors[slug]}"
            seen_anchors[slug] += 1
            group_matches = re.findall(r"^## (.+)$", text[:match.start()], re.M)
            entry = {
                "id": entry_id,
                "name": label,
                "chapter_id": chapter_id,
                "group": group_matches[-1] if group_matches else "Vocabulary",
                "definition": field(body, "Definition"),
                "use": field(body, "Use"),
                "example": field(body, "Example"),
                "source_path": path_string,
                "anchor": term_anchor,
            }
            for label_key in ("definition", "use", "example"):
                if not entry[label_key]:
                    errors.append(f"{path_string}: {label}: missing {label_key}")
            if sum(len(entry[k].split()) for k in ("definition", "use", "example")) < 30:
                errors.append(f"{path_string}: {label}: entry too short for detailed coverage")
            chapter_entries.append(entry)
        for required in ("## Visual interaction and structured fields", "## Related chapters", "## Sources and terminology notes"):
            if required not in text:
                errors.append(f"{path_string}: missing {required}")
        chapters.append({
            "id": chapter_id,
            "number": int(path.name[:2]),
            "title": title,
            "source_path": path_string,
            "entry_count": len(chapter_entries),
            "word_count": len(re.sub(r"<!--.*?-->", "", text, flags=re.S).split()),
            "sha256": hashlib.sha256(text.encode()).hexdigest(),
        })
        entries.extend(chapter_entries)
    duplicates = [k for k, v in Counter(e["id"] for e in entries).items() if v > 1]
    if duplicates:
        errors.append(f"Duplicate term IDs: {duplicates}")
    return chapters, entries, errors


def seed_coverage(chapters, entries):
    """Map each original outline label to a contextual glossary entry."""
    path = ROOT / "docs/initial-outline.md"
    original = path.read_text().split("## Connections matter")[0]
    coverage, errors = [], []

    def normalize(text):
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
        return re.sub(r"[^a-z0-9]", "", text.replace("approaches", "approach"))

    for match in re.finditer(r"^### (\d+)\. ([^\n]+)\n(.*?)(?=^### |\Z)", original, re.M | re.S):
        number = int(match.group(1))
        chapter = next((c for c in chapters if c["number"] == number), None)
        if not chapter:
            errors.append(f"Seed coverage: missing chapter {number}")
            continue
        candidates = [e for e in entries if e["chapter_id"] == chapter["id"]]
        for line in match.group(3).splitlines():
            if not line.startswith("- "):
                continue
            line = re.sub(r"^- (\*\*[^*]+\*\* )?", "", line).rstrip(".")
            line = re.sub(r"^[^:]+:\s*", "", line)
            for label in line.split(","):
                label = label.strip()
                matches = [e for e in candidates if normalize(label) in normalize(e["name"])]
                matches.sort(key=lambda e: len(normalize(e["name"])))
                if not matches:
                    errors.append(f"Uncovered outline term in chapter {number}: {label}")
                    continue
                coverage.append({"chapter_number": number, "outline_label": label, "entry_id": matches[0]["id"]})
    return coverage, errors


def render(chapters, entries, seeds):
    chapter_names = {c["id"]: re.sub(r"^\d+[. ·]*", "", c["title"]) for c in chapters}
    catalog = {
        "schema_version": "1.0",
        "title": "Creative Vocabulary — Film & TV Atlas",
        "content_status": "first_edition",
        "source_of_truth": "wiki/*.md",
        "notes": "Editorial taxonomy. Examples are hypothetical; controls described in chapters are proposals. Repeated names in different chapters are context-specific entries.",
        "chapter_count": len(chapters),
        "entry_count": len(entries),
        "chapters": chapters,
        "entries": entries,
    }
    lines = ["# Alphabetical vocabulary index", "", "[Wiki home](README.md) · [Reading guide](guides/how-to-use.md)", "", f"**{len(entries)} contextual entries across {len(chapters)} chapters.** Repeated names show their chapter so you can choose the relevant meaning. All entries include a definition, practical use, and hypothetical example.", ""]
    groups = {}
    for entry in sorted(entries, key=lambda e: (e["name"].casefold(), e["chapter_id"])):
        first = entry["name"][0].upper()
        groups.setdefault(first if first.isalpha() else "0–9", []).append(entry)
    lines += [" · ".join(f"[{key}](#{anchor(key)})" for key in groups), ""]
    for key, terms in groups.items():
        lines += [f"## {key}", ""]
        for entry in terms:
            lines.append(f"- [{entry['name']}]({entry['source_path']}#{entry['anchor']}) — {chapter_names[entry['chapter_id']]}")
        lines.append("")
    report = ["# Content coverage", "", "[Wiki home](../README.md) · [Alphabetical index](../INDEX.md)", "", "Generated from the chapter files. Counts describe written contextual entries, not unique words, media assets, or implemented controls.", "", "| Chapter | Entries | Words |", "|---|---:|---:|"]
    for chapter in chapters:
        report.append(f"| [{chapter['title']}](../{chapter['source_path']}) | {chapter['entry_count']} | {chapter['word_count']:,} |")
    report += [f"| **Total** | **{len(entries)}** | **{sum(c['word_count'] for c in chapters):,}** |", "", f"All **{len(seeds)} seed labels** in the original outline's category lists map to written entries. The [seed mapping](../data/seed-coverage.json) records those links; aliases and singular/plural variants can share an entry.", "", "Each entry has a definition, use, example, and persistent ID. Chapter-level controls and source notes accompany the prose. Visual examples are described in text; this edition does not bundle film clips, audio demonstrations, or an interactive renderer.", ""]
    return {
        ROOT / "data/catalog.json": json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        ROOT / "INDEX.md": "\n".join(lines),
        ROOT / "docs/coverage.md": "\n".join(report),
        ROOT / "data/seed-coverage.json": json.dumps({"source": "docs/initial-outline.md", "mapped_label_count": len(seeds), "mappings": seeds}, ensure_ascii=False, indent=2) + "\n",
    }


def authored_markdown_paths(root):
    paths = [root / 'README.md', root / 'INDEX.md', root / 'docs/coverage.md', root / 'docs/initial-outline.md']
    for folder in ('wiki', 'guides', 'examples', 'docs/pilots'):
        paths.extend((root / folder).rglob('*.md'))
    return sorted(p for p in paths if p.is_file())


def check_links():
    errors = []
    for path in authored_markdown_paths(ROOT):
        if any(part.startswith(".") for part in path.relative_to(ROOT).parts):
            continue
        text = unfenced(path.read_text())
        for href in re.findall(r"\]\(([^\s)]+)(?:\s+\"[^\"]*\")?\)", text):
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", href):
                continue
            base, _, fragment = unquote(href).partition("#")
            target = (path.parent / base).resolve() if base else path
            if not target.exists():
                errors.append(f"{path.relative_to(ROOT)}: missing link target {href}")
            elif fragment and target.suffix == ".md" and fragment not in all_anchors(target.read_text()):
                errors.append(f"{path.relative_to(ROOT)}: missing anchor {href}")
    return errors


def check_example(entries):
    errors = []
    path = ROOT / "examples/discovery-scene.json"
    if not path.exists():
        return ["Missing examples/discovery-scene.json"]
    obj = json.loads(path.read_text())
    ids = {e["id"] for e in entries}
    decisions = obj.get("decisions", [])
    decision_ids = [d.get("id") for d in decisions]
    if len(decision_ids) != len(set(decision_ids)):
        errors.append("Duplicate example decision IDs")
    entities = {e["id"] for e in obj.get("entities", [])}
    reference_ids = {r["id"] for r in obj.get("reference_library", [])}
    for decision in decisions:
        for key in ("id", "scope", "dimension", "term_ids", "parameters", "intent", "status", "references"):
            if key not in decision:
                errors.append(f"Decision {decision.get('id')}: missing {key}")
        for term_id in decision.get("term_ids", []):
            if term_id not in ids:
                errors.append(f"Unknown term ID in example: {term_id}")
        if decision.get("scope", {}).get("entity_id") not in entities:
            errors.append(f"Unknown decision scope: {decision.get('id')}")
        if decision.get("status") not in ("candidate", "working", "established", "open"):
            errors.append(f"Invalid decision status: {decision.get('id')}")
        duration = decision.get("parameters", {}).get("duration_seconds")
        if duration is not None and (not isinstance(duration, (int, float)) or isinstance(duration, bool) or duration <= 0):
            errors.append(f"Invalid duration: {decision.get('id')}")
        for reference in decision.get("references", []):
            if reference.get("reference_id") not in reference_ids:
                errors.append(f"Unresolved reference: {reference.get('reference_id')}")
            if reference.get("influence") not in ("low", "medium", "high"):
                errors.append("Reference influence must be low, medium, or high")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check without writing generated files")
    parser.add_argument("--assign-ids", action="store_true", help="Assign persistent ID comments to new Markdown entries")
    args = parser.parse_args()
    if args.check and args.assign_ids:
        parser.error("--check cannot be combined with --assign-ids")
    chapters, entries, errors = collect(args.assign_ids)
    seeds, seed_errors = seed_coverage(chapters, entries)
    errors.extend(seed_errors)
    outputs = render(chapters, entries, seeds)
    if not errors:
        for path, expected in outputs.items():
            if args.check:
                if not path.exists() or path.read_text() != expected:
                    errors.append(f"Generated file out of date: {path.relative_to(ROOT)}")
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(expected)
    errors.extend(check_links())
    errors.extend(check_example(entries))
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    verb = "Checked" if args.check else "Built and checked"
    print(f"{verb} {len(chapters)} chapters, {len(entries)} contextual entries, local links, and example references.")
    print(f"Chapter words: {sum(c['word_count'] for c in chapters):,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
