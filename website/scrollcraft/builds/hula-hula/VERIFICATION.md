# Verification — Hula Hula tropical scroll preview

Verified on 11 October 2026 using the session's supported Opera browser controls.

## Current dining revision

Replaced the three equal-height dining thumbnails with an asymmetric, static layout. Chang Restaurant has a larger photograph; the Thai sharing spread is bottom-aligned to keep the plates visible. The studio watermelon photo is removed from this feature. Captions sit below the images, with a playful heading and fixed sun illustration. No animation, scroll attributes, or new dependencies were added.

Verified desktop at 1844 × 898 and phone at 390 × 844: both photographs load, both are present on phones, and there is no horizontal overflow. Selecting “A taste of Thailand” still updates the main dining photograph and pressed state. TypeScript checks pass. Screenshots: `design-preview/dining-redesign-desktop.png` and `design-preview/dining-redesign-mobile.png`.

Preview commit `db9ee0a` is Ready on Vercel, deployment `dpl_DErtjDZ6QonEitrXtGXrxGm7DEYS`. Live inspection confirms both dining photos load, the new heading is present, and there is no horizontal overflow. The reception homepage photo also loads from its 960-pixel WebP, completing the previous homepage deployment check. Live screenshot: `design-preview/dining-redesign-live.png`.

## Current homepage: reception and lounge

At the user's request, the default hero uses `hula-hula-reception-counter-and-lounge-seating.jpg`. Three candidate lobby/arrival photographs were inspected before selection. The sunlit reception and lounge photograph was chosen for its welcome desk, tropical greenery, and seating.

Generated 480/960/1600 WebP variants: 45,220 / 144,984 / 337,768 bytes. There are now 49 selected photographs and 147 WebP files, 15.40 MB total. Original photographs remain intact. The preparation script includes the new selection.

Verified desktop at 1844 × 867 and phone at 390 × 844: photo loads with an appropriate crop and no horizontal overflow. The hero uses the 960-pixel variant on desktop and 480-pixel variant on phone. Its preload uses the same responsive sizes as the image. Breakfast and Welcome selectors work; Welcome is selected by default. TypeScript checks pass.

Screenshots: `design-preview/reception-hero-desktop.png` and `design-preview/reception-hero-mobile.png`. The static breakfast revision below remains current.

## Current revision: static floating breakfast

At the user's request, the breakfast scene is now static on all screen sizes. Removed its Scroll Craft act, stage and span, animated photo zoom, moving postcard/sticker, and ripple elements. It is ordinary document flow; the photos and inquiry button remain available.

Desktop verification: section height 662 px at 1844 × 867, no stage or act attributes. After scrolling, the section top moves from 114.1 px to −58.9 px while the postcard transform remains the same fixed −5-degree rotation. Phone verification at 390 × 844: no horizontal overflow, no Scroll Craft attributes inside breakfast, both photos visible. The postcard caption fits one line inside its frame.

TypeScript checks and the production build pass. Screenshots: `design-preview/breakfast-static-desktop.png` and `design-preview/breakfast-static-mobile.png`. Earlier animated-scene evidence below records the initial preview and is superseded by this revision.

Static update commit `8c44130` is deployed and Ready at the same branch preview URL. Live inspection confirms no breakfast act or stage, both images loaded, and the fixed postcard rotation. Live screenshot: `design-preview/breakfast-static-live.png`.

## Build and assets

- `npm run build` passed: TypeScript project build and Vite production build. Vite reports a non-blocking 576 kB JavaScript chunk warning.
- Photo preparation completed: 48 selected originals, 144 WebP variants at 480/960/1600 pixels, 14.89 MB total. Original photos remain intact.
- Supplied logo and resort photographs were inspected. The shuttle image retains its printed destination information without cropping. The main breakfast photo uses bottom alignment so the floating tray remains in view.
- No browser console errors were captured during the new scene checks. Scroll Craft emits a pin warning during viewport changes to mobile because the deliberately recomposed mobile stage uses relative positioning.

## Visual checks

