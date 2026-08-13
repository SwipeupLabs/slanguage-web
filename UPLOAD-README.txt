Slanguage legal integration patch
=================================

Upload/copy these files and folders into the ROOT of the existing slanguage-web GitHub Pages repository.
Do NOT delete existing files such as logo.png, og-image.png, your current Google verification file, or other assets.

Files included:
- index.html                    (existing homepage + legal footer links only)
- sitemap.xml                  (adds /privacy/ and /terms/)
- privacy/index.html
- terms/index.html
- assets/legal-config.js       (single source mapping; change legal source URLs here only)
- assets/legal-page.js         (runtime fetch, parsing, sanitization, language switching, cache, fallback)
- assets/legal-page.css        (Slanguage-styled legal page layout)

After GitHub Pages deploys, verify:
https://swipeuplabs.github.io/slanguage-web/privacy/
https://swipeuplabs.github.io/slanguage-web/terms/

Language deep links:
?lang=en
?lang=zh-TW
?lang=zh-CN

IMPORTANT:
The legal text remains sourced at runtime from:
https://swipeuplabs.github.io/slanguage-legal/
No legal clauses are duplicated in this patch.
