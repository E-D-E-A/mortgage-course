"""Voice-over TRIAL (not part of the site): Hebrew narration with Azure AI Speech.

  python3 scripts/tts-trial/synthesize.py <cues.json> <outDir> <voice> [<voice> ...]
  python3 scripts/tts-trial/synthesize.py --cartesia-voices   (Hebrew voices on Cartesia)

For each voice: one request per subtitle cue (so each sentence's length is known
exactly), then the full narration track <outDir>/<voice>.wav and the time map
<outDir>/<voice>.timeline.json for render-voiced.mjs. The key is read from
AZURE_SPEECH_KEY and never printed or written.

The spoken text is made from the subtitle text in code: amounts and percentages
become Hebrew words, and a small dictionary adds niqqud to words a reader could
take for another word (מלווה / לווה, בטוחה). The subtitles keep the original text.
"""
import json
import os
import re
import sys
import time
import urllib.request
import wave
from xml.sax.saxutils import escape

# --- numbers to Hebrew words (masculine count: שקלים, אחוז) -------------------
UNITS = ["", "אחד", "שניים", "שלושה", "ארבעה", "חמישה", "שישה", "שבעה", "שמונה", "תשעה"]
TEENS = ["עשרה", "אחד עשר", "שנים עשר", "שלושה עשר", "ארבעה עשר", "חמישה עשר", "שישה עשר", "שבעה עשר", "שמונה עשר", "תשעה עשר"]
TENS = ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"]
HUNDREDS = ["", "מאה", "מאתיים", "שלוש מאות", "ארבע מאות", "חמש מאות", "שש מאות", "שבע מאות", "שמונה מאות", "תשע מאות"]
THOUSANDS = {1: "אלף", 2: "אלפיים", 3: "שלושת אלפים", 4: "ארבעת אלפים", 5: "חמשת אלפים", 6: "ששת אלפים", 7: "שבעת אלפים", 8: "שמונת אלפים", 9: "תשעת אלפים", 10: "עשרת אלפים"}


