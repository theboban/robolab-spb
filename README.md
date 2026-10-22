# Cog & Brick Robotics Lab — Landing Page

A modern, fully responsive one-page English landing site for a kids' robotics
school (ages 6–10, Austin, TX). Primary goal: **free trial-class requests via
WhatsApp**.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Full page: Screen 1 (hero) + Screen 2 (program, teachers, pricing, location, contact) |
| `styles.css` | Bright STEM design system, mobile-first responsive rules |
| `script.js` | WhatsApp link builder, child-age memory, GA4/GTM click tracking |
| `img/` | Placeholder photos (replace with real ones), favicon, logo art is inline SVG |

## Structure (2 screens as per brief)

1. **Hero** — school name + simple robot logo, headline
   *“Build Robots. Learn to Code. Have Fun!”*, sub-heading (Austin, TX),
   **“First Class FREE!”** offer badge, big CTA
   **“Book a FREE Trial Class”** (opens WhatsApp with a pre-filled message),
   photo collage placeholders (kids building LEGO WeDo / Arduino robots) and
   a location chip.
2. **Details** — *What Kids Will Learn* (LEGO WeDo & Arduino building,
   programming basics, engineering thinking, creativity & problem solving);
   *Meet Our Teachers* (4 compact cards, placeholder photos/bios);
   *Pricing* (first class $0 → weekly plans); *Location* (full address,
   embedded Google Map, Get Directions button); *Contact* (WhatsApp, phone,
   repeated CTA) plus a floating WhatsApp button.

## Before going live — replace placeholders

1. **WhatsApp number** — in `index.html` search-replace `15125550142`
   (all `wa.me` links) and in `script.js` set `WA_NUMBER`. Format: full
   international number, digits only.
2. **Google Analytics** — replace `G-XXXXXXXXXX` in `index.html` with your
   GA4 Measurement ID (or paste your GTM container snippet instead).
3. **Photos** — swap `img/*.png` files with real photos of students building
   LEGO Education WeDo & Arduino robots and teacher portraits (keep file names).
4. **Teacher bios, address, prices, hours** — update text in `index.html`.

## WhatsApp click tracking

Every tracked button carries `class="wa-track"` and `data-wa-src="<location>"`
(hero-main, header, pricing-trial, contact-main, floating-button…). On click,
`script.js` fires a GA4 event **`whatsapp_click`** with parameters
`link_source`, `link_text`, `has_child_age`, and also pushes the same event to
`window.dataLayer` so a GTM trigger can consume it. Define `whatsapp_click` as
a Key Event (conversion) in GA4 to use it for optimization.

Nice touch: on first visit the script politely asks the child's age once and
then auto-inserts it into every pre-filled WhatsApp message.

## Local preview

```bash
cd <project folder>
python3 -m http.server 8080
# open http://localhost:8080
```

(Any static host works for deployment: Netlify, Vercel, GitHub Pages, S3.)
