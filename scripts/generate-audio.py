#!/usr/bin/env python3
"""
Pre-generate natural neural MP3 audio for Grade 2 Stars using `edge-tts`.

Outputs:
  - public/audio/<sha1-of-text>.mp3
  - public/audio-manifest.json   (maps each clean spoken text -> "audio/<sha1>.mp3")

Usage:
  pip install edge-tts
  python scripts/generate-audio.py
  python scripts/generate-audio.py --dry-run
  python scripts/generate-audio.py --force
"""

import argparse
import asyncio
import glob
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# ==============================================================================
# Voice Settings — Edit these constants and re-run to change the voice or speed
# Popular child-friendly US English voices:
#   "en-US-AnaNeural"   (friendly, child-like — default)
#   "en-US-JennyNeural" (warm teacher voice)
#   "en-US-AriaNeural"  (clear & expressive)
#   "en-US-GuyNeural"   (friendly male voice)
# List all voices via: python -m edge_tts --list-voices
# ==============================================================================
VOICE = "en-US-AnaNeural"
RATE = "-10%"
PITCH = "+0Hz"

CONCURRENCY = 8
MAX_RETRIES = 3

ROOT_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
AUDIO_DIR = PUBLIC_DIR / "audio"
MANIFEST_PATH = PUBLIC_DIR / "audio-manifest.json"
VOICE_META_PATH = AUDIO_DIR / ".voice-config.json"

EMOJI_RE = re.compile(
    r"[\u2600-\u27BF\uFE00-\uFE0F\u200D\U0001F000-\U0001FAFF]+"
)


