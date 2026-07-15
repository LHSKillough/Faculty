# LHS Killough Faculty Hub

This version keeps the existing static-site setup:

- `index.html` is the public landing page.
- `builder.html` is the user-friendly editor.
- `config.js` is the editable site content file that the builder publishes.
- `.github/workflows/handbook.yml` still updates `handbook.json` from the Google Doc.
- `scripts/build-handbook.mjs` is unchanged so the handbook bot can keep working.

## What changed

- Cleaned the starting resource list around school landing-page sections:
  Teaching & Learning, Daily Operations, Staff & Directory, Student Support, and Community.
- Removed the Booster Club duplicate/delete item.
- Turned multi-link items into real pages with buttons.
- Added page image fields in the builder so pages can include an image plus caption.
- Added editable landing-page headline, subtitle, and welcome-note fields to the builder.
- Kept GitHub publishing in `builder.html` so content can still be updated without editing code.

## Publishing

Replace the files in your current GitHub Pages repository with the files in this folder. Keep the same repository settings you already use for Pages.

After uploading, open:

- `index.html` for the live site.
- `builder.html` for the editor.

The builder only publishes `config.js`, so the handbook workflow and the rest of the site files are not overwritten by normal content updates.
