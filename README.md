# StarXCO — website

Static website for **StarXCO** — petroleum products, vessels, logistics and trade facilitation.

**Live at:** https://starxco.com.ng

---

## About

Hand-built static site. No frameworks, no build step, no dependencies — plain HTML, one CSS file and
one small JavaScript file. It can be hosted anywhere and will keep working for years without
maintenance.

| | |
|---|---|
| Pages | 15 — home, about, what we do, services, how we work, energy, maritime, logistics, network, compliance, contact, quote, privacy, 404 |
| Hosting | GitHub Pages (see `CNAME`) |
| Domain | starxco.com.ng (apex; DNS managed at Cloudoon) |
| Forms | Contact + Quote → FormSubmit → samuel@starxco.com.ng |

## Structure

```
index.html              Home                     energy/       Energy & petroleum
about/                  About StarXCO            maritime/     Maritime & chartering
what-we-do/             Sectors                  logistics/    Trucking & logistics
services/               Service catalogue        network/      Our network
how-we-work/            7-step process           compliance/   Documentation & compliance
contact/                Contact                  quote/        Request a quote
privacy/                Privacy notice           404.html      Not-found page
assets/css/styles.css   Design system (single stylesheet)
assets/js/main.js       Behaviour: nav, reveal animations, forms
assets/img/             Photography (WebP + JPEG fallback, 480/960/full sizes)
assets/fonts/           Self-hosted IBM Plex woff2 subsets
assets/brand/           Logo, star mark, social image
CNAME                   Tells GitHub Pages the custom domain
.nojekyll               Stops GitHub from processing the site with Jekyll
_headers / .htaccess    Header + caching rules for Netlify/Cloudflare and Apache hosts
```

## Editing content

Content lives directly in the HTML files. Each page folder contains one `index.html`.
To change wording, open the file, edit the text, and commit — GitHub Pages republishes
automatically within a minute.

Common edits:

| What | Where |
|---|---|
| Phone, email, WhatsApp, address | `assets/js/main.js` (top) **and** the footer block inside each page, the contact page and the quote page |
| Form delivery address | `assets/js/main.js` → `formEmail`, and the `action="..."` on both forms |
| Prices, product lists, sector copy | the relevant page's `index.html` |
| Colours, type, spacing | `assets/css/styles.css` — tokens are declared at the top under `:root` |

## Notes for whoever hosts this next

- **Form delivery is domain-bound.** FormSubmit only accepts submissions originating from the domain
  the form was activated for (`starxco.com.ng`). Submitting from a local preview, a staging URL or a
  downloaded file will be refused by design. Add `?debug=1` to a form page to see the exact reason.
- **`_headers` and `.htaccess` are inert on GitHub Pages** (they need Netlify/Cloudflare Pages or an
  Apache host). They are kept so the site can move hosts without losing its security headers.
  GitHub Pages does serve `404.html` automatically and issues HTTPS certificates on its own.
- **Images are generated art direction**, not photographs of StarXCO operations. Replace with real
  company photography when available and keep the same filenames and sizes.
- **Claims policy:** the site deliberately makes no claims about licences, registrations, client
  names, mandates, transaction values or completed deals, and states that StarXCO acts as facilitator
  and intermediary only. Please keep it that way unless the claim can be evidenced.
