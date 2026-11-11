#!/usr/bin/env python3
"""
Pre-generate natural neural MP3 audio for Grade 2 Stars using `edge-tts`.

Supports bilingual audio:
  - English (`en-US`) -> `en-US-AnaNeural` stored under manifest key `<clean_text>`
  - German  (`de-DE`) -> `de-DE-AmalaNeural` stored under manifest key `de:<clean_text>`

Outputs:
  - public/audio/<sha1>.mp3
  - public/audio-manifest.json   (maps each clean spoken key -> "audio/<sha1>.mp3")

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
# German voices (`de-DE`):
#   "de-DE-AmalaNeural" (friendly, warm, clear German — default)
#   "de-DE-KatjaNeural" (classic clear German)
# List all voices via: python -m edge_tts --list-voices
# ==============================================================================
VOICE = "en-US-AnaNeural"
RATE = "-10%"
PITCH = "+0Hz"

DE_VOICE = "de-DE-AmalaNeural"
DE_RATE = "-15%"
DE_PITCH = "+0Hz"

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


def normalize_lang(lang: str) -> str:
    if lang and str(lang).lower().startswith("de"):
        return "de"
    return "en"


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


def add_text(bucket: dict, raw_text: str, lang: str = "en-US"):
    cleaned = clean_text_for_speech(raw_text)
    if not cleaned:
        return
    # Ensure at least one alphanumeric / letter / digit character exists (supports ü, ö, ä, ß)
    if not any(ch.isalnum() for ch in cleaned):
        return

    lang_key = normalize_lang(lang)
    manifest_key = f"de:{cleaned}" if lang_key == "de" else cleaned

    if manifest_key not in bucket:
        sha1 = hashlib.sha1(manifest_key.encode("utf-8")).hexdigest()
        bucket[manifest_key] = {
            "sha1": sha1,
            "text": cleaned,
            "lang": lang_key,
        }


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
            lesson_lang = lesson.get("lang") or "en-US"
            add_text(bucket, lesson.get("title"), "en-US")
            add_text(bucket, lesson.get("hint"), "en-US")

            for card in lesson.get("cards", []) or []:
                card_lang = card.get("lang") or lesson_lang
                word_lang = card.get("wordLang") or card_lang

                add_text(bucket, card.get("word"), word_lang)
                add_text(bucket, card.get("frontTitle"), card.get("frontTitleLang") or card_lang)
                add_text(bucket, card.get("backTitle"), card.get("backTitleLang") or card_lang)
                add_text(bucket, card.get("translation"), "en-US")
                add_text(bucket, card.get("explanation"), "en-US")
                add_text(bucket, card.get("example"), card.get("exampleLang") or card_lang)
                add_text(bucket, card.get("exampleTranslation"), "en-US")
                add_text(bucket, card.get("speechText"), card.get("speechTextLang") or card_lang)

                examples_lang = card.get("examplesLang") or card_lang
                examples = card.get("examples") or []
                for ex in examples:
                    add_text(bucket, ex, examples_lang)
                if examples:
                    add_text(bucket, ". ".join(str(x) for x in examples), examples_lang)

                song_lines = card.get("songLines") or []
                if song_lines:
                    de_parts = []
                    en_parts = []
                    for line in song_lines:
                        if line.get("german"):
                            add_text(bucket, line.get("german"), "de-DE")
                            de_parts.append(line.get("german"))
                        if line.get("english"):
                            add_text(bucket, line.get("english"), "en-US")
                            en_parts.append(line.get("english"))
                    if de_parts:
                        add_text(bucket, " ".join(de_parts), "de-DE")
                    if en_parts:
                        add_text(bucket, " ".join(en_parts), "en-US")

                words = card.get("words") or []
                extra_words = card.get("extraWords") or []
                all_words = [*words, *extra_words]
                for w in all_words:
                    add_text(bucket, w, card_lang)
                if all_words:
                    add_text(bucket, ", ".join(all_words), card_lang)

            activity = lesson.get("activity") or {}
            act_type = activity.get("type")
            add_text(bucket, activity.get("instruction"), "en-US")

            for item in activity.get("items", []) or []:
                if act_type == "sort_buckets":
                    add_text(bucket, item.get("word"), lesson_lang)
                elif act_type == "tap_plural":
                    singular = item.get("singular", "")
                    if singular:
                        add_text(bucket, f"What is the plural of {singular}?", "en-US")
                    for opt in item.get("options", []) or []:
                        add_text(bucket, opt, "en-US")
                    add_text(bucket, item.get("answer"), "en-US")
                    add_text(bucket, item.get("explanation"), "en-US")
                elif act_type == "fix_sentence":
                    wrong = item.get("wrongSentence", "")
                    if wrong:
                        add_text(bucket, f"Fix the sentence: {wrong}", "en-US")
                    for opt in item.get("options", []) or []:
                        add_text(bucket, opt, "en-US")
                    add_text(bucket, item.get("answer"), "en-US")
                    add_text(bucket, item.get("explanation"), "en-US")
                elif act_type == "tap_choice":
                    item_lang = item.get("itemLang") or activity.get("itemLang") or lesson_lang
                    opts_lang = item.get("optionsLang") or activity.get("optionsLang") or "en-US"
                    add_text(bucket, item.get("prompt"), "en-US")
                    add_text(bucket, item.get("targetText"), item_lang)
                    for opt in item.get("options", []) or []:
                        add_text(bucket, opt, opts_lang)
                    add_text(bucket, item.get("answer"), opts_lang)
                    add_text(bucket, item.get("explanation"), "en-US")

            left_lang = activity.get("leftLang") or lesson_lang
            right_lang = activity.get("rightLang") or "en-US"
            for pair in activity.get("allPairs", []) or []:
                if isinstance(pair, list):
                    if len(pair) >= 1:
                        add_text(bucket, pair[0], left_lang)
                    if len(pair) >= 2:
                        add_text(bucket, pair[1], right_lang)

        # Structured Practice sections
        for practice in data.get("practices", []) or []:
            add_text(bucket, practice.get("instruction"), "en-US")
            add_text(bucket, practice.get("hint"), "en-US")

        # Structured Week Quiz (and Practice questions)
        quiz = data.get("quiz") or {}
        if quiz:
            add_text(bucket, quiz.get("instruction"), "en-US")
            add_text(bucket, quiz.get("hint"), "en-US")
            for q in quiz.get("questions", []) or []:
                speech_parts = q.get("speechParts") or []
                for sp in speech_parts:
                    if isinstance(sp, dict):
                        add_text(bucket, sp.get("text"), sp.get("lang") or "en-US")
                    elif isinstance(sp, str):
                        add_text(bucket, sp, "en-US")

                instruction = q.get("prompt") or q.get("instruction") or quiz.get("instruction") or ""
                if instruction and not speech_parts:
                    add_text(bucket, instruction.rstrip(":"), q.get("instructionLang") or "en-US")

                passage = q.get("passage") or {}
                if isinstance(passage, dict) and not speech_parts:
                    p_lang = passage.get("lang") or q.get("textLang") or "en-US"
                    if passage.get("title"):
                        add_text(bucket, passage.get("title"), p_lang)
                    sents = passage.get("sentences") or []
                    for s in sents:
                        add_text(bucket, s, p_lang)
                    if sents:
                        add_text(bucket, " ".join(sents), p_lang)

                text_lang = q.get("textLang") or "en-US"
                if q.get("speechText"):
                    add_text(bucket, q.get("speechText"), text_lang)
                elif not speech_parts and q.get("text"):
                    add_text(bucket, q.get("text"), text_lang)

                if q.get("translationSpeech"):
                    add_text(bucket, q.get("translationSpeech"), "en-US")

                opts_lang = q.get("optionsLang") or "en-US"
                for opt in q.get("options", []) or []:
                    add_text(bucket, opt, opts_lang)

                add_text(bucket, q.get("hint"), "en-US")
                ans = q.get("answer")
                expl = q.get("explanation") or (f'The correct answer is "{ans}".' if ans else "")
                add_text(bucket, expl, "en-US")

        # Generic flat Q2 topic files (if added later for other subjects)
        for item in data.get("items", []) or (data if isinstance(data, list) else []):
            if isinstance(item, dict):
                item_lang = item.get("textLang") or "en-US"
                opts_lang = item.get("optionsLang") or "en-US"
                add_text(bucket, item.get("prompt"), "en-US")
                add_text(bucket, item.get("text"), item_lang)
                add_text(bucket, item.get("explanation"), "en-US")
                add_text(bucket, item.get("hint"), "en-US")
                for opt in item.get("options", []) or []:
                    add_text(bucket, opt, opts_lang)


def collect_q1_english(bucket: dict):
    eng_path = ROOT_DIR / "content-source" / "q1" / "english_content.json"
    if not eng_path.exists():
        return
    with open(eng_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for topic in data.get("topics", []) or []:
        topic_instr = (topic.get("instruction") or "").strip().rstrip(":")
        add_text(bucket, topic_instr, "en-US")
        add_text(bucket, topic.get("hint"), "en-US")

        for item in topic.get("items", []) or []:
            item_instr = (item.get("prompt") or item.get("instruction") or "").strip().rstrip(":")
            if item_instr:
                add_text(bucket, item_instr, "en-US")
            add_text(bucket, item.get("text"), "en-US")
            for opt in item.get("options", []) or []:
                add_text(bucket, opt, "en-US")
            for pair in item.get("pairs", []) or []:
                if isinstance(pair, list) and len(pair) >= 1:
                    add_text(bucket, pair[0], "en-US")
                    if len(pair) >= 2:
                        add_text(bucket, pair[1], "en-US")
            passage = item.get("passage") or {}
            if isinstance(passage, dict):
                if passage.get("title"):
                    add_text(bucket, passage.get("title"), "en-US")
                sents = passage.get("sentences") or []
                for s in sents:
                    add_text(bucket, s, "en-US")
                if sents:
                    add_text(bucket, " ".join(sents), "en-US")

            ans = item.get("answer")
            expl = item.get("explanation") or (
                f'The correct answer is: "{ans}"' if ans else "Review the matching pairs and try again!"
            )
            add_text(bucket, expl, "en-US")


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
            add_text(bucket, base_prompt, "en-US")
            add_text(bucket, item.get("promptSpeech"), "en-US")
            add_text(bucket, item.get("hint"), "en-US")
            add_text(bucket, item.get("explanation"), "en-US")

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
                add_text(bucket, item_text, "en-US")
                if base_prompt and item_text.lower() not in base_prompt.lower():
                    add_text(bucket, f"{base_prompt}. {item_text}", "en-US")

            passage = data.get("passage") or ""
            if passage:
                add_text(bucket, passage, "en-US")
                for para in [p for p in passage.split("\n\n") if p.strip()]:
                    for sent in split_sentences(para):
                        add_text(bucket, sent, "en-US")

            for opt in data.get("options", []) or []:
                add_text(bucket, opt, "en-US")


def collect_q1_social_studies(bucket: dict):
    pattern = str(ROOT_DIR / "src" / "terms" / "q1" / "subjects" / "social_studies" / "content" / "*.json")
    for path_str in sorted(glob.glob(pattern)):
        with open(path_str, "r", encoding="utf-8") as f:
            data = json.load(f)

        topic_instr = (data.get("instruction") or "").strip().rstrip(":")
        add_text(bucket, topic_instr, "en-US")
        add_text(bucket, data.get("hint"), "en-US")

        for item in data.get("items", []) or []:
            item_instr = (item.get("prompt") or item.get("instruction") or "").strip().rstrip(":")
            if item_instr:
                add_text(bucket, item_instr, "en-US")
            add_text(bucket, item.get("text"), "en-US")
            for opt in item.get("options", []) or []:
                add_text(bucket, opt, "en-US")
            for pair in item.get("pairs", []) or []:
                if isinstance(pair, list) and len(pair) >= 1:
                    add_text(bucket, pair[0], "en-US")
                    if len(pair) >= 2:
                        add_text(bucket, pair[1], "en-US")
            ans = item.get("answer")
            expl = item.get("explanation") or (
                f'The correct answer is: "{ans}"' if ans else "Review the matching pairs and try again!"
            )
            add_text(bucket, expl, "en-US")


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
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    src = re.sub(r"(^|\s)//.*$", "", src, flags=re.MULTILINE)

    for match in re.finditer(r"""(['"])((?:\\.|(?!\1).)+)\1""", src):
        raw_tpl = match.group(2)
        if not any(ch.isalpha() for ch in raw_tpl):
            continue
        cleaned_tpl = normalize_feedback_template(raw_tpl)
        if "{n}" in cleaned_tpl:
            for n in range(0, 26):
                add_text(bucket, cleaned_tpl.replace("{n}", str(n)), "en-US")
        else:
            add_text(bucket, cleaned_tpl, "en-US")


def collect_common_phrases(bucket: dict):
    for phrase in [
        "Options:",
        "Sentence choices:",
        "Words to match:",
        "Marks: period, question mark, exclamation point",
        "Take your time, read each question carefully, and do your best!",
    ]:
        add_text(bucket, phrase, "en-US")


def collect_all_texts() -> dict:
    bucket = {}
    collect_q2_content(bucket)
    collect_q1_english(bucket)
    collect_q1_reading(bucket)
    collect_q1_social_studies(bucket)
    collect_feedback_messages(bucket)
    collect_common_phrases(bucket)
    return bucket


def get_voice_config_matches() -> dict:
    if not VOICE_META_PATH.exists():
        return {"en": False, "de": False}
    try:
        saved = json.loads(VOICE_META_PATH.read_text(encoding="utf-8"))
        en_ok = (
            saved.get("voice") == VOICE
            and saved.get("rate") == RATE
            and saved.get("pitch") == PITCH
        )
        de_ok = (
            saved.get("de_voice") == DE_VOICE
            and saved.get("de_rate") == DE_RATE
            and saved.get("de_pitch") == DE_PITCH
        )
        return {"en": en_ok, "de": de_ok}
    except Exception:
        return {"en": False, "de": False}


async def generate_one(sem, edge_tts_mod, entry: dict, out_path: Path, force_item: bool, counters: dict):
    if not force_item and out_path.exists() and out_path.stat().st_size > 0:
        counters["skipped"] += 1
        return

    text = entry["text"]
    lang_key = entry["lang"]
    voice = DE_VOICE if lang_key == "de" else VOICE
    rate = DE_RATE if lang_key == "de" else RATE
    pitch = DE_PITCH if lang_key == "de" else PITCH

    tmp_path = out_path.with_suffix(".mp3.tmp")
    async with sem:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts_mod.Communicate(
                    text, voice=voice, rate=rate, pitch=pitch
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
                    counters["errors"].append((f"[{lang_key}] {text}", str(err)))
                    return
                await asyncio.sleep(0.6 * attempt)


async def run_generation(bucket: dict, dry_run: bool, force: bool):
    voice_matches = get_voice_config_matches()
    force_by_lang = {
        "en": force or not voice_matches["en"],
        "de": force or not voice_matches["de"],
    }

    if not force_by_lang["en"] and not force_by_lang["de"]:
        print(f"Voice configs unchanged ({VOICE} / {DE_VOICE}). Existing MP3 files will be skipped.")
    else:
        print(
            f"Voice config status -> en={'regen' if force_by_lang['en'] else 'skip existing'} ({VOICE}), "
            f"de={'regen' if force_by_lang['de'] else 'skip existing'} ({DE_VOICE})."
        )

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    counters = {"generated": 0, "skipped": 0, "failed": 0, "errors": []}

    if dry_run:
        for manifest_key, entry in bucket.items():
            out_path = AUDIO_DIR / f"{entry['sha1']}.mp3"
            lang_force = force_by_lang.get(entry["lang"], force)
            if not lang_force and out_path.exists() and out_path.stat().st_size > 0:
                counters["skipped"] += 1
            else:
                counters["generated"] += 1
            manifest[manifest_key] = f"audio/{entry['sha1']}.mp3"
        de_count = sum(1 for e in bucket.values() if e["lang"] == "de")
        print(
            f"[DRY RUN] Total unique texts: {len(bucket)} (de={de_count}) | "
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

    async def generate_tracked(entry, out_path):
        lang_force = force_by_lang.get(entry["lang"], force)
        await generate_one(sem, edge_tts, entry, out_path, lang_force, counters)
        counters["processed"] += 1
        if counters["processed"] % 100 == 0 or counters["processed"] == total_count:
            print(
                f"Progress: {counters['processed']}/{total_count} "
                f"(generated={counters['generated']}, skipped={counters['skipped']}, failed={counters['failed']})",
                flush=True,
            )

    sem = asyncio.Semaphore(CONCURRENCY)
    tasks = []
    for manifest_key, entry in bucket.items():
        out_path = AUDIO_DIR / f"{entry['sha1']}.mp3"
        manifest[manifest_key] = f"audio/{entry['sha1']}.mp3"
        tasks.append(generate_tracked(entry, out_path))

    await asyncio.gather(*tasks)

    # Filter out failed entries so manifest never points to a missing MP3
    clean_manifest = {}
    total_bytes = 0
    seen_files = set()
    for manifest_key, rel_path in sorted(manifest.items(), key=lambda kv: kv[0]):
        mp3_path = PUBLIC_DIR / rel_path
        if mp3_path.exists() and mp3_path.stat().st_size > 0:
            clean_manifest[manifest_key] = rel_path
            if rel_path not in seen_files:
                seen_files.add(rel_path)
                total_bytes += mp3_path.stat().st_size

    MANIFEST_PATH.write_text(
        json.dumps(clean_manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    if counters["failed"] == 0:
        VOICE_META_PATH.write_text(
            json.dumps(
                {
                    "voice": VOICE,
                    "rate": RATE,
                    "pitch": PITCH,
                    "de_voice": DE_VOICE,
                    "de_rate": DE_RATE,
                    "de_pitch": DE_PITCH,
                },
                indent=2,
            ),
            encoding="utf-8",
        )

    size_mb = total_bytes / (1024 * 1024)
    de_clips = sum(1 for k in clean_manifest if k.startswith("de:"))
    print("\n=== Audio Generation Summary ===")
    print(f"EN Voice  : {VOICE} (rate={RATE}, pitch={PITCH})")
    print(f"DE Voice  : {DE_VOICE} (rate={DE_RATE}, pitch={DE_PITCH})")
    print(f"Generated : {counters['generated']}")
    print(f"Skipped   : {counters['skipped']}")
    print(f"Failed    : {counters['failed']}")
    print(f"Manifest  : {len(clean_manifest)} clips (de={de_clips}) -> {MANIFEST_PATH.relative_to(ROOT_DIR)}")
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