- Desktop: 1844 × 867, independent hero layers and readable stable controls.
- Breakfast entry: progress 0, postcard offset 24/48 px and rotation −8 degrees.
- Breakfast midpoint: progress 0.3961, stage held at 106 px, postcard offset 14.5/29 px and rotation about −5.2 degrees. Main photo, ripples, and sticker follow different transforms.
- Breakfast exit: progress 1, postcard settles to 0/0 px and −1 degree, scene releases into dining.
- Tablet: 1024 × 768. Header, breakfast copy, pool photo, and postcard remain visible without horizontal overflow.
- Phone: 390 × 844. Logo, booking/menu controls, hero, and breakfast use a readable vertical composition. Breakfast stage is relative and the scene has natural content height.
- Compact phone: 360 × 640. No horizontal overflow; header and hero buttons fit. Mobile menu and motion control work.
- Wide layout, fruit-cart feature, and complete shuttle image inspected and captured in `design-preview/`.

## Functional checks

- Motion pause switches the main element to `data-motion="off"`, unmounts the engine, removes postcard transforms, and changes the breakfast stage to normal flow. Reveal content remains visible. Re-enabling motion restores the runtime.
- System reduced motion feeds the same disabled runtime path and has a CSS fallback. The OS preference itself was not emulated; the equivalent visible pause state was tested on desktop and compact phone.
- Selecting Krabi Town sets `aria-pressed="true"` and updates the WhatsApp inquiry URL with Krabi Town. No message was sent.
- Good food gallery filtering works. The breakfast lightbox opens with the correct caption and 1/4 count, then closes with Escape. Returning to all photographs works.
- Existing room photo controls, rail boundaries, dining selection, date/guest synchronization, and mobile navigation were checked during the photo redesign. Booking API code remains unchanged; no live booking transaction was submitted.

## Deployment

Source branch: `design/tropical-scroll-preview`, based on local `main` commit `48690e4`.

Publishable branch: `preview/hula-hula-tropical`, based on `origin/main` commit `1e0d09c`. Application files are at the repository root in an isolated `.preview-release` worktree. This preserves Vercel's existing root-directory configuration and avoids pushing the 2 GB download archive and 584 MB original photo collection from unpublished local history. Original files and local main history remain intact; the preview contains all optimized site photographs.

Existing production: https://hulahula.vercel.app, deployment `dpl_HXH5J6ZWuoTGDt8kRmgQoy2xXJXJ`. Vercel reports this deployment Ready. The redesign is published as a separate preview; production is not promoted or replaced.

The project uses Vite and a root directory of `.`. The preview worktree matches that structure. No production project settings are changed.

The branch was pushed successfully. Vercel preview commit `74e7ea0` is Ready at [the branch preview](https://hulahula-git-preview-hula-hula-tropical-gold-structure-engine.vercel.app), deployment `dpl_4NvWyhgFvwKoAF9xjsGsyQadiFHS`. The website and booking API TypeScript checks also pass in the release worktree. All three existing serverless endpoints were built.

The first live check found that an unanchored `scrollcraft` ignore pattern excluded `public/vendor/scrollcraft`. Root-only exclusion patterns fixed the packaging. After redeployment, the live scene reports a sticky stage, progress 0.2158, and postcard translation 18.8/37.6 px. Both breakfast photographs load successfully. The existing production URL was opened and still displays its original design.

Live screenshots: `design-preview/deployed-desktop.png` and `design-preview/deployed-breakfast.png`. No live booking transaction was submitted.

## Tooling and attribution

- Scroll Craft skill and unmodified engine: https://github.com/nateherkai/scroll-craft. MIT license is included in `public/vendor/scrollcraft/LICENSE`.
- `a-bunch-of-skills` visualization skill is installed for static illustration work. It does not supply a website-motion skill: https://github.com/nateherkai/a-bunch-of-skills.
- Skill doctor found no ffmpeg, playwright-core, or KIE key. This build needs none: it uses supplied photographs and the supported browser controls, with no generated video.
