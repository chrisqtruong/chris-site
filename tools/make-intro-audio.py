"""Records the hero's intro lines with Azure's neural voices (the same family the Vox2 app uses),
plus the time each word is spoken, so the read-aloud highlight matches the audio exactly.

Run once (and again only if the intro lines change):
    pip3 install azure-cognitiveservices-speech
    export AZURE_SPEECH_KEY=...   # from the Azure portal: your Speech resource → Keys and Endpoint
    export AZURE_SPEECH_REGION=eastus
    python3 tools/make-intro-audio.py

Writes assets/voice/<name>.mp3 and assets/voice/<name>.json ([[ms, from, to], …] per word).
The key is only used here, on your Mac; it never goes on the website.
"""
import json, os, pathlib
import azure.cognitiveservices.speech as speechsdk

# the intro, as typed in the hero (keep in sync with SCRIPT in index.html)
LINES = [
    ('en-1', 'en-US-JennyNeural',   "Hi, I'm Chris."),
    ('vi-1', 'vi-VN-HoaiMyNeural',  'Xin chào, tôi là Chris.'),
    ('en-2', 'en-US-JennyNeural',   'I lead design and product teams.'),
    ('ja-2', 'ja-JP-NanamiNeural',  '私はデザインチームと製品チームを率いています。'),
    ('en-3', 'en-US-JennyNeural',   'I build the things I wish existed (or at least I try to).'),
    ('es-3', 'es-MX-DaliaNeural',   'Construyo las cosas que desearía que existieran (o al menos lo intento).'),
    ('en-4', 'en-US-JennyNeural',   'And I take a lot of photos.'),
    ('ko-4', 'ko-KR-SunHiNeural',   '그리고 사진을 많이 찍거든요.'),
    ('en-5', 'en-US-JennyNeural',   'Go ahead, type something.'),
    ('fr-5', 'fr-FR-DeniseNeural',  'Allez-y, tapez quelque chose.'),
]

out = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'voice'
out.mkdir(parents=True, exist_ok=True)
config = speechsdk.SpeechConfig(subscription=os.environ['AZURE_SPEECH_KEY'], region=os.environ['AZURE_SPEECH_REGION'])
config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3)

for name, voice, text in LINES:
    config.speech_synthesis_voice_name = voice
    synth = speechsdk.SpeechSynthesizer(speech_config=config, audio_config=None)
    words = []
    # audio_offset is in 100-nanosecond ticks; text_offset/word_length are characters in `text`
    synth.synthesis_word_boundary.connect(lambda e, w=words: w.append(
        [round(e.audio_offset / 10_000), e.text_offset, e.text_offset + e.word_length])
        if e.boundary_type == speechsdk.SpeechSynthesisBoundaryType.Word else None)
    result = synth.speak_text_async(text).get()
    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        raise SystemExit(f'{name}: {result.reason} {getattr(result, "cancellation_details", "")}')
    (out / f'{name}.mp3').write_bytes(result.audio_data)
    (out / f'{name}.json').write_text(json.dumps({'text': text, 'voice': voice, 'words': words}, ensure_ascii=False))
    print(f'{name}: {len(words)} words, {len(result.audio_data) // 1024} KB')
