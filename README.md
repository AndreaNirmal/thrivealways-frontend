# THRIVE Always

*Building resilience. Enabling growth.*

A lightweight static website for THRIVE Always. Plain HTML, CSS and vanilla JavaScript, with no build step and no dependencies, so it runs directly from GitHub Pages.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: story, the THRIVE approach, the three pathways, and **Get in touch** |
| `life.html` | THRIVE Life |
| `kids.html` | THRIVE Kids |
| `organisations.html` | THRIVE Organisations |
| `about.html` | About the founder |

Shared styles live in `assets/css/styles.css` and interactions in `assets/js/main.js`.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000
```

## Publish on GitHub Pages

Repository **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`.

## Things to fill in

- **About page** (`about.html`): replace every `[placeholder]`. To add a photo, save it as `assets/img/founder.jpg` and follow the comment at the top of `<main>`.
- **Contact details** (`index.html`, `#contact`): email, phone and location, plus the `data-email` attribute on the form (where enquiries are sent).

## Contact form

The form needs no server: on submit it opens the visitor's email app with the message pre-filled and addressed to `data-email`. Service pages link to `index.html?about=life#contact` (or `kids` / `organisations`) so the right topic is preselected.

To receive submissions without relying on the visitor's email app, point the form at a form service such as Formspree and remove the `data-contact-form` attribute.

## Theme

Light and dark mode follow the visitor's system setting by default; the toggle in the header overrides it and is remembered per browser.