def clean_text_for_speech(text: str) -> str:
    """Must stay 1-to-1 aligned with cleanTextForSpeech() in src/utils/speech.js."""
    if text is None:
        return ""
    s = str(text)
    s = re.sub(r"_+", "blank", s)
    s = s.replace("\u2192", ", ")
    s = s.replace("|", ". ")
    s = s.replace("•", ", ")
    s = s.replace("/", ", ")
    s = re.sub(r"(^|[^\w])-es\b", r"\1E S", s, flags=re.IGNORECASE)
    s = re.sub(r"(^|[^\w])-s\b", r"\1S", s, flags=re.IGNORECASE)
    s = EMOJI_RE.sub("", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def add_text(bucket: dict, raw_text: str):
    cleaned = clean_text_for_speech(raw_text)
    if not cleaned:
        return
    # Ensure at least one alphanumeric character exists
    if not re.search(r"[A-Za-z0-9]", cleaned):
        return
    if cleaned not in bucket:
        sha1 = hashlib.sha1(cleaned.encode("utf-8")).hexdigest()
        bucket[cleaned] = sha1


def split_sentences(text: str):
    if not text:
        return []
    matches = re.findall(r"[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$", text)
    return [m.strip() for m in matches if m.strip()]


def collect_q2_content(bucket: dict):
    q2_pattern = str(ROOT_DIR / "src" / "terms" / "q2" / "subjects" / "*" / "content" / "*.json")
    for path_str in sorted(glob.glob(q2_pattern)):
        with open(path_str, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Lessons (flashcards + mini-activities)
        for lesson in data.get("lessons", []) or []:
            add_text(bucket, lesson.get("title"))
            add_text(bucket, lesson.get("hint"))

            for card in lesson.get("cards", []) or []:
                add_text(bucket, card.get("word"))
                add_text(bucket, card.get("frontTitle"))
                add_text(bucket, card.get("backTitle"))
                add_text(bucket, card.get("explanation"))
                add_text(bucket, card.get("example"))
                add_text(bucket, card.get("speechText"))

                examples = card.get("examples") or []
                for ex in examples:
                    add_text(bucket, ex)
                if examples:
                    add_text(bucket, ". ".join(str(x) for x in examples))

                words = card.get("words") or []
                extra_words = card.get("extraWords") or []
                all_words = [*words, *extra_words]
                for w in all_words:
                    add_text(bucket, w)
                if all_words:
                    add_text(bucket, ", ".join(all_words))

            activity = lesson.get("activity") or {}
            act_type = activity.get("type")
            add_text(bucket, activity.get("instruction"))
            for item in activity.get("items", []) or []:
                if act_type == "sort_buckets":
                    add_text(bucket, item.get("word"))
                elif act_type == "tap_plural":
                    singular = item.get("singular", "")
                    if singular:
                        add_text(bucket, f"What is the plural of {singular}?")
                    for opt in item.get("options", []) or []:
                        add_text(bucket, opt)
                    add_text(bucket, item.get("answer"))
                    add_text(bucket, item.get("explanation"))
                elif act_type == "fix_sentence":
                    wrong = item.get("wrongSentence", "")
                    if wrong:
                        add_text(bucket, f"Fix the sentence: {wrong}")
                    for opt in item.get("options", []) or []:
                        add_text(bucket, opt)
                    add_text(bucket, item.get("answer"))
                    add_text(bucket, item.get("explanation"))

            for pair in activity.get("allPairs", []) or []:
                if isinstance(pair, list):
                    for part in pair:
                        add_text(bucket, part)

        # Structured Worksheet Practice sections
        for practice in data.get("practices", []) or []:
            add_text(bucket, practice.get("instruction"))
            add_text(bucket, practice.get("hint"))

        # Structured Week Quiz (and Worksheet Practice questions)
        quiz = data.get("quiz") or {}
        if quiz:
            add_text(bucket, quiz.get("instruction"))
            add_text(bucket, quiz.get("hint"))
            for q in quiz.get("questions", []) or []:
                instruction = q.get("prompt") or q.get("instruction") or quiz.get("instruction") or ""
                if instruction:
                    add_text(bucket, instruction.rstrip(":"))
                passage = q.get("passage") or {}
                if isinstance(passage, dict):
                    if passage.get("title"):
                        add_text(bucket, passage.get("title"))
                    sents = passage.get("sentences") or []
                    for s in sents:
                        add_text(bucket, s)
                    if sents:
                        add_text(bucket, " ".join(sents))
                text = q.get("text") or ""
                add_text(bucket, text)
                for opt in q.get("options", []) or []:
                    add_text(bucket, opt)
                add_text(bucket, q.get("hint"))
                ans = q.get("answer")
                expl = q.get("explanation") or (f'The correct answer is "{ans}".' if ans else "")
                add_text(bucket, expl)

        # Generic flat Q2 topic files (if added later for other subjects)
        for item in data.get("items", []) or (data if isinstance(data, list) else []):
            if isinstance(item, dict):
                add_text(bucket, item.get("prompt"))
                add_text(bucket, item.get("text"))
                add_text(bucket, item.get("explanation"))
                add_text(bucket, item.get("hint"))
                for opt in item.get("options", []) or []:
                    add_text(bucket, opt)


def collect_q1_english(bucket: dict):
    eng_path = ROOT_DIR / "content-source" / "q1" / "english_content.json"
    if not eng_path.exists():
        return
    with open(eng_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for topic in data.get("topics", []) or []:
        topic_instr = (topic.get("instruction") or "").strip().rstrip(":")
        add_text(bucket, topic_instr)
        add_text(bucket, topic.get("hint"))

        for item in topic.get("items", []) or []:
            item_instr = (item.get("prompt") or item.get("instruction") or "").strip().rstrip(":")
            if item_instr:
                add_text(bucket, item_instr)
            add_text(bucket, item.get("text"))
            for opt in item.get("options", []) or []:
                add_text(bucket, opt)
            for pair in item.get("pairs", []) or []:
                if isinstance(pair, list) and len(pair) >= 1:
                    add_text(bucket, pair[0])
                    if len(pair) >= 2:
                        add_text(bucket, pair[1])
            passage = item.get("passage") or {}
            if isinstance(passage, dict):
                if passage.get("title"):
                    add_text(bucket, passage.get("title"))
                sents = passage.get("sentences") or []
                for s in sents:
                    add_text(bucket, s)
                if sents:
                    add_text(bucket, " ".join(sents))

            ans = item.get("answer")
            expl = item.get("explanation") or (
                f'The correct answer is: "{ans}"' if ans else "Review the matching pairs and try again!"
            )
            add_text(bucket, expl)


def collect_q1_reading(bucket: dict):
    pattern = str(ROOT_DIR / "src" / "terms" / "q1" / "subjects" / "reading" / "content" / "*.json")
    for path_str in sorted(glob.glob(pattern)):
        with open(path_str, "r", encoding="utf-8") as f:
            items = json.load(f)
        if not isinstance(items, list):
            continue
        for item in items:
            prompt = (item.get("prompt") or "").strip()
            base_prompt = prompt.rstrip(":")
            add_text(bucket, base_prompt)
            add_text(bucket, item.get("promptSpeech"))
            add_text(bucket, item.get("hint"))
            add_text(bucket, item.get("explanation"))

            data = item.get("data") or {}
            item_text = (
                data.get("sentence")
                or data.get("paragraph")
                or data.get("story")
                or data.get("clueSentence")
                or data.get("pictureLabel")
                or ""
            ).strip()
            if item_text:
                add_text(bucket, item_text)
                if base_prompt and item_text.lower() not in base_prompt.lower():
                    add_text(bucket, f"{base_prompt}. {item_text}")

            passage = data.get("passage") or ""
            if passage:
                add_text(bucket, passage)
                for para in [p for p in passage.split("\n\n") if p.strip()]:
                    for sent in split_sentences(para):
                        add_text(bucket, sent)

            for opt in data.get("options", []) or []:
                add_text(bucket, opt)


def collect_q1_social_studies(bucket: dict):
    pattern = str(ROOT_DIR / "src" / "terms" / "q1" / "subjects" / "social_studies" / "content" / "*.json")
    for path_str in sorted(glob.glob(pattern)):
        with open(path_str, "r", encoding="utf-8") as f:
            data = json.load(f)

        topic_instr = (data.get("instruction") or "").strip().rstrip(":")
        add_text(bucket, topic_instr)
        add_text(bucket, data.get("hint"))

        for item in data.get("items", []) or []:
            item_instr = (item.get("prompt") or item.get("instruction") or "").strip().rstrip(":")
            if item_instr:
                add_text(bucket, item_instr)
            add_text(bucket, item.get("text"))
            for opt in item.get("options", []) or []:
                add_text(bucket, opt)
            for pair in item.get("pairs", []) or []:
                if isinstance(pair, list) and len(pair) >= 1:
                    add_text(bucket, pair[0])
                    if len(pair) >= 2:
                        add_text(bucket, pair[1])
            ans = item.get("answer")
            expl = item.get("explanation") or (
                f'The correct answer is: "{ans}"' if ans else "Review the matching pairs and try again!"
            )
            add_text(bucket, expl)


def normalize_feedback_template(template: str) -> str:
    """Matches getFeedbackAudioText() in src/feedback/feedbackManager.js."""
    out = template.strip()
    out = re.sub(r"^\{name\},\s*", "", out)
    out = re.sub(r"\s+for\s+\{name\}(?=[!.?]|$)", "", out)
    out = re.sub(r",\s*\{name\}(?=[!.?,]|$)", "", out)
    out = re.sub(r"\s+\{name\}(?=[!.?,]|$)", "", out)
    out = re.sub(r"\s+", " ", out).strip()
    if out:
        out = out[0].upper() + out[1:]
    return out


def collect_feedback_messages(bucket: dict):
    msg_path = ROOT_DIR / "src" / "feedback" / "messages.js"
    if not msg_path.exists():
        return
    src = msg_path.read_text(encoding="utf-8")
    # Strip block comments & single-line comments before extracting string templates
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    src = re.sub(r"(^|\s)//.*$", "", src, flags=re.MULTILINE)

    # Parse single- and double-quoted templates from messages.js
    for match in re.finditer(r"""(['"])((?:\\.|(?!\1).)+)\1""", src):
        raw_tpl = match.group(2)
        if not any(ch.isalpha() for ch in raw_tpl):
            continue
        cleaned_tpl = normalize_feedback_template(raw_tpl)
        if "{n}" in cleaned_tpl:
            for n in range(0, 26):
                add_text(bucket, cleaned_tpl.replace("{n}", str(n)))
        else:
            add_text(bucket, cleaned_tpl)


def collect_common_phrases(bucket: dict):
    for phrase in [
        "Options:",
        "Sentence choices:",
        "Words to match:",
        "Marks: period, question mark, exclamation point",
        "Take your time, read each question carefully, and do your best!",
    ]:
        add_text(bucket, phrase)


def collect_all_texts() -> dict:
    bucket = {}
    collect_q2_content(bucket)
    collect_q1_english(bucket)
    collect_q1_reading(bucket)
    collect_q1_social_studies(bucket)
    collect_feedback_messages(bucket)
    collect_common_phrases(bucket)
    return bucket


def voice_config_matches() -> bool:
    if not VOICE_META_PATH.exists():
        return False
    try:
        saved = json.loads(VOICE_META_PATH.read_text(encoding="utf-8"))
        return (
            saved.get("voice") == VOICE
            and saved.get("rate") == RATE
            and saved.get("pitch") == PITCH
        )
    except Exception:
        return False


async def generate_one(sem, edge_tts_mod, text: str, out_path: Path, force: bool, counters: dict):
    if not force and out_path.exists() and out_path.stat().st_size > 0:
        counters["skipped"] += 1
        return

    tmp_path = out_path.with_suffix(".mp3.tmp")
    async with sem:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts_mod.Communicate(
                    text, voice=VOICE, rate=RATE, pitch=PITCH
                )
                await communicate.save(str(tmp_path))
                if tmp_path.exists() and tmp_path.stat().st_size > 0:
                    os.replace(tmp_path, out_path)
                    counters["generated"] += 1
                    return
            except Exception as err:
                if tmp_path.exists():
                    try:
                        tmp_path.unlink()
                    except OSError:
                        pass
                if attempt == MAX_RETRIES:
                    counters["failed"] += 1
                    counters["errors"].append((text, str(err)))
                    return
                await asyncio.sleep(0.6 * attempt)


async def run_generation(bucket: dict, dry_run: bool, force: bool):
    same_voice = voice_config_matches()
    effective_force = force or not same_voice

    if not effective_force:
        print(f"Voice config unchanged ({VOICE}, rate={RATE}). Existing MP3 files will be skipped.")
    elif not same_voice and VOICE_META_PATH.exists() and not force:
        print(f"Voice config changed -> regenerating files with {VOICE} (rate={RATE}, pitch={PITCH})...")

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    counters = {"generated": 0, "skipped": 0, "failed": 0, "errors": []}

    if dry_run:
        for text, sha1 in bucket.items():
            out_path = AUDIO_DIR / f"{sha1}.mp3"
            if not effective_force and out_path.exists() and out_path.stat().st_size > 0:
                counters["skipped"] += 1
            else:
                counters["generated"] += 1
            manifest[text] = f"audio/{sha1}.mp3"
        print(
            f"[DRY RUN] Total unique texts: {len(bucket)} | "
            f"Would generate: {counters['generated']} | Would skip: {counters['skipped']}"
        )
        return

    try:
        import edge_tts
    except ImportError:
        print(
            "ERROR: `edge-tts` is not installed.\n"
            "Install it first with: pip install edge-tts",
            file=sys.stderr,
        )
        sys.exit(1)

    total_count = len(bucket)
    counters["processed"] = 0

    async def generate_tracked(text, out_path):
        await generate_one(sem, edge_tts, text, out_path, effective_force, counters)
        counters["processed"] += 1
        if counters["processed"] % 100 == 0 or counters["processed"] == total_count:
            print(
                f"Progress: {counters['processed']}/{total_count} "
                f"(generated={counters['generated']}, skipped={counters['skipped']}, failed={counters['failed']})",
                flush=True,
            )

    sem = asyncio.Semaphore(CONCURRENCY)
    tasks = []
    for text, sha1 in bucket.items():
        out_path = AUDIO_DIR / f"{sha1}.mp3"
        manifest[text] = f"audio/{sha1}.mp3"
        tasks.append(generate_tracked(text, out_path))

    await asyncio.gather(*tasks)

    # Filter out failed entries so manifest never points to a missing MP3
    clean_manifest = {}
    total_bytes = 0
    for text, rel_path in sorted(manifest.items(), key=lambda kv: kv[0]):
        mp3_path = PUBLIC_DIR / rel_path
        if mp3_path.exists() and mp3_path.stat().st_size > 0:
            clean_manifest[text] = rel_path
            total_bytes += mp3_path.stat().st_size

    MANIFEST_PATH.write_text(
        json.dumps(clean_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    if counters["failed"] == 0:
        VOICE_META_PATH.write_text(
            json.dumps({"voice": VOICE, "rate": RATE, "pitch": PITCH}, indent=2),
            encoding="utf-8",
        )

    size_mb = total_bytes / (1024 * 1024)
    print("\n=== Audio Generation Summary ===")
    print(f"Voice     : {VOICE} (rate={RATE}, pitch={PITCH})")
    print(f"Generated : {counters['generated']}")
    print(f"Skipped   : {counters['skipped']}")
    print(f"Failed    : {counters['failed']}")
    print(f"Manifest  : {len(clean_manifest)} clips -> {MANIFEST_PATH.relative_to(ROOT_DIR)}")
    print(f"Disk Size : {size_mb:.2f} MB")

    if counters["errors"]:
        print("\nFailed items:")
        for t, err in counters["errors"][:15]:
            print(f"  - {t[:70]}: {err}")


def main():
    parser = argparse.ArgumentParser(description="Generate neural MP3 audio for Grade 2 Stars.")
    parser.add_argument("--dry-run", action="store_true", help="Count clips without calling Edge TTS.")
    parser.add_argument("--force", action="store_true", help="Regenerate all MP3 files even if present.")
    args = parser.parse_args()

    bucket = collect_all_texts()
    asyncio.run(run_generation(bucket, dry_run=args.dry_run, force=args.force))


if __name__ == "__main__":
    main()