def parts_below_1000(n):
    out = []
    if n >= 100:
        out.append(HUNDREDS[n // 100])
        n %= 100
    if 10 <= n < 20:
        out.append(TEENS[n - 10])
    else:
        if n >= 20:
            out.append(TENS[n // 10])
        if n % 10:
            out.append(UNITS[n % 10])
    return out


def join_parts(parts):
    # Hebrew puts ו before the last part: "חמש מאות וחמישים אלף".
    parts = [p for p in parts if p]
    if len(parts) > 1:
        parts[-1] = "ו" + parts[-1]
    return " ".join(parts)


def number_words(n):
    if n == 0:
        return "אפס"
    parts = []
    millions, rest = divmod(n, 1_000_000)
    if millions:
        parts.append("מיליון" if millions == 1 else f"{join_parts(parts_below_1000(millions))} מיליון")
    thousands, rest = divmod(rest, 1000)
    if thousands:
        parts.append(THOUSANDS[thousands] if thousands in THOUSANDS else f"{join_parts(parts_below_1000(thousands))} אלף")
    if rest:
        last = parts_below_1000(rest)
        # ו before a final single word only: "אלף ושלוש מאות", "מאתיים אלף שלוש מאות וחמישים".
        parts.append(join_parts(last) if len(last) > 1 else ("ו" + last[0] if parts else last[0]))
    elif len(parts) > 1 and " " not in parts[-1]:
        parts[-1] = "ו" + parts[-1]
    return " ".join(parts)


# --- pronunciation dictionary ------------------------------------------------
# Whole words only (a Hebrew prefix letter may stand before them). Niqqud where
# the plain spelling has another common reading.
LEXICON = {
    "מלווה": "מַלְוֶה",
    "המלווה": "הַמַּלְוֶה",
    "למלווה": "לַמַּלְוֶה",
    "ומלווה": "וּמַלְוֶה",
    "הלווה": "הַלֹּוֶה",
    "בטוחה": "בְּטוֹחָה",
    "הבטוחה": "הַבְּטוֹחָה",
    "משועבדת": "מְשֻׁעְבֶּדֶת",
    "השעבוד": "הַשִּׁעְבּוּד",
    "לממש": "לְמַמֵּשׁ",
    "נפרע": "נִפְרָע",
    "ההליך": "הַהֲלִיךְ",
    "הפיגור": "הַפִּיגּוּר",
    "כרית": "כָּרִית",
    "קודם": "קֹדֶם",
    "כול": "כֹּל",
    # Course terms that are not in 1-1, kept for the next lessons.
    "פריים": "פְּרַיְים",
    "הפריים": "הַפְּרַיְים",
    "פריסה": "פְּרִיסָה",
    "LTV": "אֶל טִי וִי",
}


def spoken(text):
    t = text.replace("‏", "").replace("־", "")
    # "1,000,000 ₪" -> "מיליון שקלים"; a prefix letter (ב) stays attached.
    t = re.sub(r"(\d[\d,]*)\s*₪", lambda m: number_words(int(m.group(1).replace(",", ""))) + " שקלים", t)
    t = re.sub(r"(\d+)%", lambda m: number_words(int(m.group(1))) + " אחוז", t)
    t = t.replace(" — ", ", ")
    for word, said in LEXICON.items():
        t = re.sub(rf"(?<![֐-׿A-Za-z]){re.escape(word)}(?![֐-׿A-Za-z])", said, t)
    return t


def ssml(voice, text):
    body = escape(text)
    if not voice.startswith("he-IL-"):
        # A multilingual voice reads Hebrew only when told the text is Hebrew.
        body = f'<lang xml:lang="he-IL">{body}</lang>'
    return (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="he-IL">'
            f'<voice name="{voice}">{body}</voice></speak>')


RATE = 24000
FORMAT = "riff-24khz-16bit-mono-pcm"


# Cartesia: a voice is "cartesia:<voice id>" (text with the niqqud dictionary) or
# "cartesia-plain:<voice id>" (the same text with the niqqud removed), so both can
# be heard side by side. Key from CARTESIA_API_KEY; model from CARTESIA_MODEL.
CARTESIA = "https://api.cartesia.ai"
CARTESIA_VERSION = "2025-04-16"


def cartesia_request(path, body=None):
    req = urllib.request.Request(CARTESIA + path, data=None if body is None else json.dumps(body).encode("utf-8"),
                                 headers={"X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": CARTESIA_VERSION,
                                          "Content-Type": "application/json", "User-Agent": "mogi-course-tts-trial"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4:
                raise RuntimeError(f"Cartesia HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}") from None
            time.sleep(10 * (attempt + 1))


def synthesize_cartesia(voice, text, path):
    kind, voice_id = voice.split(":", 1)
    if kind == "cartesia-plain":
        text = re.sub("[\u0591-\u05C7]", "", text)
    pcm = cartesia_request("/tts/bytes", {
        "model_id": os.environ.get("CARTESIA_MODEL", "sonic-3"), "transcript": text, "language": "he",
        "voice": {"mode": "id", "id": voice_id},
        "output_format": {"container": "raw", "encoding": "pcm_s16le", "sample_rate": RATE}})
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(pcm)


def cartesia_voices():
    for v in json.loads(cartesia_request("/voices?limit=100&language=he")).get("data", []):
        print(v["id"], v.get("name"), "|", (v.get("description") or "")[:80])


def synthesize(voice, text, path):
    if voice.startswith("cartesia"):
        return synthesize_cartesia(voice, text, path)
    region = os.environ["AZURE_SPEECH_REGION"]
    req = urllib.request.Request(
        f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
        data=ssml(voice, text).encode("utf-8"),
        headers={"Ocp-Apim-Subscription-Key": os.environ["AZURE_SPEECH_KEY"],
                 "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": FORMAT,
                 "User-Agent": "mogi-course-tts-trial"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                open(path, "wb").write(r.read())
                return
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4:
                raise RuntimeError(f"Azure TTS HTTP {e.code}") from None
            time.sleep(10 * (attempt + 1))


def read_pcm(path):
    with wave.open(path) as w:
        assert w.getframerate() == RATE and w.getsampwidth() == 2 and w.getnchannels() == 1
        frames = w.readframes(w.getnframes())
    # Azure pads each sentence with silence (about 0.9 s after it); keep 50 ms before and 150 ms after the voice.
    samples = memoryview(frames).cast("h")
    loud = [k for k in range(len(samples)) if abs(samples[k]) > 300]
    if not loud:
        return frames
    start, end = max(0, loud[0] - RATE // 20), min(len(samples), loud[-1] + RATE * 15 // 100)
    return frames[start * 2:end * 2]


# --- the new timeline ---------------------------------------------------------
LEAD = 1.0       # before the first sentence
PAUSE = 0.45     # after each sentence, inside its cue (the subtitle stays up)
MAX_GAP = 1.5    # an old gap between cues (a scene change) keeps its length, up to this
HOLD = 0.7       # the first seconds of a cue run at the old speed, so fade-ins keep their pace
TAIL = 1.5       # after the last sentence


def timeline(cues, durations, old_duration):
    new_cues, tmap, t = [], [[0.0, 0.0]], LEAD
    prev_old_end = 0.0
    for i, ((a, b, text), d) in enumerate(zip(cues, durations)):
        if i == 0:
            tmap.append([t, a])  # the lead-in maps onto whatever came before the first cue
        else:
            gap = min(a - prev_old_end, MAX_GAP)
            if gap > 0:
                t += gap
            tmap.append([t, a])
        length = d + PAUSE
        hold = min(HOLD, length / 2, (b - a) / 2)
        tmap.append([t + hold, a + hold])
        tmap.append([t + length, b])
        new_cues.append([round(t, 3), round(t + length, 3), text])
        t += length
        prev_old_end = b
    end = t + TAIL
    tmap.append([end, min(prev_old_end + TAIL, old_duration)])
    return new_cues, [[round(x, 4), round(y, 4)] for x, y in tmap], end


def main():
    if sys.argv[1:] == ["--cartesia-voices"]:
        return cartesia_voices()
    cues_path, out_dir, *voices = sys.argv[1:]
    data = json.load(open(cues_path, encoding="utf-8"))
    cues = data["cues"]
    os.makedirs(out_dir, exist_ok=True)
    texts = [spoken(c[2]) for c in cues]
    json.dump([[c[2], s] for c, s in zip(cues, texts)], open(os.path.join(out_dir, "spoken.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    report = {}
    for voice in voices:
        pcm, durations = [], []
        for i, text in enumerate(texts):
            path = os.path.join(out_dir, f"{voice.replace(':', '_')}.{i + 1:02d}.wav")
            if not os.path.exists(path):
                synthesize(voice, text, path)
                # Azure's free F0 tier: at most 20 requests a minute.
                time.sleep(0.5 if voice.startswith("cartesia") else 3.2)
            frames = read_pcm(path)
            pcm.append(frames)
            durations.append(len(frames) / 2 / RATE)
        new_cues, tmap, total = timeline(cues, durations, data["duration"])
        # The full track: silence, then each sentence at its cue's start.
        track = bytearray()
        for (start, _, _), frames in zip(new_cues, pcm):
            track += b"\0\0" * (round(start * RATE) - len(track) // 2)
            track += frames
        track += b"\0\0" * (round(total * RATE) - len(track) // 2)
        with wave.open(os.path.join(out_dir, f"{voice.replace(':', '_')}.wav"), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(bytes(track))
        json.dump({"duration": total, "map": tmap, "cues": new_cues}, open(os.path.join(out_dir, f"{voice.replace(':', '_')}.timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        # What was sent: cartesia-plain sends the text without niqqud.
        text_chars = sum(len(re.sub("[֑-ׇ]", "", s) if voice.startswith("cartesia-plain") else s) for s in texts)
        ssml_chars = sum(len(ssml(voice, s)) for s in texts)
        report[voice] = {"speech_seconds": round(sum(durations), 2), "video_seconds": round(total, 2), "text_chars": text_chars, "ssml_chars": ssml_chars,
                         "words": sum(len(c[2].split()) for c in cues)}
        print(f"{voice}: speech {sum(durations):.1f}s, video {total:.1f}s (was {data['duration']}s), {text_chars} text characters")
    json.dump(report, open(os.path.join(out_dir, "report.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
