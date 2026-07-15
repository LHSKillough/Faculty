# LHS Killough Faculty Hub

This version uses the following setup:

- `index.html` is the public landing page.
- `builder.html` is the user-friendly editor.
- `config.js` is the editable site content file that the builder publishes.
- `.github/workflows/handbook.yml` still updates `handbook.json` from the Google Doc.
- `scripts/build-handbook.mjs` is unchanged so the handbook bot can keep working.

## Publishing

- `index.html` for the live site.
- `builder.html` for the editor.

The builder only publishes `config.js`, so the handbook workflow and the rest of the site files are not overwritten by normal content updates.
