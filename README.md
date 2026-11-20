# CART3R Code Studio

A dark, green-accented browser coding workspace built with React, Vite and Monaco Editor.

## Features
- Monaco editor with syntax highlighting for HTML, CSS, JavaScript, TypeScript, Python, Java and C++.
- Live isolated preview for HTML, CSS and JavaScript.
- Explorer with folders/files, creation and rename controls.
- Long-press is not required: use the `...` action beside a file/folder or right-click on desktop to rename.
- Project starter cards for mobile apps, mobile games, business stores and websites.
- Spider-leg digital clock, animated low-opacity code background and glass/liquid-inspired buttons.
- Files remain in the current browser session; this starter does not yet persist projects to disk or cloud.

## Run locally
Install Node.js 18 or newer, then:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```
The production site is generated in `dist/`.

## Publish with GitHub
1. Create a new GitHub repository, for example `cart3r-code-studio`.
2. Upload the contents of this ZIP (not the ZIP file itself) to the repository.
3. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the build source.
4. Add a workflow file at `.github/workflows/deploy.yml` using the sample below.
5. Push to the `main` branch. GitHub Actions builds and deploys the site.

### GitHub Pages workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy CART3R Code Studio
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Important execution notes
- JavaScript executes only inside a sandboxed iframe (`sandbox="allow-scripts"`); it does not receive parent-page access.
- HTML/CSS are rendered in the preview panel.
- Python, Java, C++ and TypeScript have editor syntax support, but this browser-only starter does not execute or compile them. Add a trusted compiler/runtime or a backend you control if you need execution for those languages.
- Do not send untrusted code to an arbitrary online compiler. For a public service, add server-side isolation, resource limits, authentication and abuse controls before enabling remote execution.
- Google Fonts and Monaco's editor assets may require an internet connection on first load.
