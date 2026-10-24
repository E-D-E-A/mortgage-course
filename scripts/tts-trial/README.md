# ניסוי דיבוב (לא חלק מהאתר)

ניסוי שמיעה על שיעור 1-1 בלבד. לא כותב ל־`public/video/` ולא משנה את `video/*.html`. הקבצים יוצאים לתיקייה זמנית מחוץ לריפו.

## מה נוסה עד עכשיו (2026-10-24)
- Azure: he-IL-HilaNeural, he-IL-AvriNeural, ושלושה קולות רב־לשוניים (Ava, Andrew, NovaTurbo). לדעת דביר: כולם רובוטיים.
- נוצלו כ־5,100 תווים מתוך 500,000 של Azure F0.
- Cartesia (`sonic-3`): Ayala ו־Yonatan, השיעור המלא עם ניקוד ובלי ניקוד, ועוד משפט 15 בשישה קולות (Neta, Tamar, Hila, Noam, Ido, Eitan). לדעת דביר: בכולם ההגייה לא נכונה, יש מבטא לא עברי, והקול לא נשמע אנושי. הניקוד לא שינה את זה. נוצלו 4,134 תווים מתוך 20,000. הוחלט לא להמשיך עם Cartesia.
- (היסטוריה) לפני הניסוי: Cartesia (חשבון חינמי, 20,000 תווים; ניסוי 1-1 צריך כ־1,000 לכל קול). המפתח ב־`CARTESIA_API_KEY`, והרשת ל־`api.cartesia.ai` פתוחה.

## הרצה (מהריפו; `S` = תיקייה זמנית)
```sh
pnpm install --frozen-lockfile
export CHROMIUM=/opt/pw-browsers/chromium NODE_OPTIONS=--max-old-space-size=8192
node scripts/tts-trial/render-voiced.mjs cues 1-1 $S/cues.json
python3 scripts/tts-trial/synthesize.py --cartesia-voices          # קולות עבריים ב־Cartesia
python3 scripts/tts-trial/synthesize.py $S/cues.json $S/audio cartesia:<id> cartesia-plain:<id>
node scripts/tts-trial/render-voiced.mjs render 1-1 $S/audio/cartesia_<id>.timeline.json $S/out
ffmpeg -i $S/out/1-1.silent.mp4 -i $S/audio/cartesia_<id>.wav -i $S/out/1-1.he.vtt \
  -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 128k -ar 48000 -c:s mov_text \
  -metadata:s:s:0 language=heb -movflags +faststart $S/1-1.<name>.mp4
```
- `cartesia:<id>`: הטקסט עם מילון הניקוד. `cartesia-plain:<id>`: אותו טקסט בלי ניקוד, כדי לשמוע מה עובד טוב יותר.
- המודל: `CARTESIA_MODEL` (ברירת מחדל `sonic-3`).
- המפתחות נקראים מהסביבה בלבד, ולא מודפסים ולא נכתבים לקבצים.
