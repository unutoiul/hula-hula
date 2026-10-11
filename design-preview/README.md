# Hula Hula tropical scroll preview

The site uses 49 selected photographs from `photos/` for the resort, seven room and villa categories, dining, activities, celebrations, and a filterable gallery. Original photographs are preserved. Floating breakfast, the resort fruit cart, and the full shuttle promotion are featured in their own scenes.

The homepage opens with the sunlit reception counter and lounge photograph. Its Welcome photo selector, descriptive alt text, and responsive preload match the new image. The 480-pixel WebP is 45 kB and the 960-pixel WebP is 145 kB. The first photo switches manually, and the breakfast section stays static.

The dining photo strip is replaced by a static, asymmetric restaurant feature: a larger Chang Restaurant photograph beside a Thai sharing spread, a playful heading and sun illustration, and readable captions below the photographs. Both photos appear on phones. The disconnected studio drink photo is removed from this feature; the meal selectors remain functional.

Leaf green, turquoise, pineapple yellow, and their shades and white tints come from the original logo. The logo is displayed larger. Scroll Craft drives independent hero layers, photo entrances, and the shuttle route. Floating breakfast is a static photo composition on every screen, with no pinning, animated ripples, photo zoom, or moving postcard. The header and mobile menu include a persistent motion pause control; the operating system's reduced-motion preference is also respected.

`scripts/prepare-resort-photos.py` creates 480, 960, and 1600 pixel WebP variants, respects EXIF orientation, and generates `src/data/photos.ts`. It requires Python and Pillow. The generated images are served locally from `public/images/hula-hula/`; the live site does not depend on Google Drive image links.

Fredoka and DM Sans are hosted in `public/fonts/`, together with their SIL Open Font License files. Sources: [Fredoka](https://github.com/google/fonts/tree/main/ofl/fredoka), [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans).

Verified: production build, TypeScript checks, desktop and phone layouts, tablet layout, breakfast entry/midpoint/exit, motion pause, shuttle destination inquiries, room photo switching and carousel boundaries, dining selection, gallery filtering and lightbox navigation, mobile menu, and synchronized date/guest selection. Live booking transactions were not exercised. Detailed evidence is in `scrollcraft/builds/hula-hula/VERIFICATION.md`.

`desktop.png` and `mobile.png` show the refreshed design. `breakfast-midpoint.png`, `fruit-cart-desktop.png`, and `shuttle-desktop.png` show the featured experiences. `selected-photos.jpg` is a contact sheet of the selected assets.

Publishable branch: `preview/hula-hula-tropical`. Compare the [existing production site](https://hulahula.vercel.app) and [new Vercel preview](https://hulahula-git-preview-hula-hula-tropical-gold-structure-engine.vercel.app). The new version is a separate preview deployment.

The local source remains in `website` on `design/tropical-scroll-preview`. The publishable branch lives in the isolated `.preview-release` worktree, with application files at the repository root to match Vercel's existing configuration. It is based on `origin/main`; it excludes the 2 GB archive and original photo collection from unpublished local history. Original files remain in the source workspace, and optimized photographs are included in the preview branch.

Scroll Craft's vendored engine is unmodified and includes its MIT license. The skill from `nateherkai/a-bunch-of-skills` is installed under `.agents/skills/visualizations`; that repository currently supplies static visualization skills, so the website's motion uses Scroll Craft.
