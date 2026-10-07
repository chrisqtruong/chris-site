# chris-site

My personal website: a bit about me, the things I've made, and some photos.

The home page opens with a live demo of [Vox2](https://github.com/chrisqtruong/vox2), my desktop translator, introducing me in a few languages. Type something and it translates as you go.

Plain HTML, CSS and JavaScript, built with [Claude Code](https://claude.com/claude-code). The intro voices were recorded with Azure neural voices (`tools/make-intro-audio.py`).

To run it locally:

```
python3 -m http.server 4321
```

then open http://localhost:4321.

Thanks for taking a look,

Chris

## Adding photos

1. Put the original photos in `photos-src/` (not published).
2. Run `python3 tools/add-photos.py`. It makes a page-size copy and a full-size copy of each one in `assets/photos/`, with the location and other hidden camera data removed, and updates the gallery on `/photos/`.
3. Write captions in `photos/captions.json`, then run the script again.
