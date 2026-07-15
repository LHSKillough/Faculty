# LHS Killough Faculty Hub

- `index.html` is the public landing page.
- `builder.html` is the visual editor: click the page, drag sections/cards/menu buttons, upload images, and publish.
- `config.js` is the editable site content file that the builder publishes.
- `.github/workflows/handbook.yml` still updates `handbook.json` from the Google Doc.
- `scripts/build-handbook.mjs` is unchanged so the handbook bot can keep working.

## Publishing

Replace the files in your current GitHub Pages repository with the files in this folder. Keep the same repository settings you already use for Pages.

After uploading, open:

- `index.html` for the live site.
- `builder.html` for the editor.

The builder only publishes `config.js`, so the handbook workflow and the rest of the site files are not overwritten by normal content updates.

For image uploads, use a fine-grained GitHub token for this one repository with `Contents: Read and write`. The token is used in the browser tab and is not saved by the builder.
